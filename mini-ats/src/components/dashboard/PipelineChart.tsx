import { HIRING_STAGES, type HiringStage } from '@/types';
import { STAGE_COLORS } from '@/lib/utils';

interface PipelineChartProps {
  byStage: Record<string, number>;
  total: number;
}

export function PipelineChart({ byStage, total }: PipelineChartProps) {
  const activeStages = HIRING_STAGES.filter((s) => s !== 'Rejected');

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Hiring Pipeline</h3>
      <div className="space-y-3">
        {activeStages.map((stage) => {
          const count = byStage[stage] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const colors = STAGE_COLORS[stage as HiringStage];

          return (
            <div key={stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="font-medium text-slate-700">{stage}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-800">{count}</span>
                  <span>({percentage}%)</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.dot}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {byStage['Rejected'] > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Rejected</span>
          <span className="font-medium">{byStage['Rejected']}</span>
        </div>
      )}
    </div>
  );
}
