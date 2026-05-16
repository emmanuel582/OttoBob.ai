'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import ActivityItem from './ActivityItem';
import AddNoteForm from './AddNoteForm';
import ImportIMessageForm from './ImportIMessageForm';
import SendVideoForm from './SendVideoForm';
import { IconClipboard } from '@/components/ui/Icons';

export default function ActivityTimeline({ studentId, studentName, studentStatus }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('student_id', studentId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId, supabase]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Count video sends
  const videoCount = activities.filter(a => a.source === 'video' || a.source === 'heygen').length;

  if (loading) {
    return (
      <div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div className="skeleton" style={{ width: '10px', height: '10px', borderRadius: '50%', marginTop: '4px' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '60px', width: '100%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Send Video Form */}
      <SendVideoForm
        studentId={studentId}
        studentName={studentName}
        studentStatus={studentStatus}
        onVideoSent={fetchActivities}
      />

      {/* Add Note Form */}
      <AddNoteForm studentId={studentId} onNoteAdded={fetchActivities} />

      {/* Import iMessage */}
      <ImportIMessageForm studentId={studentId} onImported={fetchActivities} />

      {/* Timeline */}
      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#6b6b7b',
        }}>
          <IconClipboard size={32} style={{ color: '#4a4a58', marginBottom: '12px', margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', color: '#a0a0b0' }}>
            No activity yet
          </div>
          <div style={{ fontSize: '13px' }}>
            Send a video, add a note, or import iMessages to start the timeline
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#a0a0b0',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Activity Timeline — {activities.length} entr{activities.length === 1 ? 'y' : 'ies'}
            </div>
            {videoCount > 0 && (
              <div style={{
                fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                borderRadius: '10px', background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
              }}>
                {videoCount} video{videoCount !== 1 ? 's' : ''} sent
              </div>
            )}
          </div>
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
