'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { IconNote } from '@/components/ui/Icons';

export default function AddNoteForm({ studentId, onNoteAdded }) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('activity_logs').insert({
        student_id: studentId,
        source: 'manual',
        author: 'Admin',
        content: content.trim(),
      });

      if (error) throw error;

      setContent('');
      toast.success('Note added');
      onNoteAdded?.();
    } catch (err) {
      console.error('Error adding note:', err);
      toast.error('Failed to add note');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#111118',
      border: '1px solid #1c1c24',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <IconNote size={16} style={{ color: '#a0a0b0' }} />
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#f0f0f4',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Add Note
        </span>
      </div>
      <textarea
        className="input-field"
        style={{ minHeight: '80px', resize: 'vertical', marginBottom: '12px' }}
        placeholder="Type your note here..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={saving || !content.trim()}
        >
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </div>
    </form>
  );
}
