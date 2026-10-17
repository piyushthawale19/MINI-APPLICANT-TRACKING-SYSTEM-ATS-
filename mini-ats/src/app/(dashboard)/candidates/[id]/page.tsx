'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Briefcase,
  Clock,
  FileText,
  Pencil,
  Trash2,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import type { Candidate, HiringStage } from '@/types';
import { HIRING_STAGES } from '@/types';
import { Avatar, StageBadge } from '@/components/shared/StageBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/EmptyState';
import { formatDate, formatRelativeTime, STAGE_COLORS } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stageSaving, setStageSaving] = useState(false);
  const [stageSuccess, setStageSuccess] = useState(false);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  async function fetchCandidate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/candidates/${id}`);
      if (res.status === 404) { setError('not_found'); return; }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCandidate(data);
    } catch {
      setError('Failed to load candidate');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/candidates');
    } catch {
      setError('Failed to delete candidate');
    } finally {
      setDeleting(false);
    }
  }

  async function handleStageChange(newStage: HiringStage) {
    if (!candidate || newStage === candidate.hiringStage) return;
    setStageSaving(true);
    try {
      const res = await fetch(`/api/candidates/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiringStage: newStage }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setCandidate(updated);
      setStageSuccess(true);
      setTimeout(() => setStageSuccess(false), 2000);
    } catch {
      setError('Failed to update stage');
    } finally {
      setStageSaving(false);
    }
  }

  if (loading) return <PageLoader />;
  if (error === 'not_found')
    return <ErrorState title="Candidate not found" description="This candidate may have been deleted." />;
  if (error) return <ErrorState description={error} onRetry={fetchCandidate} />;
  if (!candidate) return null;

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href="/candidates"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/candidates/${id}/edit`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <Avatar name={candidate.fullName} size="lg" />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900">{candidate.fullName}</h2>
                <p className="text-sm text-slate-500">{candidate.appliedRole}</p>
                <div className="mt-2">
                  <StageBadge stage={candidate.hiringStage} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 truncate transition-colors">
                  {candidate.email}
                </a>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <a href={`tel:${candidate.phone}`} className="hover:text-blue-600 transition-colors">
                    {candidate.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {candidate.experience} experience
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4 flex-shrink-0" />
                Added {formatRelativeTime(candidate.createdAt)}
              </div>
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  View Resume
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {candidate.notes && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Notes</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{candidate.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stage manager */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Hiring Stage</h3>
              {stageSaving && <LoadingSpinner size="sm" />}
              {stageSuccess && <span className="text-xs text-green-600 font-medium">Saved!</span>}
            </div>
            <div className="space-y-1.5">
              {HIRING_STAGES.map((stage) => {
                const isActive = candidate.hiringStage === stage;
                const colors = STAGE_COLORS[stage];
                return (
                  <button
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    disabled={isActive || stageSaving}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? `${colors.bg} ${colors.text} ring-1 ring-inset ring-current/20`
                        : 'text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? colors.dot : 'bg-slate-200'}`} />
                    {stage}
                    {isActive && <span className="ml-auto text-xs opacity-70">Current</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Record Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-sm text-slate-700">{formatDate(candidate.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-sm text-slate-700">{formatDate(candidate.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Candidate"
        description={`This will permanently delete ${candidate.fullName}'s record. This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
