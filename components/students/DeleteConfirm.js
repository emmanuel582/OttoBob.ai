'use client';

import { IconAlertTriangle } from '@/components/ui/Icons';

export default function DeleteConfirm({ studentName, onConfirm, onCancel, deleting }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '8px 0',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <IconAlertTriangle size={28} style={{ color: '#ef4444' }} />
        </div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}>
          Delete Student
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          maxWidth: '360px',
        }}>
          Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>{studentName}</strong>? 
          This will permanently remove all associated activity logs and cannot be undone.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        justifyContent: 'center',
      }}>
        <button className="btn btn-secondary" onClick={onCancel} disabled={deleting}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete Student'}
        </button>
      </div>
    </div>
  );
}
