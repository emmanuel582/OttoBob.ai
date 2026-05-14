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
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch all students for stats
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allLeads = students || [];
      const byStatus = {};
      STUDENT_STATUSES.forEach(s => { byStatus[s.value] = 0; });
      allLeads.forEach(l => {
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      });

      setStats({ total: allLeads.length, byStatus });
      setRecentLeads(allLeads.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header 
        title="Mission Control" 
        subtitle="OttoBob.ai — Enrollment Overview"
      >
        <Link href="/students" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', gap: '6px' }}>
          <IconPlus size={14} />
          Add Student
        </Link>
      </Header>

      <div className="page-container">
        {/* Total Students Hero Card */}
        <div 
          className="glass-card animate-fade-in"
          style={{
            padding: '32px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.04))',
            border: '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}>
                Total Students in Pipeline
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}>
                {loading ? (
                  <div className="skeleton" style={{ width: '80px', height: '48px' }} />
                ) : stats.total}
              </div>
            </div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IconUsers size={28} style={{ color: '#60a5fa' }} />
            </div>
          </div>
        </div>

        {/* Pipeline Status Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {STUDENT_STATUSES.map((status, index) => (
            <Link
              key={status.value}
              href={`/students?status=${status.value}`}
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="glass-card animate-fade-in"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  animationDelay: `${index * 80}ms`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: status.color,
                    boxShadow: `0 0 8px ${status.color}`,
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {status.label}
                  </span>
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: status.color,
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

        {/* Pipeline Visual Bar */}
        {!loading && stats.total > 0 && (
          <div className="glass-card-static animate-fade-in" style={{ padding: '24px', marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <IconTrendingUp size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Enrollment Distribution
              </span>
            </div>
            <div style={{
              display: 'flex',
              height: '12px',
              borderRadius: '6px',
              overflow: 'hidden',
              background: 'var(--color-bg-primary)',
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
                      transition: 'width 0.5s ease',
                      position: 'relative',
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
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {status.label}: {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Students */}
        <div className="glass-card-static animate-fade-in" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Recent Students
            </div>
            <Link href="/students" style={{
              fontSize: '13px',
              color: 'var(--color-accent-blue)',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              View All <IconArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '6px' }} />
                    <div className="skeleton" style={{ width: '40%', height: '12px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--color-text-muted)',
            }}>
              <IconRocket size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                No students yet
              </div>
              <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                Start building your student base by adding your first student
              </div>
              <Link href="/students" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Add First Student
              </Link>
            </div>
          ) : (
            <div>
              {recentLeads.map((student, i) => (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 8px',
                    borderBottom: i < recentLeads.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${STUDENT_STATUSES.find(s => s.value === student.status)?.color || '#3b82f6'}40, ${STUDENT_STATUSES.find(s => s.value === student.status)?.color || '#3b82f6'}20)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: STUDENT_STATUSES.find(s => s.value === student.status)?.color || '#3b82f6',
                    flexShrink: 0,
                  }}>
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {student.full_name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                    }}>
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
