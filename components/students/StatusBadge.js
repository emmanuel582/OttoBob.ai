'use client';

import { getStatusConfig } from '@/lib/constants';

export default function StatusBadge({ status, size = 'default' }) {
  const config = getStatusConfig(status);
  const label = config?.label || status;
  
  return (
    <span 
      className={`status-badge status-${status}`}
      style={size === 'sm' ? { fontSize: '11px', padding: '2px 8px' } : {}}
    >
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'currentColor',
        display: 'inline-block',
      }} />
      {label}
    </span>
  );
}
