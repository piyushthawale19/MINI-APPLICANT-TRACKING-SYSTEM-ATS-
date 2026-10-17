import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'EarlyJobs ATS',
    template: '%s | EarlyJobs ATS',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
