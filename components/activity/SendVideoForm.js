'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { IconVideo, IconPlay, IconZap } from '@/components/ui/Icons';

const PRE_CREATED_VIDEOS = [
  { id: 'v1', title: 'Welcome to Otto University', url: 'https://storage.supabase.com/videos/welcome.mp4' },
  { id: 'v2', title: 'How the Mac Mini Program Works', url: 'https://storage.supabase.com/videos/mac-mini.mp4' },
  { id: 'v3', title: 'Growing Local Businesses with Bob', url: 'https://storage.supabase.com/videos/bob-growth.mp4' },
];

export default function SendVideoForm({ studentId, studentStatus, onVideoSent }) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [message, setMessage] = useState('');

  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    // Bob's Recommendation Logic based on strong conversion signals
    if (studentStatus === 'interviewing' || studentStatus === 'approved') {
      setRecommendation({ type: 'heygen', reason: 'Strong conversion signal detected based on status.' });
    } else {
      setRecommendation({ type: 'pre-created', reason: 'Early stage student. Pre-created video recommended.' });
      setSelectedVideoUrl(PRE_CREATED_VIDEOS[0].url);
    }
  }, [studentStatus]);

  async function handleSend(e) {
    e.preventDefault();
    setLoading(true);

    try {
      let finalUrl = selectedVideoUrl;
      let source = recommendation?.type === 'heygen' ? 'heygen' : 'video';

      // Simulate HeyGen generation
      if (recommendation?.type === 'heygen') {
        finalUrl = 'https://heygen.com/generated-video-' + Date.now() + '.mp4';
      }

      if (!finalUrl) throw new Error('No video selected');

      const { error } = await supabase.from('activity_logs').insert({
        student_id: studentId,
        source: source,
        author: 'Bob (AI)',
        content: `Sent Video: ${finalUrl}\n\nMessage: ${message || 'No message attached.'}`,
      });

      if (error) throw error;

      setMessage('');
      toast.success('Video sent successfully');
      onVideoSent?.();
    } catch (err) {
      console.error('Error sending video:', err);
      toast.error('Failed to send video');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSend} style={{
      background: '#111118',
      border: '1px solid #1c1c24',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <IconVideo size={16} style={{ color: '#a0a0b0' }} />
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#f0f0f4',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Send Video
        </span>
      </div>

      {recommendation && (
        <div style={{
          background: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <IconZap size={16} style={{ color: '#00e5ff', marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#00e5ff', marginBottom: '4px' }}>
              Bob Recommends: {recommendation.type === 'heygen' ? 'On-Demand HeyGen Video' : 'Pre-created Video'}
            </div>
            <div style={{ fontSize: '13px', color: '#a0a0b0' }}>
              {recommendation.reason}
            </div>
          </div>
        </div>
      )}

      {recommendation?.type === 'pre-created' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '8px' }}>Select Pre-created Video</label>
          <select
            className="input-field"
            value={selectedVideoUrl}
            onChange={e => setSelectedVideoUrl(e.target.value)}
            style={{ width: '100%' }}
          >
            {PRE_CREATED_VIDEOS.map(video => (
              <option key={video.id} value={video.url}>{video.title}</option>
            ))}
          </select>
        </div>
      )}

      <textarea
        className="input-field"
        style={{ minHeight: '60px', resize: 'vertical', marginBottom: '12px', width: '100%' }}
        placeholder="Add a message to accompany the video..."
        value={message}
        onChange={e => setMessage(e.target.value)}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={loading || (recommendation?.type === 'pre-created' && !selectedVideoUrl)}
          style={{ gap: '8px' }}
        >
          {recommendation?.type === 'heygen' ? <IconZap size={14} /> : <IconPlay size={14} />}
          {loading ? 'Sending...' : recommendation?.type === 'heygen' ? 'Generate & Send HeyGen' : 'Send Video'}
        </button>
      </div>
    </form>
  );
}
