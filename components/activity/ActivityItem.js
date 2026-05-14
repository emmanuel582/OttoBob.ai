'use client';

import { formatTimestamp } from '@/lib/utils';
import { ACTIVITY_SOURCES } from '@/lib/constants';
import { IconMessageCircle, IconNote, IconSettings } from '@/components/ui/Icons';

const sourceIcons = {
  imessage: IconMessageCircle,
  manual: IconNote,
  system: IconSettings,
};

export default function ActivityItem({ activity, style: customStyle }) {
  const sourceConfig = ACTIVITY_SOURCES[activity.source] || ACTIVITY_SOURCES.manual;
  const IconComponent = sourceIcons[activity.source] || IconNote;

  const dotColors = {
    imessage: '#3b82f6',
    manual: '#94a3b8',
    system: '#06b6d4',
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        gap: '16px',
        position: 'relative',
        paddingBottom: '24px',
        ...customStyle,
      }}
    >
      {/* Timeline dot */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: dotColors[activity.source] || '#94a3b8',
          boxShadow: `0 0 8px ${dotColors[activity.source] || '#94a3b8'}40`,
          marginTop: '4px',
          flexShrink: 0,
        }} />
        <div style={{
          width: '2px',
          flex: 1,
          background: 'linear-gradient(to bottom, var(--color-border-subtle), transparent)',
          marginTop: '4px',
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px',
          flexWrap: 'wrap',
        }}>
          <IconComponent size={14} style={{ color: sourceConfig.color, flexShrink: 0 }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {activity.author || 'System'}
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '6px',
            background: `${sourceConfig.color}20`,
            color: sourceConfig.color,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {sourceConfig.label}
          </span>
          <span style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            marginLeft: 'auto',
          }}>
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>

        {/* Content body */}
        <div style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          background: 'var(--color-bg-primary)',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid var(--color-border-subtle)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {activity.content}
        </div>
      </div>
    </div>
  );
}
