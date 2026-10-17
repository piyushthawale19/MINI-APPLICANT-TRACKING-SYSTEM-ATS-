import type { Metadata } from 'next';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';

export const metadata: Metadata = { title: 'Pipeline' };

export default function PipelinePage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recruitment Pipeline</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Visualize and manage candidates across hiring stages.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
