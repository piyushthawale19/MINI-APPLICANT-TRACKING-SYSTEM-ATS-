import type { Metadata } from 'next';
import { CandidateForm } from '@/components/candidates/CandidateForm';

export const metadata: Metadata = { title: 'Add Candidate' };

export default function NewCandidatePage() {
  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Add New Candidate</h2>
        <p className="text-sm text-slate-500 mt-0.5">Fill in the candidate details below.</p>
      </div>
      <CandidateForm mode="create" />
    </div>
  );
}
