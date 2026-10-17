'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/candidates': 'Candidates',
  '/candidates/new': 'Add Candidate',
  '/pipeline': 'Recruitment Pipeline',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.match(/\/candidates\/[^/]+\/edit/)) return 'Edit Candidate';
  if (pathname.match(/\/candidates\/[^/]+/)) return 'Candidate Details';
  return 'EarlyJobs ATS';
}

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = getPageTitle(pathname);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-base font-semibold text-slate-900 flex-1">{title}</h1>

      <div className="flex items-center gap-2">
        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-sm text-slate-600 font-medium">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
