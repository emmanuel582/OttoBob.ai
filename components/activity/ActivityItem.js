'use client';

import { formatTimestamp } from '@/lib/utils';
import { ACTIVITY_SOURCES } from '@/lib/constants';
import { IconMessageCircle, IconNote, IconSettings, IconVideo, IconPlay } from '@/components/ui/Icons';

const sourceIcons = {
  imessage: IconMessageCircle,
  manual: IconNote,
  system: IconSettings,
  video: IconPlay,
  heygen: IconVideo,
};

export default function ActivityItem({ activity, style: customStyle }) {
  const sourceConfig = ACTIVITY_SOURCES[activity.source] || ACTIVITY_SOURCES.manual;
  const IconComponent = sourceIcons[activity.source] || IconNote;

  const dotColors = {
    imessage: '#3b82f6',
    manual: '#a0a0b0',
    system: '#00e5ff',
    video: '#10b981',
    heygen: '#8b5cf6',
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
          background: dotColors[activity.source] || '#a0a0b0',
          marginTop: '4px',
          flexShrink: 0,
        }} />
        <div style={{
          width: '1px',
          flex: 1,
          background: '#26262e',
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
            color: '#f0f0f4',
          }}>
            {activity.author || 'System'}
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'transparent',
            border: `1px solid ${sourceConfig.color}40`,
            color: sourceConfig.color,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {sourceConfig.label}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#6b6b7b',
            marginLeft: 'auto',
          }}>
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>

        {/* Content body */}
        <div style={{
          fontSize: '14px',
          color: '#a0a0b0',
          lineHeight: 1.6,
          background: '#0a0a0f',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #1c1c24',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {activity.content}
        </div>
      </div>
    </div>
  );
}
