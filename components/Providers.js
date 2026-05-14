'use client';

import { ToastProvider } from '@/components/ui/Toast';
import AppShell from '@/components/layout/AppShell';
import { SidebarProvider } from '@/lib/contexts/SidebarContext';

export default function Providers({ children }) {
  return (
    <SidebarProvider>
      <ToastProvider>
        <AppShell>
          {children}
        </AppShell>
      </ToastProvider>
    </SidebarProvider>
  );
}
