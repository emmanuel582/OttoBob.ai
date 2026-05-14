'use client';

import { IconMenu } from '@/components/ui/Icons';
import { useSidebar } from '@/lib/contexts/SidebarContext';

export default function Header({ title, subtitle, children }) {
  const { toggle } = useSidebar();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid #1c1c24',
      background: '#0a0a0f',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile hamburger */}
        <button
          onClick={toggle}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#a0a0b0',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
          }}
        >
          <IconMenu size={24} />
        </button>
        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#f0f0f4',
            letterSpacing: '-0.02em',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: '13px',
              color: '#6b6b7b',
              marginTop: '2px',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {children}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          header {
            padding: 12px 16px !important;
          }
        }
      `}</style>
    </header>
  );
}
