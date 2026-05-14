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

function StudentsContent() {
  const [students, setStudents] = useState([]);
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

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStudents(data || []);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    let r = students;
    if (statusFilter) r = r.filter(s => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s => s.full_name?.toLowerCase().includes(q) || s.major?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }
    return r;
  }, [students, statusFilter, search]);

  return (
    <div>
      <Header title="Students" subtitle={`${filtered.length} student${filtered.length !== 1 ? 's' : ''} enrolled`}>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ gap: '6px' }}>
          <IconPlus size={14} />
          Add Student
        </button>
      </Header>

      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        </div>

        {loading ? (
          <div className="card" style={{ padding: '20px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #1c1c24' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '6px' }} />
                  <div className="skeleton" style={{ width: '25%', height: '12px' }} />
                </div>
                <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '6px' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
            {(search || statusFilter) ? (
              <IconSearch size={36} style={{ color: '#4a4a58', margin: '0 auto 12px', display: 'block' }} />
            ) : (
              <IconRocket size={36} style={{ color: '#4a4a58', margin: '0 auto 12px', display: 'block' }} />
            )}
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
              {search || statusFilter ? 'No students match your search' : 'No students yet'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b6b7b', marginBottom: '20px' }}>
              {search || statusFilter ? 'Try adjusting your filters' : 'Add your first student to get started'}
            </div>
            {!search && !statusFilter && <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>Add Student</button>}
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="hide-scrollbar" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1c1c24' }}>
                    {['Student','Major','Status','Source','Follow-up','Added'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#6b6b7b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, i) => (
                    <tr 
                      key={student.id} 
                      className="table-row animate-fade-in" 
                      style={{ 
                        borderBottom: i < filtered.length - 1 ? '1px solid #1c1c24' : 'none', 
                        animationDelay: `${i*25}ms`, 
                        opacity: 0, 
                        animationFillMode: 'forwards',
                      }}
                      onClick={() => window.location.href = `/students/${student.id}`}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#18181f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
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
                          <div>
                            <div style={{ fontWeight: 500, color: '#f0f0f4' }}>{student.full_name}</div>
                            {student.email && <div style={{ fontSize: '12px', color: '#6b6b7b', marginTop: '1px' }}>{student.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: student.major ? '#a0a0b0' : '#4a4a58' }}>{student.major || '—'}</td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={student.status} size="sm" /></td>
                      <td style={{ padding: '12px 16px', color: '#a0a0b0' }}>{student.source || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b6b7b' }}>{student.next_follow_up_date ? formatDate(student.next_follow_up_date) : '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b6b7b', fontSize: '13px' }}>{timeAgo(student.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student">
        <StudentForm onSave={() => { setShowAddModal(false); fetchStudents(); }} onCancel={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}

export default function StudentsPage() {
  return <Suspense fallback={<div style={{padding:'32px'}}><div className="skeleton" style={{height:'400px'}}/></div>}><StudentsContent /></Suspense>;
}
