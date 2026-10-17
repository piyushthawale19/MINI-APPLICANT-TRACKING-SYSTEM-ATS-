import { cn } from '@/lib/utils';
import type { HiringStage } from '@/types';
import { STAGE_COLORS } from '@/lib/utils';

interface StageBadgeProps {
  stage: HiringStage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const colors = STAGE_COLORS[stage];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
      {stage}
    </span>
  );
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarSizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const colorIndex = name.charCodeAt(0) % avatarColors.length;
  const color = avatarColors[colorIndex];

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        avatarSizes[size],
        color,
        className
      )}
    >
      {initials}
    </div>
  );
}
