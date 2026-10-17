import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'EarlyJobs ATS — Applicant Tracking System',
    template: '%s | EarlyJobs ATS',
  },
  description: 'A professional applicant tracking system to manage candidates, hiring pipelines, and recruitment analytics.',
  keywords: ['ATS', 'applicant tracking', 'recruitment', 'hiring', 'HR'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
