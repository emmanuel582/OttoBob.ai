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

export default function StudentDetailPage({ params }) {
  const { id } = use(params);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => { fetchStudent(); }, [id]);

  async function fetchStudent() {
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
      if (error) throw error;
      setStudent(data);
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
        content: `Status changed from "${student.status.replace(/_/g, ' ')}" to "${newStatus.replace(/_/g, ' ')}"`,
      });
      setStudent(prev => ({ ...prev, status: newStatus }));
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
          <IconSearch size={40} style={{ color: '#4a4a58', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '15px', color: '#a0a0b0', marginBottom: '16px' }}>This student could not be found</div>
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
    { icon: <IconClock size={15} />, label: 'Enrolled', value: formatTimestamp(student.created_at) },
  ];

  return (
    <div>
      <Header title={student.full_name} subtitle={student.major || 'No major assigned'}>
        <Link href="/students" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', gap: '6px' }}>
          <IconArrowLeft size={14} /> Back
        </Link>
      </Header>

      <div className="page-container" style={{ maxWidth: '1200px' }}>
        {/* Profile Header Card */}
        <div className="card animate-fade-in" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            {/* Photo */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#18181f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: '#6b6b7b',
              flexShrink: 0,
              overflow: 'hidden',
              border: '2px solid #26262e',
            }}>
              {student.photo_url ? (
                <img src={student.photo_url} alt={student.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                student.full_name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f0f4', letterSpacing: '-0.01em' }}>
                  {student.full_name}
                </h2>
                <StatusBadge status={student.status} />
              </div>
              <div style={{ fontSize: '14px', color: '#6b6b7b' }}>
                {student.major && <span>{student.major}</span>}
                {student.major && student.email && <span> · </span>}
                {student.email && <span>{student.email}</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" style={{ gap: '6px' }} onClick={() => setEditModal(true)}>
                <IconEdit size={14} /> Edit
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444', gap: '6px' }} onClick={() => setDeleteModal(true)}>
                <IconTrash size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }} className="student-detail-grid">
          {/* Left Column — Details */}
          <div>
            {/* Info Card */}
            <div className="card animate-fade-in" style={{ padding: '0', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #1c1c24' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Details</span>
              </div>
              {infoItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 18px',
                  borderBottom: i < infoItems.length - 1 ? '1px solid #1c1c24' : 'none',
                }}>
                  <span style={{ color: '#4a4a58', width: '20px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: '#6b6b7b', minWidth: '70px' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: item.value ? '#f0f0f4' : '#4a4a58', marginLeft: 'auto', textAlign: 'right' }}>{item.value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            {student.notes && (
              <div className="card animate-fade-in" style={{ padding: '0', marginBottom: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #1c1c24' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notes</span>
                </div>
                <div style={{ padding: '14px 18px', fontSize: '13px', color: '#a0a0b0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {student.notes}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card animate-fade-in" style={{ padding: '0', overflow: 'visible' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #1c1c24' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Actions</span>
              </div>
              <div style={{ padding: '8px' }}>
                {/* Status Changer */}
                <div style={{ position: 'relative', marginBottom: '4px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
                    onClick={() => setStatusDropdown(!statusDropdown)}
                  >
                    <IconZap size={14} /> Change Status
                    <span style={{ marginLeft: 'auto' }}><IconChevronDown size={12} /></span>
                  </button>
                  {statusDropdown && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                      background: '#111118', border: '1px solid #26262e',
                      borderRadius: '8px', marginTop: '4px', padding: '4px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}>
                      {STUDENT_STATUSES.map(s => (
                        <button key={s.value} onClick={() => handleStatusChange(s.value)} style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '8px 10px', border: 'none', borderRadius: '6px',
                          background: student.status === s.value ? s.bg : 'transparent',
                          color: student.status === s.value ? s.color : '#a0a0b0',
                          cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif', textAlign: 'left',
                          transition: 'background 0.12s ease',
                        }}
                          onMouseOver={e => { if (student.status !== s.value) e.currentTarget.style.background = '#18181f'; }}
                          onMouseOut={e => { if (student.status !== s.value) e.currentTarget.style.background = 'transparent'; }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          {s.label}
                          {student.status === s.value && <span style={{ marginLeft: 'auto' }}><IconCheck size={14} /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Activity Timeline */}
          <div className="animate-fade-in" style={{ animationDelay: '80ms' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid #1c1c24',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <IconActivity size={14} style={{ color: '#6b6b7b' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Activity Log</span>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <ActivityTimeline studentId={id} studentStatus={student.status} key={student.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Student">
        <StudentForm student={student} onSave={() => { setEditModal(false); fetchStudent(); }} onCancel={() => setEditModal(false)} />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirm Delete">
        <DeleteConfirm studentName={student.full_name} onConfirm={handleDelete} onCancel={() => setDeleteModal(false)} deleting={deleting} />
      </Modal>

      <style jsx global>{`
        @media (max-width: 768px) {
          .student-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
