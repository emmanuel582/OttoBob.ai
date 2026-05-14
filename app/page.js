'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/students/StatusBadge';
import { STUDENT_STATUSES } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import { IconPlus, IconUsers, IconRocket, IconArrowRight, IconTrendingUp } from '@/components/ui/Icons';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, byStatus: {} });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const all = students || [];
      const byStatus = {};
      STUDENT_STATUSES.forEach(s => { byStatus[s.value] = 0; });
      all.forEach(s => {
        byStatus[s.status] = (byStatus[s.status] || 0) + 1;
      });

      setStats({ total: all.length, byStatus });
      setRecentStudents(all.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle="Otto University — Student Overview"
      >
        <Link href="/students" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', gap: '6px' }}>
          <IconPlus size={14} />
          Add Student
        </Link>
      </Header>

      <div className="page-container">
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}>
          {/* Total Students Card */}
          <div className="card animate-fade-in" style={{ padding: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#6b6b7b',
              }}>
                Total Students
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#18181f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IconUsers size={16} style={{ color: '#00e5ff' }} />
              </div>
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#f0f0f4',
              letterSpacing: '-0.02em',
            }}>
              {loading ? <div className="skeleton" style={{ width: '60px', height: '32px' }} /> : stats.total}
            </div>
          </div>

          {/* Status Cards */}
          {STUDENT_STATUSES.map((status, index) => (
            <Link
              key={status.value}
              href={`/students?status=${status.value}`}
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="card card-interactive animate-fade-in"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  animationDelay: `${(index + 1) * 50}ms`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#6b6b7b',
                  }}>
                    {status.label}
                  </span>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: status.color,
                  }} />
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#f0f0f4',
                  letterSpacing: '-0.02em',
                }}>
                  {loading ? (
                    <div className="skeleton" style={{ width: '40px', height: '28px' }} />
                  ) : (
                    stats.byStatus[status.value] || 0
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Enrollment Distribution Bar */}
        {!loading && stats.total > 0 && (
          <div className="card animate-fade-in" style={{ padding: '20px', marginBottom: '28px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
            }}>
              <IconTrendingUp size={14} style={{ color: '#6b6b7b' }} />
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#6b6b7b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                Enrollment Distribution
              </span>
            </div>
            <div style={{
              display: 'flex',
              height: '8px',
              borderRadius: '4px',
              overflow: 'hidden',
              background: '#18181f',
              gap: '2px',
            }}>
              {STUDENT_STATUSES.map(status => {
                const count = stats.byStatus[status.value] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={status.value}
                    style={{
                      width: `${pct}%`,
                      background: status.color,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                    title={`${status.label}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '12px',
            }}>
              {STUDENT_STATUSES.map(status => {
                const count = stats.byStatus[status.value] || 0;
                if (count === 0) return null;
                return (
                  <div key={status.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      background: status.color,
                    }} />
                    <span style={{ fontSize: '12px', color: '#a0a0b0' }}>
                      {status.label}: {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Students */}
        <div className="card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #1c1c24',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#f0f0f4',
            }}>
              Recent Students
            </span>
            <Link href="/students" style={{
              fontSize: '13px',
              color: '#00e5ff',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'opacity 0.15s ease',
            }}>
              View All <IconArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '20px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1c1c24' }}>
                  <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '50%', height: '14px', marginBottom: '6px' }} />
                    <div className="skeleton" style={{ width: '30%', height: '12px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b6b7b',
            }}>
              <IconRocket size={32} style={{ color: '#4a4a58', margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                No students yet
              </div>
              <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                Add your first student to get started
              </div>
              <Link href="/students" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Add Student
              </Link>
            </div>
          ) : (
            <div>
              {recentStudents.map((student, i) => (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="table-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    borderBottom: i < recentStudents.length - 1 ? '1px solid #1c1c24' : 'none',
                    textDecoration: 'none',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#18181f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#a0a0b0',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {student.photo_url ? (
                      <img src={student.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      student.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#f0f0f4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {student.full_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b6b7b' }}>
                      {student.major || 'No major'} · {timeAgo(student.created_at)}
                    </div>
                  </div>
                  <StatusBadge status={student.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
