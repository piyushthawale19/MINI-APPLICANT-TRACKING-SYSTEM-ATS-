import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HiringStage } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

export const STAGE_COLORS: Record<HiringStage, { bg: string; text: string; dot: string }> = {
  Applied: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Screening: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Interview: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Offer: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  Hired: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export const STAGE_ORDER: HiringStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }
  return query.toString();
}
