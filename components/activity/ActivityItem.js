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

const dotColors = {
  imessage: '#3b82f6',
  manual: '#a0a0b0',
  system: '#00e5ff',
  video: '#10b981',
  heygen: '#8b5cf6',
};

// Parse video content to render URLs as clickable links
function renderContent(content, source) {
  if (source !== 'video' && source !== 'heygen') {
    return <span>{content}</span>;
  }

  // Split content into lines and render URLs as links
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Match URLs in the line
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = line.split(urlRegex);

    return (
      <div key={i} style={{ marginBottom: i < lines.length - 1 ? '2px' : 0 }}>
        {parts.map((part, j) => {
          if (urlRegex.test(part)) {
            // Reset regex lastIndex
            urlRegex.lastIndex = 0;
            return (
              <a
                key={j}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: source === 'heygen' ? '#8b5cf6' : '#10b981',
                  textDecoration: 'none',
                  borderBottom: `1px dashed ${source === 'heygen' ? '#8b5cf640' : '#10b98140'}`,
                  wordBreak: 'break-all',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                {part}
              </a>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </div>
    );
  });
}

export default function ActivityItem({ activity, style: customStyle }) {
  const sourceConfig = ACTIVITY_SOURCES[activity.source] || ACTIVITY_SOURCES.manual;
  const IconComponent = sourceIcons[activity.source] || IconNote;
  const isVideo = activity.source === 'video' || activity.source === 'heygen';

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
          boxShadow: isVideo ? `0 0 6px ${dotColors[activity.source]}60` : 'none',
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
            background: isVideo ? `${sourceConfig.color}15` : 'transparent',
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
          background: isVideo
            ? `linear-gradient(135deg, #0a0a0f 0%, ${activity.source === 'heygen' ? '#0d0a14' : '#0a0f0d'} 100%)`
            : '#0a0a0f',
          padding: '12px 16px',
          borderRadius: '8px',
          border: `1px solid ${isVideo ? `${dotColors[activity.source]}25` : '#1c1c24'}`,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {renderContent(activity.content, activity.source)}
        </div>
      </div>
    </div>
  );
}
