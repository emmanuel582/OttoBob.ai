'use client';

import { STUDENT_STATUSES } from '@/lib/constants';

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="hide-scrollbar" style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      overflowX: 'auto',
      paddingBottom: '8px',
      WebkitOverflowScrolling: 'touch',
      whiteSpace: 'nowrap',
    }}>
      <button
        className={`btn btn-sm ${!activeFilter ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => onFilterChange(null)}
        style={{ fontSize: '13px', flexShrink: 0 }}
      >
        All
      </button>
      {STUDENT_STATUSES.map(status => (
        <button
          key={status.value}
          onClick={() => onFilterChange(status.value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            flexShrink: 0,
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeFilter === status.value
              ? `1px solid ${status.color}`
              : '1px solid var(--color-border-subtle)',
            background: activeFilter === status.value
              ? status.bg
              : 'transparent',
            color: activeFilter === status.value
              ? status.color
              : 'var(--color-text-secondary)',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseOver={e => {
            if (activeFilter !== status.value) {
              e.target.style.borderColor = status.color;
              e.target.style.color = status.color;
            }
          }}
          onMouseOut={e => {
            if (activeFilter !== status.value) {
              e.target.style.borderColor = 'var(--color-border-subtle)';
              e.target.style.color = 'var(--color-text-secondary)';
            }
          }}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: status.color,
          }} />
          {status.label}
        </button>
      ))}
    </div>
  );
}
