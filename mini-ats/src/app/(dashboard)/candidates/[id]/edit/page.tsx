'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Candidate } from '@/types';
import { CandidateForm } from '@/components/candidates/CandidateForm';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/EmptyState';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditCandidatePage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/candidates/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setCandidate)
      .catch(() => setError('Failed to load candidate'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState description={error} />;
  if (!candidate) return null;

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <Link
          href={`/candidates/${id}`}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Edit Candidate</h2>
        <p className="text-sm text-slate-500 mt-0.5">Update details for {candidate.fullName}.</p>
      </div>
      <CandidateForm mode="edit" initialData={candidate} candidateId={id} />
    </div>
  );
}
