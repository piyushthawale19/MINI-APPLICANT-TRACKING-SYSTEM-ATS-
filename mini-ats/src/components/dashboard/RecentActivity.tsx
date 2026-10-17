import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Candidate } from '@/types';
import { Avatar, StageBadge } from '@/components/shared/StageBadge';
import { formatRelativeTime } from '@/lib/utils';

interface RecentActivityProps {
  candidates: Candidate[];
}

export function RecentActivity({ candidates }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Recent Candidates</h3>
        <Link
          href="/candidates"
          className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">No candidates yet</p>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <Link
              key={c._id}
              href={`/candidates/${c._id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <Avatar name={c.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                  {c.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">{c.appliedRole}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StageBadge stage={c.hiringStage} />
                <span className="text-[10px] text-slate-400">{formatRelativeTime(c.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
