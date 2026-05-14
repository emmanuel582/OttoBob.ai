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
        All Students
      </button>
      {STUDENT_STATUSES.map(status => {
        const isActive = activeFilter === status.value;
        return (
          <button
            key={status.value}
            onClick={() => onFilterChange(status.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              flexShrink: 0,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: isActive
                ? `1px solid ${status.color}`
                : '1px solid #1c1c24',
              background: isActive
                ? status.bg
                : 'transparent',
              color: isActive
                ? status.color
                : '#a0a0b0',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseOver={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#26262e';
                e.currentTarget.style.color = '#f0f0f4';
                e.currentTarget.style.background = '#18181f';
              }
            }}
            onMouseOut={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#1c1c24';
                e.currentTarget.style.color = '#a0a0b0';
                e.currentTarget.style.background = 'transparent';
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
        );
      })}
    </div>
  );
}
