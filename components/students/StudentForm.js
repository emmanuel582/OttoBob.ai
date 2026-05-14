'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { STUDENT_STATUSES, STUDENT_SOURCES } from '@/lib/constants';

const emptyLead = {
  full_name: '',
  major: '',
  email: '',
  phone: '',
  source: '',
  status: 'applied',
  next_follow_up_date: '',
  notes: '',
};

export default function LeadForm({ student, onSave, onCancel }) {
  const [form, setForm] = useState(student ? {
    ...student,
    next_follow_up_date: student.next_follow_up_date || '',
  } : emptyLead);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const isEditing = !!student;
  const supabase = createClient();

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        full_name: form.full_name.trim(),
        major: form.major.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        source: form.source || null,
        status: form.status,
        next_follow_up_date: form.next_follow_up_date || null,
        notes: form.notes.trim() || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('students')
          .update(data)
          .eq('id', student.id);

        if (error) throw error;

        // Log status change if status changed
        if (student.status !== form.status) {
          await supabase.from('activity_logs').insert({
            student_id: student.id,
            source: 'system',
            author: 'System',
            content: `Status changed from "${student.status.replace('_', ' ')}" to "${form.status.replace('_', ' ')}"`,
          });
        }

        // Log general update
        await supabase.from('activity_logs').insert({
          student_id: student.id,
          source: 'system',
          author: 'System',
          content: 'Student information updated',
        });

        toast.success('Student updated successfully');
      } else {
        const { data: newLead, error } = await supabase
          .from('students')
          .insert(data)
          .select()
          .single();

        if (error) throw error;

        // Log student creation
        await supabase.from('activity_logs').insert({
          student_id: newLead.id,
          source: 'system',
          author: 'System',
          content: `Student created — ${newLead.full_name}${newLead.major ? ` at ${newLead.major}` : ''}`,
        });

        // Log automatic welcome email
        if (newLead.email) {
          await supabase.from('activity_logs').insert({
            student_id: newLead.id,
            source: 'system',
            author: 'Bob (AI)',
            content: `Sent automatic welcome email to ${newLead.email}`,
          });
        }

        toast.success('Student created successfully');
      }

      onSave?.();
    } catch (err) {
      console.error('Error saving student:', err);
      toast.error('Failed to save student: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
  };

  const errorStyle = {
    fontSize: '12px',
    color: 'var(--color-accent-red)',
    marginTop: '4px',
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Full Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Full Name *</label>
          <input
            style={{
              ...inputStyle,
              borderColor: errors.full_name ? 'var(--color-accent-red)' : undefined,
            }}
            placeholder="e.g. Dr. Sarah Johnson"
            value={form.full_name}
            onChange={e => handleChange('full_name', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = errors.full_name ? 'var(--color-accent-red)' : 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          />
          {errors.full_name && <div style={errorStyle}>{errors.full_name}</div>}
        </div>

        {/* Major */}
        <div>
          <label style={labelStyle}>Major</label>
          <input
            style={inputStyle}
            placeholder="e.g. Pacific Dental"
            value={form.major}
            onChange={e => handleChange('major', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={{
              ...inputStyle,
              borderColor: errors.email ? 'var(--color-accent-red)' : undefined,
            }}
            placeholder="sarah@example.com"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = errors.email ? 'var(--color-accent-red)' : 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          />
          {errors.email && <div style={errorStyle}>{errors.email}</div>}
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            style={inputStyle}
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Source */}
        <div>
          <label style={labelStyle}>Student Source</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={form.source}
            onChange={e => handleChange('source', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          >
            <option value="">Select source</option>
            {STUDENT_SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          >
            {STUDENT_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Follow-up Date */}
        <div>
          <label style={labelStyle}>Next Follow-up Date</label>
          <input
            type="date"
            style={inputStyle}
            value={form.next_follow_up_date}
            onChange={e => handleChange('next_follow_up_date', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Notes */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Any initial notes about this student..."
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-subtle)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid var(--color-border-subtle)',
      }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? (
            <>
              <span style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.6s linear infinite',
              }} />
              Saving...
            </>
          ) : (
            isEditing ? 'Update Student' : 'Create Student'
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        select option {
          background: #111827;
          color: #f1f5f9;
        }
      `}</style>
    </form>
  );
}
