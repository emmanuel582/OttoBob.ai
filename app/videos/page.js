'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { IconVideo, IconPlay, IconTrash, IconPlus } from '@/components/ui/Icons';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from('videos').list();
      if (error) throw error;

      const videoList = data.filter(file => file.name !== '.emptyFolderPlaceholder').map(file => {
        const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(file.name);
        return {
          id: file.id,
          name: file.name,
          url: publicUrlData.publicUrl,
          created_at: file.created_at,
          size: file.metadata?.size || 0
        };
      });

      setVideos(videoList);
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
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error } = await supabase.storage.from('videos').upload(fileName, file);

      if (error) throw error;

      toast.success('Video uploaded successfully');
      fetchVideos();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  }

  async function handleDelete(videoName) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase.storage.from('videos').remove([videoName]);
      if (error) throw error;

      toast.success('Video deleted');
      fetchVideos();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete video');
    }
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <Header title="Video Management" subtitle="Manage pre-created core videos for Bob">
        <label className="btn btn-primary" style={{ cursor: 'pointer', gap: '8px' }}>
          <IconPlus size={16} />
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
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card skeleton" style={{ height: '240px' }} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px 20px' }}>
            <IconVideo size={48} style={{ color: '#4a4a58', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: '16px', color: '#f0f0f4', marginBottom: '8px' }}>No Videos Found</h3>
            <p style={{ color: '#a0a0b0', fontSize: '14px', marginBottom: '24px' }}>
              Upload your core videos to the Supabase storage bucket.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {videos.map(video => (
              <div key={video.id} className="card animate-fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  height: '160px',
                  background: '#18181f',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <video
                    src={video.url}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    controls={false}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <a href={video.url} target="_blank" rel="noreferrer" style={{
                      width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
                      transition: 'transform 0.2s', cursor: 'pointer'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <IconPlay size={24} />
                    </a>
                  </div>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f4', marginBottom: '4px', wordBreak: 'break-all' }}>
                    {video.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#6b6b7b', marginBottom: '16px' }}>
                    {formatSize(video.size)} • {new Date(video.created_at).toLocaleDateString()}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1c1c24', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444', gap: '6px' }}
                      onClick={() => handleDelete(video.name)}
                    >
                      <IconTrash size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
