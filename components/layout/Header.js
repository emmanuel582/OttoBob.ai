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
      borderBottom: '1px solid var(--color-border-subtle)',
      background: 'rgba(10, 14, 23, 0.8)',
      backdropFilter: 'blur(12px)',
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
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
          }}
        >
          <IconMenu size={24} />
        </button>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
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
