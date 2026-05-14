'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { parseIMessages } from '@/lib/utils';
import { IconMessageCircle, IconX } from '@/components/ui/Icons';

export default function ImportIMessageForm({ leadId, onImported }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();
  const supabase = createClient();

  function handleTextChange(value) {
    setText(value);
    if (value.trim()) {
      const parsed = parseIMessages(value);
      setPreview(parsed);
    } else {
      setPreview([]);
    }
  }

  async function handleImport() {
    if (preview.length === 0) return;

    setImporting(true);
    try {
      const rows = preview.map(msg => ({
        student_id: leadId,
        source: 'imessage',
        author: msg.author,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      const { error } = await supabase.from('activity_logs').insert(rows);
      if (error) throw error;

      toast.success(`${rows.length} iMessage${rows.length > 1 ? 's' : ''} imported`);
      setText('');
      setPreview([]);
      setShowForm(false);
      onImported?.();
    } catch (err) {
      console.error('Error importing iMessages:', err);
      toast.error('Failed to import messages');
    } finally {
      setImporting(false);
    }
  }

  if (!showForm) {
    return (
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setShowForm(true)}
        style={{ marginBottom: '16px', gap: '6px' }}
      >
        <IconMessageCircle size={14} />
        Import iMessages
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconMessageCircle size={16} style={{ color: 'var(--color-accent-blue)' }} />
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            Import iMessage Conversation
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setShowForm(false); setText(''); setPreview([]); }}
          style={{ fontSize: '12px', gap: '4px' }}
        >
          <IconX size={12} />
          Close
        </button>
      </div>

      <p style={{
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        marginBottom: '12px',
        lineHeight: 1.5,
      }}>
        Paste your iMessage conversation below. Supported formats:<br />
        • [5/7/26, 2:30 PM] Brad: Message text<br />
        • May 7, 2026 2:30 PM - Brad: Message text<br />
        • Brad: Message text (will use current time)
      </p>

      <textarea
        className="input-field"
        style={{
          minHeight: '120px',
          resize: 'vertical',
          marginBottom: '12px',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}
        placeholder="Paste iMessage conversation here..."
        value={text}
        onChange={e => handleTextChange(e.target.value)}
      />

      {/* Preview */}
      {preview.length > 0 && (
        <div style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '12px',
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-accent-blue)',
            marginBottom: '8px',
          }}>
            Preview — {preview.length} message{preview.length > 1 ? 's' : ''} detected
          </div>
          {preview.map((msg, i) => (
            <div key={i} style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              padding: '6px 0',
              borderBottom: i < preview.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
            }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>{msg.author}:</strong>{' '}
              {msg.content}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleImport}
          disabled={importing || preview.length === 0}
        >
          {importing ? 'Importing...' : `Import ${preview.length} Message${preview.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
