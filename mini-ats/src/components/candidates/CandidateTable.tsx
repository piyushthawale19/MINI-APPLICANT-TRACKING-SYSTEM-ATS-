'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { Candidate, HiringStage, PaginatedResponse } from '@/types';
import { HIRING_STAGES } from '@/types';
import { Avatar, StageBadge } from '@/components/shared/StageBadge';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { formatDate, buildQueryString } from '@/lib/utils';

type SortField = 'fullName' | 'email' | 'appliedRole' | 'hiringStage' | 'createdAt';

export function CandidateTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Candidate> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortField>((searchParams.get('sortBy') as SortField) || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = buildQueryString({ page, limit: 10, search, stage: stageFilter, sortBy, sortOrder });
      const res = await fetch(`/api/candidates?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [page, search, stageFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Sync state to URL
  useEffect(() => {
    const qs = buildQueryString({ page, search, stage: stageFilter, sortBy, sortOrder });
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }, [page, search, stageFilter, sortBy, sortOrder, pathname, router]);

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/candidates/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteId(null);
      fetchCandidates();
    } catch {
      setError('Failed to delete candidate');
    } finally {
      setDeleting(false);
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-blue-600 ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600 ml-1" />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 items-center ml-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Stages</option>
              {HIRING_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <Link
            href="/candidates/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} />
          </div>
        ) : error ? (
          <ErrorState onRetry={fetchCandidates} description={error} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon="users"
            title={search || stageFilter ? 'No candidates match your filters' : 'No candidates yet'}
            description={
              search || stageFilter
                ? 'Try adjusting your search or filters'
                : 'Add your first candidate to get started'
            }
            action={
              !search && !stageFilter
                ? { label: 'Add Candidate', href: '/candidates/new' }
                : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <button
                        className="flex items-center hover:text-slate-800 transition-colors"
                        onClick={() => handleSort('fullName')}
                      >
                        Candidate <SortIcon field="fullName" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      <button
                        className="flex items-center hover:text-slate-800 transition-colors"
                        onClick={() => handleSort('appliedRole')}
                      >
                        Role <SortIcon field="appliedRole" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Experience
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <button
                        className="flex items-center hover:text-slate-800 transition-colors"
                        onClick={() => handleSort('hiringStage')}
                      >
                        Stage <SortIcon field="hiringStage" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      <button
                        className="flex items-center hover:text-slate-800 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        Added <SortIcon field="createdAt" />
                      </button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.data.map((candidate) => (
                    <tr
                      key={candidate._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={candidate.fullName} size="sm" />
                          <div className="min-w-0">
                            <Link
                              href={`/candidates/${candidate._id}`}
                              className="font-medium text-slate-800 hover:text-blue-600 truncate block transition-colors"
                            >
                              {candidate.fullName}
                            </Link>
                            <p className="text-xs text-slate-400 truncate">{candidate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell truncate max-w-[180px]">
                        {candidate.appliedRole}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell text-xs">
                        {candidate.experience}
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={candidate.hiringStage} />
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                        {formatDate(candidate.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/candidates/${candidate._id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/candidates/${candidate._id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(candidate._id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 border-t border-slate-100">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                limit={data.limit}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Candidate"
        description="This will permanently delete the candidate record. This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
