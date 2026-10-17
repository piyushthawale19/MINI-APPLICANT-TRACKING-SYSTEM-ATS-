import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CandidateTable } from '@/components/candidates/CandidateTable';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';

export const metadata: Metadata = { title: 'Candidates' };

export default function CandidatesPage() {
  return (
    <div className="space-y-1 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Candidate Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Search, filter, and manage all applicants.</p>
        </div>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <CandidateTable />
      </Suspense>
    </div>
  );
}
