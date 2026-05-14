'use client';

import Sidebar from './Sidebar';
import { useSidebar } from '@/lib/contexts/SidebarContext';

export default function AppShell({ children }) {
  const { isOpen } = useSidebar();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
      }}
        className="main-content"
      >
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
