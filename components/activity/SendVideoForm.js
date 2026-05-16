'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { IconVideo, IconPlay, IconZap, IconChevronDown } from '@/components/ui/Icons';
import { getRecommendedVideos, getBobRecommendation, VIDEO_CATEGORIES } from '@/lib/videos';

export default function SendVideoForm({ studentId, studentName, studentStatus, onVideoSent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [message, setMessage] = useState('');
  const [videoMode, setVideoMode] = useState('pre-created'); // 'pre-created' | 'heygen'

  const toast = useToast();
  const supabase = createClient();

  const recommendation = getBobRecommendation(studentStatus);
  const recommendedVideos = getRecommendedVideos(studentStatus);

  useEffect(() => {
    setVideoMode(recommendation.type);
    if (recommendation.type === 'pre-created' && recommendedVideos.length > 0) {
      setSelectedVideo(recommendedVideos[0]);
    }
  }, [studentStatus]);

  async function handleSend(e) {
    e.preventDefault();
    setLoading(true);

    try {
      let finalUrl = '';
      let source = '';
      let videoTitle = '';

      if (videoMode === 'heygen') {
        // Simulated HeyGen generation (would be real API call in production)
        finalUrl = `https://app.heygen.com/video/ottobob-${studentId.slice(0, 8)}-${Date.now()}`;
        source = 'heygen';
        videoTitle = `Personalized video for ${studentName || 'Student'}`;
      } else {
        if (!selectedVideo) {
          toast.error('Please select a video');
          setLoading(false);
          return;
        }
        // Build URL from Supabase storage
        const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(selectedVideo.fileName);
        finalUrl = publicUrlData?.publicUrl || `[Pre-created] ${selectedVideo.title}`;
        source = 'video';
        videoTitle = selectedVideo.title;
      }

      const logContent = [
        `📹 Video Sent: ${videoTitle}`,
        `Source: ${source === 'heygen' ? 'HeyGen (On-Demand)' : 'Pre-created Library'}`,
        `URL: ${finalUrl}`,
        message ? `\nMessage: ${message}` : '',
      ].filter(Boolean).join('\n');

      const { error } = await supabase.from('activity_logs').insert({
        student_id: studentId,
        source: source,
        author: 'Bob (AI)',
        content: logContent,
      });

      if (error) throw error;

      setMessage('');
      setIsExpanded(false);
      toast.success(`${source === 'heygen' ? 'HeyGen video generated' : 'Video sent'} successfully`);
      onVideoSent?.();
    } catch (err) {
      console.error('Error sending video:', err);
      toast.error('Failed to send video');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: '#111118',
      border: '1px solid #1c1c24',
      borderRadius: '10px',
      marginBottom: '20px',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {/* Collapsed Header — Always Visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          transition: 'background 0.15s ease',
        }}
        onMouseOver={e => e.currentTarget.style.background = '#18181f'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'rgba(0, 229, 255, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconVideo size={14} style={{ color: '#00e5ff' }} />
        </div>
        <span style={{
          fontSize: '13px', fontWeight: 600, color: '#f0f0f4',
          letterSpacing: '0.01em',
        }}>
          Send Video to Student
        </span>
        {/* Bob confidence pill */}
        <span style={{
          fontSize: '11px', fontWeight: 600, padding: '2px 8px',
          borderRadius: '10px', marginLeft: '4px',
          background: recommendation.type === 'heygen' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
          color: recommendation.type === 'heygen' ? '#8b5cf6' : '#10b981',
        }}>
          Bob: {recommendation.confidence}% confident
        </span>
        <div style={{
          marginLeft: 'auto',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          color: '#6b6b7b',
        }}>
          <IconChevronDown size={14} />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <form onSubmit={handleSend} style={{ padding: '0 16px 16px' }}>
          {/* Bob Recommendation Banner */}
          <div style={{
            background: recommendation.type === 'heygen'
              ? 'rgba(139, 92, 246, 0.08)'
              : 'rgba(0, 229, 255, 0.06)',
            border: `1px solid ${recommendation.type === 'heygen' ? 'rgba(139,92,246,0.2)' : 'rgba(0,229,255,0.15)'}`,
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: recommendation.type === 'heygen' ? 'rgba(139,92,246,0.2)' : 'rgba(0,229,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '1px',
            }}>
              <IconZap size={12} style={{ color: recommendation.type === 'heygen' ? '#8b5cf6' : '#00e5ff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px', fontWeight: 600, marginBottom: '3px',
                color: recommendation.type === 'heygen' ? '#8b5cf6' : '#00e5ff',
              }}>
                Bob Recommends: {recommendation.type === 'heygen' ? 'On-Demand HeyGen Video' : 'Pre-created Video'}
              </div>
              <div style={{ fontSize: '12px', color: '#a0a0b0', lineHeight: 1.5 }}>
                {recommendation.reason}
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: '#0a0a0f',
            border: '1px solid #1c1c24',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '16px',
          }}>
            <button
              type="button"
              onClick={() => setVideoMode('pre-created')}
              style={{
                flex: 1, padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600,
                background: videoMode === 'pre-created' ? '#18181f' : 'transparent',
                color: videoMode === 'pre-created' ? '#10b981' : '#6b6b7b',
                transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <IconPlay size={12} /> Pre-created
            </button>
            <button
              type="button"
              onClick={() => setVideoMode('heygen')}
              style={{
                flex: 1, padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600,
                background: videoMode === 'heygen' ? '#18181f' : 'transparent',
                color: videoMode === 'heygen' ? '#8b5cf6' : '#6b6b7b',
                transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <IconZap size={12} /> HeyGen On-Demand
            </button>
          </div>

          {/* Pre-created Video Selection */}
          {videoMode === 'pre-created' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                color: '#a0a0b0', marginBottom: '8px', textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                Select Video
              </label>
              <div style={{
                maxHeight: '220px', overflowY: 'auto',
                borderRadius: '8px', border: '1px solid #1c1c24',
                background: '#0a0a0f',
              }}>
                {recommendedVideos.map((video, i) => {
                  const isSelected = selectedVideo?.id === video.id;
                  const catConfig = VIDEO_CATEGORIES[video.category];
                  const isRecommended = video.recommended_for.includes(studentStatus);

                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setSelectedVideo(video)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', border: 'none', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', textAlign: 'left',
                        background: isSelected ? 'rgba(0, 229, 255, 0.06)' : 'transparent',
                        borderBottom: i < recommendedVideos.length - 1 ? '1px solid #1c1c24' : 'none',
                        borderLeft: isSelected ? '2px solid #00e5ff' : '2px solid transparent',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = '#111118'; }}
                      onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Play icon */}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '6px',
                        background: isSelected ? 'rgba(0,229,255,0.12)' : '#18181f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <IconPlay size={12} style={{ color: isSelected ? '#00e5ff' : '#6b6b7b' }} />
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px', fontWeight: 500,
                          color: isSelected ? '#f0f0f4' : '#a0a0b0',
                          marginBottom: '2px',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                          {video.title}
                          {isRecommended && (
                            <span style={{
                              fontSize: '9px', fontWeight: 700, padding: '1px 5px',
                              borderRadius: '3px', background: 'rgba(0,229,255,0.12)',
                              color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                              Recommended
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '11px', color: '#6b6b7b',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          <span style={{
                            fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
                            background: catConfig.bg, color: catConfig.color, fontWeight: 600,
                          }}>
                            {catConfig.label}
                          </span>
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* HeyGen On-Demand Info */}
          {videoMode === 'heygen' && (
            <div style={{
              background: '#0a0a0f', border: '1px solid #1c1c24', borderRadius: '8px',
              padding: '16px', marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
              }}>
                <IconZap size={14} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f4' }}>
                  Personalized AI Video
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>
                Bob will generate a personalized HeyGen video for <strong style={{ color: '#f0f0f4' }}>{studentName || 'this student'}</strong>.
                This uses AI avatar technology to create a custom video addressing the student by name with tailored content based on their pipeline stage.
              </p>
              <div style={{
                display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid #1c1c24',
              }}>
                <div style={{ fontSize: '11px', color: '#6b6b7b' }}>
                  <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Est. Generation:</span> ~30 seconds
                </div>
                <div style={{ fontSize: '11px', color: '#6b6b7b' }}>
                  <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Type:</span> Personalized Outreach
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: 600,
              color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Accompanying Message <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              className="input-field"
              style={{ minHeight: '60px', resize: 'vertical', width: '100%' }}
              placeholder="Add a personal message to send with the video..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsExpanded(false)}
              style={{ fontSize: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || (videoMode === 'pre-created' && !selectedVideo)}
              style={{
                gap: '8px',
                background: videoMode === 'heygen'
                  ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                  : undefined,
              }}
            >
              {videoMode === 'heygen' ? <IconZap size={14} /> : <IconPlay size={14} />}
              {loading
                ? (videoMode === 'heygen' ? 'Generating...' : 'Sending...')
                : (videoMode === 'heygen' ? 'Generate & Send HeyGen' : 'Send Pre-created Video')
              }
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
