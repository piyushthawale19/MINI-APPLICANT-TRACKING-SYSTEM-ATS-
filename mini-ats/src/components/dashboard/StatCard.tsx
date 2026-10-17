import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-green-600' : 'text-slate-400')}>
              {trend.positive ? '↑' : '→'} {trend.label}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-7 w-16 rounded" />
        </div>
        <div className="skeleton w-10 h-10 rounded-lg" />
      </div>
    </div>
  );
}
