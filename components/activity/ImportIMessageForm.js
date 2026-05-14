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
      background: '#111118',
      border: '1px solid #1c1c24',
      borderRadius: '8px',
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
          <IconMessageCircle size={16} style={{ color: '#3b82f6' }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#f0f0f4',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Import iMessage
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
        color: '#6b6b7b',
        marginBottom: '12px',
        lineHeight: 1.5,
      }}>
        Paste your iMessage conversation below. Supported formats:<br />
        • [5/7/26, 2:30 PM] Admin: Message text<br />
        • May 7, 2026 2:30 PM - Admin: Message text<br />
        • Admin: Message text (will use current time)
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
          background: '#0a0a0f',
          border: '1px solid #1c1c24',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '12px',
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#3b82f6',
            marginBottom: '8px',
          }}>
            Preview — {preview.length} message{preview.length > 1 ? 's' : ''} detected
          </div>
          {preview.map((msg, i) => (
            <div key={i} style={{
              fontSize: '13px',
              color: '#a0a0b0',
              padding: '6px 0',
              borderBottom: i < preview.length - 1 ? '1px solid #1c1c24' : 'none',
            }}>
              <strong style={{ color: '#f0f0f4' }}>{msg.author}:</strong>{' '}
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
