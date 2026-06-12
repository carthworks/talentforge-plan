'use client';

import { AuthProvider } from '@/lib/auth';
import { StoreProvider } from '@/lib/store';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import UserBar from '@/components/UserBar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeToggle';
import { ToastProvider } from '@/components/Toast';

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <UserBar />
      {children}
      <footer className="footer">
        <p>© 2025 TalentForge · India&apos;s multi-disciplinary talent verification platform</p>
      </footer>
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <AuthGuard>
              <AppShell>{children}</AppShell>
            </AuthGuard>
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
