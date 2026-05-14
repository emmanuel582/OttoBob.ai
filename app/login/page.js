'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#0a0a0f',
    }}>
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: '#111118',
            border: '1px solid #1c1c24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 800,
            color: '#00e5ff',
            margin: '0 auto 20px',
          }}>
            OB
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#f0f0f4',
            marginBottom: '6px',
            letterSpacing: '-0.02em',
          }}>
            Sign in to OttoBob.ai
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b6b7b',
          }}>
            Otto University — Mission Control
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: '#111118',
          border: '1px solid #1c1c24',
          borderRadius: '12px',
          padding: '28px',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#1c1012',
                border: '1px solid #3b1114',
                color: '#fca5a5',
                fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px',
                color: '#a0a0b0',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@ottobob.ai"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px',
                color: '#a0a0b0',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '42px', marginTop: '4px', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#4a4a58',
          marginTop: '24px',
        }}>
          Secured by Supabase Auth · OttoBob.ai © 2026
        </p>
      </div>
    </div>
  );
}
