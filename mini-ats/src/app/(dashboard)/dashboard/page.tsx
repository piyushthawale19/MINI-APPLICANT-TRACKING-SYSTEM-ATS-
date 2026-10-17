'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '@/types';
import { StatCard, StatCardSkeleton } from '@/components/dashboard/StatCard';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ErrorState } from '@/components/shared/EmptyState';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStats(data);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return <ErrorState description={error} onRetry={fetchStats} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recruitment Overview</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Track candidates, monitor hiring progress, and manage your recruitment pipeline.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard
              title="Total Candidates"
              value={stats.totalCandidates}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />
            <StatCard
              title="Interviews Scheduled"
              value={stats.interviewsScheduled}
              icon={Calendar}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
            />
            <StatCard
              title="Offers Made"
              value={(stats.byStage['Offer'] || 0) + (stats.byStage['Hired'] || 0)}
              icon={TrendingUp}
              iconColor="text-orange-600"
              iconBg="bg-orange-50"
            />
            <StatCard
              title="Hires This Month"
              value={stats.hiresThisMonth}
              icon={UserCheck}
              iconColor="text-green-600"
              iconBg="bg-green-50"
              trend={
                stats.hiresThisMonth > 0
                  ? { value: stats.hiresThisMonth, label: 'this month', positive: true }
                  : undefined
              }
            />
          </>
        ) : null}
      </div>

      {/* Pipeline + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <>
            <div className="skeleton h-64 rounded-xl" />
            <div className="skeleton h-64 rounded-xl" />
          </>
        ) : stats ? (
          <>
            <PipelineChart byStage={stats.byStage} total={stats.totalCandidates} />
            <RecentActivity candidates={stats.recentCandidates} />
          </>
        ) : null}
      </div>

      {/* Stage breakdown table */}
      {!loading && stats && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Stage Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidates</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.entries(stats.byStage).map(([stage, count]) => (
                  <tr key={stage} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">{stage}</td>
                    <td className="px-5 py-3 text-right text-slate-600 font-semibold">{count}</td>
                    <td className="px-5 py-3 text-right text-slate-400">
                      {stats.totalCandidates > 0
                        ? `${Math.round((count / stats.totalCandidates) * 100)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
