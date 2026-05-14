'use client';

import { formatStatus } from '@/lib/utils';

export default function StatusBadge({ status, size = 'default' }) {
  const className = `status-badge status-${status}`;
  
  return (
    <span 
      className={className}
      style={size === 'sm' ? { fontSize: '11px', padding: '2px 8px' } : {}}
    >
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'currentColor',
        display: 'inline-block',
        boxShadow: '0 0 6px currentColor',
      }} />
      {formatStatus(status)}
    </span>
  );
}
