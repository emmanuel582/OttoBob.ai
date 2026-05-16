// Student pipeline statuses
export const STUDENT_STATUSES = [
  { value: 'applied', label: 'Applied', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { value: 'contacted', label: 'Contacted', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { value: 'interviewing', label: 'Interviewing', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  { value: 'approved', label: 'Approved', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { value: 'active', label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
];

// Activity log source types — using SVG-compatible identifiers (no emojis)
export const ACTIVITY_SOURCES = {
  imessage: { label: 'iMessage', color: '#3b82f6' },
  manual: { label: 'Manual Note', color: '#94a3b8' },
  system: { label: 'System', color: '#06b6d4' },
  video: { label: 'Pre-created Video', color: '#10b981' },
  heygen: { label: 'HeyGen Video', color: '#8b5cf6' },
};

// Student source options — tailored to OttoBob.ai Student Management
export const STUDENT_SOURCES = [
  'Facebook Ads',
  'Instagram Ads',
  'Referral',
  'Website',
  'Cold Call',
  'iMessage',
  'Trade Show',
  'Email Campaign',
  'Walk-in',
  'Other',
];

export function getStatusConfig(status) {
  return STUDENT_STATUSES.find(s => s.value === status) || STUDENT_STATUSES[0];
}
