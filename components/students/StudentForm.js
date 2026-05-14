'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { STUDENT_STATUSES, STUDENT_SOURCES } from '@/lib/constants';
import { IconUsers } from '@/components/ui/Icons';

const emptyStudent = {
  full_name: '',
  major: '',
  email: '',
  phone: '',
  source: '',
  status: 'applied',
  next_follow_up_date: '',
  notes: '',
};

export default function StudentForm({ student, onSave, onCancel }) {
  const [form, setForm] = useState(student ? {
    ...student,
    next_follow_up_date: student.next_follow_up_date || '',
  } : emptyStudent);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const isEditing = !!student;
  const supabase = createClient();

  function validate() {
    const errs = {};
    if (!form.full_name?.trim()) errs.full_name = 'Full name is required';
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
        full_name: form.full_name?.trim() || '',
        major: form.major?.trim() || null,
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        source: form.source || null,
        status: form.status,
        next_follow_up_date: form.next_follow_up_date || null,
        notes: form.notes?.trim() || null,
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
        const { data: newStudent, error } = await supabase
          .from('students')
          .insert(data)
          .select()
          .single();

        if (error) throw error;

        // Log student creation
        await supabase.from('activity_logs').insert({
          student_id: newStudent.id,
          source: 'system',
          author: 'System',
          content: `Student enrolled — ${newStudent.full_name}${newStudent.major ? ` at ${newStudent.major}` : ''}`,
        });

        // Log automatic welcome email
        if (newStudent.email) {
          await supabase.from('activity_logs').insert({
            student_id: newStudent.id,
            source: 'system',
            author: 'Bob (AI)',
            content: `Sent automatic welcome email to ${newStudent.email}`,
          });
        }

        toast.success('Student enrolled successfully');
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

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#a0a0b0',
    marginBottom: '6px',
  };

  const errorStyle = {
    fontSize: '12px',
    color: '#fca5a5',
    marginTop: '4px',
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageUpload(e) {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploadingImage(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      handleChange('photo_url', data.publicUrl);
      toast.success('Photo uploaded');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error uploading photo. Make sure avatars bucket exists and is public.');
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Photo Upload Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#18181f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px dashed #26262e'
        }}>
          {form.photo_url ? (
            <img src={form.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <IconUsers size={24} style={{ color: '#4a4a58' }} />
          )}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f4', marginBottom: '4px' }}>Profile Photo</div>
          <div style={{ fontSize: '12px', color: '#6b6b7b', marginBottom: '8px' }}>Recommended size: 256x256px</div>
          <label className="btn btn-secondary btn-sm" style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer', display: 'inline-block' }}>
            {uploadingImage ? 'Uploading...' : 'Upload Photo'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={uploadingImage}
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Full Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Full Name *</label>
          <input
            style={{ borderColor: errors.full_name ? '#ef4444' : undefined }}
            className="input-field"
            placeholder="e.g. John Doe"
            value={form.full_name}
            onChange={e => handleChange('full_name', e.target.value)}
          />
          {errors.full_name && <div style={errorStyle}>{errors.full_name}</div>}
        </div>

        {/* Major */}
        <div>
          <label style={labelStyle}>Major</label>
          <input
            className="input-field"
            placeholder="e.g. Computer Science"
            value={form.major}
            onChange={e => handleChange('major', e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={{ borderColor: errors.email ? '#ef4444' : undefined }}
            className="input-field"
            placeholder="student@university.edu"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
          />
          {errors.email && <div style={errorStyle}>{errors.email}</div>}
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            className="input-field"
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
          />
        </div>

        {/* Source */}
        <div>
          <label style={labelStyle}>Enrollment Source</label>
          <select
            className="input-field"
            style={{ cursor: 'pointer' }}
            value={form.source}
            onChange={e => handleChange('source', e.target.value)}
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
            className="input-field"
            style={{ cursor: 'pointer' }}
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
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
            className="input-field"
            value={form.next_follow_up_date}
            onChange={e => handleChange('next_follow_up_date', e.target.value)}
          />
        </div>

        {/* Notes */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Initial Notes</label>
          <textarea
            className="input-field"
            style={{ minHeight: '80px', resize: 'vertical' }}
            placeholder="Any initial notes about this student..."
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
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
        borderTop: '1px solid #1c1c24',
      }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : (isEditing ? 'Update Student' : 'Enroll Student')}
        </button>
      </div>

      <style jsx>{`
        select option {
          background: #111118;
          color: #f0f0f4;
        }
      `}</style>
    </form>
  );
}
