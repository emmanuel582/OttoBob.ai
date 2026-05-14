/**
 * Format a date to a readable string
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp to a readable date + time
 */
export function formatTimestamp(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

/**
 * Parse iMessage conversation text into individual messages
 * Supports formats like:
 *   [5/7/26, 2:30 PM] Brad: Hey, checking in on the proposal
 *   May 7, 2026 2:30 PM - Brad: Hey, checking in
 *   Brad (5/7/26 2:30 PM): Hey, checking in
 */
export function parseIMessages(text) {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n').filter(line => line.trim());
  const messages = [];

  // Pattern 1: [date, time] Author: Message
  const pattern1 = /^\[(.+?)\]\s*(.+?):\s*(.+)$/;
  // Pattern 2: Date Time - Author: Message
  const pattern2 = /^(.+?\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(.+?):\s*(.+)$/i;
  // Pattern 3: Author (date time): Message
  const pattern3 = /^(.+?)\s*\((.+?)\):\s*(.+)$/;
  // Pattern 4: Simple - just treat each line as a message
  const pattern4 = /^(.+?):\s*(.+)$/;

  for (const line of lines) {
    let match;

    if ((match = line.match(pattern1))) {
      messages.push({
        timestamp: parseFlexibleDate(match[1]),
        author: match[2].trim(),
        content: match[3].trim(),
      });
    } else if ((match = line.match(pattern2))) {
      messages.push({
        timestamp: parseFlexibleDate(match[1]),
        author: match[2].trim(),
        content: match[3].trim(),
      });
    } else if ((match = line.match(pattern3))) {
      messages.push({
        timestamp: parseFlexibleDate(match[2]),
        author: match[1].trim(),
        content: match[3].trim(),
      });
    } else if ((match = line.match(pattern4))) {
      messages.push({
        timestamp: new Date().toISOString(),
        author: match[1].trim(),
        content: match[2].trim(),
      });
    } else if (line.trim()) {
      // Treat as continuation of previous message or standalone
      if (messages.length > 0) {
        messages[messages.length - 1].content += '\n' + line.trim();
      } else {
        messages.push({
          timestamp: new Date().toISOString(),
          author: 'Unknown',
          content: line.trim(),
        });
      }
    }
  }

  return messages;
}

/**
 * Parse flexible date formats
 */
function parseFlexibleDate(dateStr) {
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();

    // Try MM/DD/YY format
    const parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (parts) {
      const year = parts[3].length === 2 ? '20' + parts[3] : parts[3];
      const timeMatch = dateStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      const timeStr = timeMatch ? ' ' + timeMatch[1] : '';
      return new Date(`${year}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}${timeStr}`).toISOString();
    }

    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Debounce function for search
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format status for display
 */
export function formatStatus(status) {
  if (!status) return '';
  return status.split('_').map(capitalize).join(' ');
}
