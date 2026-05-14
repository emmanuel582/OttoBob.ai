'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { IconNote } from '@/components/ui/Icons';

export default function AddNoteForm({ leadId, onNoteAdded }) {
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
        student_id: leadId,
        source: 'manual',
        author: 'Brad',
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
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <IconNote size={16} style={{ color: 'var(--color-text-secondary)' }} />
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
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
