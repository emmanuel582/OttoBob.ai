'use client';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        className="input-field"
        style={{
          paddingLeft: '42px',
          background: 'var(--color-bg-secondary)',
        }}
        placeholder={placeholder || 'Search by name, major, or email...'}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
