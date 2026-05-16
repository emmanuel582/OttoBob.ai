'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { IconVideo, IconPlay, IconTrash, IconPlus, IconSearch, IconZap } from '@/components/ui/Icons';
import { CORE_VIDEOS, VIDEO_CATEGORIES } from '@/lib/videos';

export default function VideosPage() {
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'uploaded'
  const [copiedId, setCopiedId] = useState(null);

  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    fetchUploadedVideos();
  }, []);

  async function fetchUploadedVideos() {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from('videos').list();
      if (error) throw error;

      const videoList = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(file.name);
          return {
            id: file.id,
            name: file.name,
            url: publicUrlData.publicUrl,
            created_at: file.created_at,
            size: file.metadata?.size || 0,
          };
        });

      setUploadedVideos(videoList);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be under 100MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error } = await supabase.storage.from('videos').upload(fileName, file);
      if (error) throw error;

      toast.success('Video uploaded successfully');
      fetchUploadedVideos();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(videoName) {
    if (!confirm(`Delete "${videoName}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.storage.from('videos').remove([videoName]);
      if (error) throw error;

      toast.success('Video deleted');
      fetchUploadedVideos();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete video');
    }
  }

  function handleCopyUrl(url, id) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filter catalog videos by search
  const filteredCatalog = CORE_VIDEOS.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter uploaded videos by search
  const filteredUploaded = uploadedVideos.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Header title="Video Library" subtitle="Manage pre-created videos & HeyGen integration for Bob">
        <label className="btn btn-primary" style={{ cursor: 'pointer', gap: '8px' }}>
          <IconPlus size={14} />
          {uploading ? 'Uploading...' : 'Upload Video'}
          <input
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </Header>

      <div className="page-container" style={{ maxWidth: '1200px' }}>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div className="card animate-fade-in" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b6b7b' }}>Core Catalog</span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px', background: '#18181f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconPlay size={13} style={{ color: '#10b981' }} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
              {CORE_VIDEOS.length}
            </div>
            <div style={{ fontSize: '11px', color: '#6b6b7b', marginTop: '2px' }}>pre-created videos</div>
          </div>

          <div className="card animate-fade-in" style={{ padding: '18px', animationDelay: '50ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b6b7b' }}>Uploaded</span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px', background: '#18181f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconVideo size={13} style={{ color: '#3b82f6' }} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
              {loading ? <div className="skeleton" style={{ width: '30px', height: '28px' }} /> : uploadedVideos.length}
            </div>
            <div style={{ fontSize: '11px', color: '#6b6b7b', marginTop: '2px' }}>in Supabase storage</div>
          </div>

          <div className="card animate-fade-in" style={{ padding: '18px', animationDelay: '100ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b6b7b' }}>HeyGen</span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px', background: '#18181f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconZap size={13} style={{ color: '#8b5cf6' }} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
              On-Demand
            </div>
            <div style={{ fontSize: '11px', color: '#6b6b7b', marginTop: '2px' }}>triggered by Bob</div>
          </div>

          <div className="card animate-fade-in" style={{ padding: '18px', animationDelay: '150ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b6b7b' }}>Categories</span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px', background: '#18181f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconSearch size={13} style={{ color: '#f59e0b' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              {Object.entries(VIDEO_CATEGORIES).map(([key, cat]) => (
                <span key={key} style={{
                  fontSize: '10px', fontWeight: 600, padding: '3px 8px',
                  borderRadius: '4px', background: cat.bg, color: cat.color,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {cat.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Tab Controls */}
        <div className="card" style={{ padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderBottom: '1px solid #1c1c24',
            flexWrap: 'wrap',
          }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#0a0a0f', border: '1px solid #1c1c24', borderRadius: '8px',
              padding: '8px 12px', flex: 1, minWidth: '200px',
            }}>
              <IconSearch size={14} style={{ color: '#6b6b7b', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#f0f0f4', fontSize: '13px', width: '100%',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '4px', background: '#0a0a0f',
              border: '1px solid #1c1c24', borderRadius: '8px', padding: '3px',
            }}>
              {[
                { key: 'catalog', label: `Catalog (${CORE_VIDEOS.length})` },
                { key: 'uploaded', label: `Uploaded (${uploadedVideos.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600,
                    background: activeTab === tab.key ? '#18181f' : 'transparent',
                    color: activeTab === tab.key ? '#f0f0f4' : '#6b6b7b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '0' }}>
            {/* Catalog Tab */}
            {activeTab === 'catalog' && (
              filteredCatalog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6b6b7b' }}>
                  <IconSearch size={32} style={{ color: '#4a4a58', margin: '0 auto 12px', display: 'block' }} />
                  <div style={{ fontSize: '14px', color: '#a0a0b0' }}>No videos match your search</div>
                </div>
              ) : (
                <div>
                  {filteredCatalog.map((video, i) => {
                    const catConfig = VIDEO_CATEGORIES[video.category];
                    return (
                      <div
                        key={video.id}
                        className="animate-fade-in"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '14px 16px',
                          borderBottom: i < filteredCatalog.length - 1 ? '1px solid #1c1c24' : 'none',
                          transition: 'background 0.12s ease',
                          animationDelay: `${i * 30}ms`,
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#111118'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Play Icon */}
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '8px',
                          background: catConfig.bg, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <IconPlay size={16} style={{ color: catConfig.color }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px', fontWeight: 600, color: '#f0f0f4', marginBottom: '3px',
                            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                          }}>
                            {video.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b6b7b', lineHeight: 1.5 }}>
                            {video.description}
                          </div>
                        </div>

                        {/* Meta */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
                          flexWrap: 'wrap', justifyContent: 'flex-end',
                        }}>
                          <span style={{
                            fontSize: '10px', fontWeight: 600, padding: '3px 8px',
                            borderRadius: '4px', background: catConfig.bg, color: catConfig.color,
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                          }}>
                            {catConfig.label}
                          </span>
                          <span style={{
                            fontSize: '12px', color: '#6b6b7b', fontFamily: 'monospace',
                          }}>
                            {video.duration}
                          </span>
                          <div style={{
                            display: 'flex', gap: '4px',
                          }}>
                            {video.recommended_for.slice(0, 2).map(status => (
                              <span key={status} style={{
                                fontSize: '9px', fontWeight: 600, padding: '2px 6px',
                                borderRadius: '3px', background: 'rgba(0,229,255,0.08)',
                                color: '#00e5ff', textTransform: 'uppercase',
                              }}>
                                {status}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Uploaded Tab */}
            {activeTab === 'uploaded' && (
              loading ? (
                <div style={{ padding: '20px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px', borderRadius: '8px' }} />
                  ))}
                </div>
              ) : filteredUploaded.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', color: '#6b6b7b' }}>
                  <IconVideo size={40} style={{ color: '#4a4a58', margin: '0 auto 16px', display: 'block' }} />
                  <h3 style={{ fontSize: '15px', color: '#f0f0f4', marginBottom: '6px', fontWeight: 600 }}>
                    {searchQuery ? 'No videos match your search' : 'No Uploaded Videos Yet'}
                  </h3>
                  <p style={{ color: '#a0a0b0', fontSize: '13px', marginBottom: '20px', maxWidth: '360px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                    Upload your pre-created core videos here. They will be stored in Supabase and available for Bob to send to students.
                  </p>
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', gap: '6px', display: 'inline-flex' }}>
                    <IconPlus size={14} /> Upload Your First Video
                    <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
              ) : (
                <div>
                  {filteredUploaded.map((video, i) => (
                    <div
                      key={video.id}
                      className="animate-fade-in"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 16px',
                        borderBottom: i < filteredUploaded.length - 1 ? '1px solid #1c1c24' : 'none',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#111118'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Video Thumbnail */}
                      <div style={{
                        width: '64px', height: '40px', borderRadius: '6px',
                        background: '#18181f', overflow: 'hidden', flexShrink: 0,
                        position: 'relative',
                      }}>
                        <video src={video.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)',
                        }}>
                          <IconPlay size={14} style={{ color: '#fff' }} />
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px', fontWeight: 600, color: '#f0f0f4', marginBottom: '2px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {video.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b6b7b' }}>
                          {formatSize(video.size)} • {new Date(video.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '11px', gap: '4px' }}
                          onClick={() => handleCopyUrl(video.url, video.id)}
                        >
                          {copiedId === video.id ? '✓ Copied' : 'Copy URL'}
                        </button>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '11px', gap: '4px', textDecoration: 'none' }}
                        >
                          <IconPlay size={12} /> Play
                        </a>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#ef4444', fontSize: '11px', gap: '4px' }}
                          onClick={() => handleDelete(video.name)}
                        >
                          <IconTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* HeyGen Integration Info */}
        <div className="card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #1c1c24', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconZap size={14} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              HeyGen On-Demand Integration
            </span>
          </div>
          <div style={{ padding: '18px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f4', marginBottom: '8px' }}>How it works</h4>
              <p style={{ fontSize: '13px', color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>
                Bob monitors each student&apos;s pipeline status. When a student reaches the <strong style={{ color: '#8b5cf6' }}>interviewing</strong> or <strong style={{ color: '#8b5cf6' }}>approved</strong> stage — a strong conversion signal — Bob recommends generating a personalized HeyGen AI video to dramatically increase close rates.
              </p>
            </div>
            <div style={{
              minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '10px',
              padding: '14px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #1c1c24',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0f0f4', marginBottom: '4px' }}>Trigger Signals</div>
              {[
                { stage: 'Interviewing', signal: 'High Intent', color: '#8b5cf6' },
                { stage: 'Approved', signal: 'Decision Ready', color: '#f59e0b' },
              ].map(item => (
                <div key={item.stage} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#a0a0b0' }}>{item.stage}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '3px',
                    background: `${item.color}15`, color: item.color, marginLeft: 'auto',
                  }}>
                    {item.signal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
