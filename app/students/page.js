'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/students/SearchBar';
import FilterBar from '@/components/students/FilterBar';
import StatusBadge from '@/components/students/StatusBadge';
import StudentForm from '@/components/students/StudentForm';
import Modal from '@/components/ui/Modal';
import { formatDate, timeAgo } from '@/lib/utils';
import { IconPlus, IconSearch, IconRocket } from '@/components/ui/Icons';

function LeadsContent() {
  const [students, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus) setStatusFilter(urlStatus);
  }, [searchParams]);

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  }

  const filteredLeads = useMemo(() => {
    let r = students;
    if (statusFilter) r = r.filter(l => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(l => l.full_name?.toLowerCase().includes(q) || l.major?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q));
    }
    return r;
  }, [students, statusFilter, search]);

  return (
    <div>
      <Header title="Students" subtitle={`${filteredLeads.length} student${filteredLeads.length !== 1 ? 's' : ''}`}>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ gap: '6px' }}>
          <IconPlus size={14} />
          Add Student
        </button>
      </Header>

      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        </div>

        {loading ? (
          <div className="glass-card-static" style={{ padding: '24px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                <div style={{ flex: 1 }}><div className="skeleton" style={{ width: '50%', height: '16px', marginBottom: '6px' }} /><div className="skeleton" style={{ width: '30%', height: '12px' }} /></div>
                <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
              </div>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="glass-card-static" style={{ textAlign: 'center', padding: '64px 24px' }}>
            {(search || statusFilter) ? (
              <IconSearch size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px', display: 'block' }} />
            ) : (
              <IconRocket size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px', display: 'block' }} />
            )}
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              {search || statusFilter ? 'No students match your search' : 'No students yet'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              {search || statusFilter ? 'Try adjusting your search or filters' : 'Add your first student to get started'}
            </div>
            {!search && !statusFilter && <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add First Student</button>}
          </div>
        ) : (
          <div className="glass-card-static" style={{ overflow: 'hidden' }}>
            <div className="hide-scrollbar" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    {['Name','Major','Status','Source','Follow-up','Added'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((student, i) => (
                    <tr key={student.id} className="animate-fade-in" style={{ borderBottom: i < filteredLeads.length - 1 ? '1px solid var(--color-border-subtle)' : 'none', cursor: 'pointer', transition: 'background 0.15s ease', animationDelay: `${i*30}ms`, opacity: 0, animationFillMode: 'forwards' }}
                      onClick={() => window.location.href = `/students/${student.id}`}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--color-accent-blue)', flexShrink: 0 }}>{student.full_name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{student.full_name}</div>
                            {student.email && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{student.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: student.major ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>{student.major || '—'}</td>
                      <td style={{ padding: '14px 16px' }}><StatusBadge status={student.status} size="sm" /></td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)' }}>{student.source || '—'}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>{student.next_follow_up_date ? formatDate(student.next_follow_up_date) : '—'}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>{timeAgo(student.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student">
        <StudentForm onSave={() => { setShowAddModal(false); fetchLeads(); }} onCancel={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}

export default function LeadsPage() {
  return <Suspense fallback={<div style={{padding:'32px'}}><div className="skeleton" style={{height:'400px'}}/></div>}><LeadsContent /></Suspense>;
}
