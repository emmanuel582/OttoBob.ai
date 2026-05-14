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
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          background: '#0e0e14',
          borderRight: '1px solid #1c1c24',
          transition: 'transform 0.25s ease',
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className="sidebar-container"
      >
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid #1c1c24',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#131319',
              border: '1px solid #26262e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              color: '#00e5ff',
            }}>
              OB
            </div>
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#f0f0f4',
                letterSpacing: '-0.01em',
              }}>
                OttoBob.ai
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b6b7b',
                fontWeight: 400,
              }}>
                Otto University
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#4a4a58',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '0 8px',
            marginBottom: '8px',
          }}>
            Menu
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
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#00e5ff' : '#a0a0b0',
                  background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                  marginBottom: '2px',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#18181f';
                    e.currentTarget.style.color = '#f0f0f4';
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a0a0b0';
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 16px',
          borderTop: '1px solid #1c1c24',
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
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#18181f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#a0a0b0',
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#f0f0f4' }}>
                  Admin
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b6b7b',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'color 0.15s ease',
              }}
              onMouseOver={e => e.currentTarget.style.color = '#f0f0f4'}
              onMouseOut={e => e.currentTarget.style.color = '#6b6b7b'}
            >
              Sign out
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
