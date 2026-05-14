'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconDashboard, IconUsers } from '@/components/ui/Icons';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/', label: 'Dashboard', icon: <IconDashboard size={18} /> },
  { href: '/students', label: 'Students', icon: <IconUsers size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0d1321 0%, #0a0e17 100%)',
          borderRight: '1px solid var(--color-border-subtle)',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className="sidebar-container"
      >
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '144px',
              height: '144px',
              borderRadius: '24px',
              background: 'rgba(0, 229, 255, 0.15)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 800,
              color: '#00e5ff',
              letterSpacing: '-0.02em',
            }}>
              OB
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
              }}>
                OttoBob.ai
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Mission Control
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 8px',
            marginBottom: '8px',
          }}>
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 769) close();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                  background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--color-accent-blue)',
                    boxShadow: '0 0 8px var(--color-accent-blue)',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border-subtle)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.15)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#00e5ff',
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Admin
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  OttoBob.ai
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px',
                textDecoration: 'underline'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar-container {
            transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          .sidebar-overlay {
            display: ${isOpen ? 'block' : 'none'} !important;
          }
        }
      `}</style>
    </>
  );
}
