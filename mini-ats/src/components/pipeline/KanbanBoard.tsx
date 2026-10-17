'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil } from 'lucide-react';
import { HIRING_STAGES, type Candidate, type HiringStage } from '@/types';
import { STAGE_COLORS, formatRelativeTime } from '@/lib/utils';
import { Avatar } from '@/components/shared/StageBadge';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/EmptyState';

export function KanbanBoard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError('');
    try {
      // Fetch all candidates (up to 200 for the board)
      const res = await fetch('/api/candidates?limit=200');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCandidates(data.data);
    } catch {
      setError('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  }

  async function updateStage(candidateId: string, newStage: HiringStage) {
    setUpdating(candidateId);
    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) => (c._id === candidateId ? { ...c, hiringStage: newStage } : c))
    );

    try {
      const res = await fetch(`/api/candidates/${candidateId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiringStage: newStage }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch {
      // Revert on failure
      fetchAll();
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <PageLoader />;
  if (error) return <ErrorState description={error} onRetry={fetchAll} />;

  const byStage = HIRING_STAGES.reduce<Record<HiringStage, Candidate[]>>((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.hiringStage === stage);
    return acc;
  }, {} as Record<HiringStage, Candidate[]>);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} in pipeline
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {HIRING_STAGES.map((stage) => {
          const colors = STAGE_COLORS[stage];
          const stageCandidates = byStage[stage];

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-64 flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden"
            >
              {/* Column header */}
              <div className="px-3 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-sm font-semibold text-slate-700">{stage}</span>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {stageCandidates.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto">
                {stageCandidates.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-xs text-slate-400">No candidates</p>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => (
                    <KanbanCard
                      key={candidate._id}
                      candidate={candidate}
                      currentStage={stage}
                      onStageChange={updateStage}
                      isUpdating={updating === candidate._id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface KanbanCardProps {
  candidate: Candidate;
  currentStage: HiringStage;
  onStageChange: (id: string, stage: HiringStage) => void;
  isUpdating: boolean;
}

function KanbanCard({ candidate, currentStage, onStageChange, isUpdating }: KanbanCardProps) {
  const availableStages = HIRING_STAGES.filter((s) => s !== currentStage);

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-3 shadow-sm transition-all ${
        isUpdating ? 'opacity-60 pointer-events-none' : 'hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <Avatar name={candidate.fullName} size="sm" />
        <div className="flex-1 min-w-0">
          <Link
            href={`/candidates/${candidate._id}`}
            className="text-sm font-medium text-slate-800 hover:text-blue-600 truncate block transition-colors"
          >
            {candidate.fullName}
          </Link>
          <p className="text-xs text-slate-400 truncate">{candidate.appliedRole}</p>
        </div>
      </div>

      {candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {candidate.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{formatRelativeTime(candidate.createdAt)}</span>
        <div className="flex items-center gap-1">
          <Link
            href={`/candidates/${candidate._id}/edit`}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="w-3 h-3" />
          </Link>
          {/* Move stage selector */}
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onStageChange(candidate._id, e.target.value as HiringStage);
            }}
            className="text-[10px] border border-slate-200 rounded px-1 py-0.5 text-slate-500 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
            title="Move to stage"
          >
            <option value="">Move to...</option>
            {availableStages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
