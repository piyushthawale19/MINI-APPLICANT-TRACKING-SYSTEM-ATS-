import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | EarlyJobs ATS',
  description: 'Sign in to your EarlyJobs ATS account',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
