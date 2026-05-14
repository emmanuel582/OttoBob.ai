'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/students/StatusBadge';
import StudentForm from '@/components/students/StudentForm';
import DeleteConfirm from '@/components/students/DeleteConfirm';
import ActivityTimeline from '@/components/activity/ActivityTimeline';
import Modal from '@/components/ui/Modal';
import { STUDENT_STATUSES } from '@/lib/constants';
import { formatDate, formatTimestamp } from '@/lib/utils';
import {
  IconArrowLeft, IconBuilding, IconMail, IconPhone, IconGlobe,
  IconCalendar, IconClock, IconZap, IconEdit, IconTrash,
  IconChevronDown, IconCheck, IconActivity, IconSearch,
} from '@/components/ui/Icons';

export default function LeadDetailPage({ params }) {
  const { id } = use(params);
  const [student, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => { fetchLead(); }, [id]);

  async function fetchLead() {
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
      if (error) throw error;
      setLead(data);
    } catch (err) {
      console.error('Error fetching student:', err);
      toast.error('Student not found');
    } finally { setLoading(false); }
  }

  async function handleStatusChange(newStatus) {
    if (newStatus === student.status) { setStatusDropdown(false); return; }
    try {
      const { error } = await supabase.from('students').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      await supabase.from('activity_logs').insert({
        student_id: id, source: 'system', author: 'System',
        content: `Status changed from "${student.status.replace(/_/g,' ')}" to "${newStatus.replace(/_/g,' ')}"`,
      });
      setLead(prev => ({ ...prev, status: newStatus }));
      toast.success('Status updated');
      setStatusDropdown(false);
    } catch (err) { toast.error('Failed to update status'); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      toast.success('Student deleted');
      router.push('/students');
    } catch (err) { toast.error('Failed to delete student'); }
    finally { setDeleting(false); }
  }

  if (loading) {
    return (
      <div>
        <Header title="Loading..." />
        <div style={{ padding: '32px' }}>
          <div className="skeleton" style={{ height: '200px', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '400px' }} />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div>
        <Header title="Student Not Found" />
        <div style={{ padding: '64px 32px', textAlign: 'center' }}>
          <IconSearch size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>This student could not be found</div>
          <Link href="/students" className="btn btn-primary" style={{ textDecoration: 'none' }}>Back to Students</Link>
        </div>
      </div>
    );
  }

  const infoItems = [
    { icon: <IconBuilding size={15} />, label: 'Major', value: student.major },
    { icon: <IconMail size={15} />, label: 'Email', value: student.email },
    { icon: <IconPhone size={15} />, label: 'Phone', value: student.phone },
    { icon: <IconGlobe size={15} />, label: 'Source', value: student.source },
    { icon: <IconCalendar size={15} />, label: 'Follow-up', value: student.next_follow_up_date ? formatDate(student.next_follow_up_date) : null },
    { icon: <IconClock size={15} />, label: 'Created', value: formatTimestamp(student.created_at) },
  ];

  return (
    <div>
      <Header title={student.full_name} subtitle={student.major || 'No major assigned'}>
        <Link href="/students" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', gap: '6px' }}>
          <IconArrowLeft size={14} /> Back
        </Link>
      </Header>

      <div className="page-container page-container-sm">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }} className="student-detail-grid">
          {/* Left Column — Student Info */}
          <div>
            {/* Student Card */}
            <div className="glass-card-static animate-fade-in" style={{ padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 800, color: 'var(--color-accent-blue)',
                }}>
                  {student.full_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{student.full_name}</div>
                  <div style={{ marginTop: '6px' }}><StatusBadge status={student.status} /></div>
                </div>
              </div>

              {/* Info items */}
              {infoItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 0',
                  borderTop: i === 0 ? '1px solid var(--color-border-subtle)' : 'none',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}>
                  <span style={{ color: 'var(--color-text-muted)', width: '24px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', minWidth: '80px' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', color: item.value ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{item.value || '—'}</span>
                </div>
              ))}

              {student.notes && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Notes</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{student.notes}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="glass-card-static animate-fade-in" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Quick Actions</div>

              {/* Status Changer */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }} onClick={() => setStatusDropdown(!statusDropdown)}>
                  <IconZap size={14} /> Change Status
                  <span style={{ marginLeft: 'auto' }}><IconChevronDown size={12} /></span>
                </button>
                {statusDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                    borderRadius: '10px', marginTop: '4px', padding: '4px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                  }}>
                    {STUDENT_STATUSES.map(s => (
                      <button key={s.value} onClick={() => handleStatusChange(s.value)} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '8px 12px', border: 'none', borderRadius: '8px',
                        background: student.status === s.value ? s.bg : 'transparent',
                        color: student.status === s.value ? s.color : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif', textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                        onMouseOver={e => { if (student.status !== s.value) e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
                        onMouseOut={e => { if (student.status !== s.value) e.currentTarget.style.background = 'transparent'; }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        {s.label}
                        {student.status === s.value && <span style={{ marginLeft: 'auto' }}><IconCheck size={14} /></span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px', gap: '8px' }} onClick={() => setEditModal(true)}>
                <IconEdit size={14} /> Edit Student
              </button>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-accent-red)', gap: '8px' }} onClick={() => setDeleteModal(true)}>
                <IconTrash size={14} /> Delete Student
              </button>
            </div>
          </div>

          {/* Right Column — Activity Timeline */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <IconActivity size={14} /> Chronological Activity Log
            </div>
            <ActivityTimeline leadId={id} key={student.status} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Student">
        <StudentForm student={student} onSave={() => { setEditModal(false); fetchLead(); }} onCancel={() => setEditModal(false)} />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirm Delete">
        <DeleteConfirm leadName={student.full_name} onConfirm={handleDelete} onCancel={() => setDeleteModal(false)} deleting={deleting} />
      </Modal>

      <style jsx global>{`
        @media (max-width: 768px) {
          .student-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
