'use client';

import { cn } from '@/lib/utils';
import type { Verdict } from '@/lib/types';
import { getVerdictLabel } from '@/lib/scoring-engine';
import { CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
}

const verdictStyles: Record<Verdict, { bg: string; text: string; border: string; icon: typeof CheckCircle2 }> = {
  'cannot-run': {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/30',
    icon: XCircle,
  },
  'poor-experience': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    border: 'border-orange-500/30',
    icon: AlertCircle,
  },
  'minimum': {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    border: 'border-yellow-500/30',
    icon: AlertCircle,
  },
  'recommended': {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/30',
    icon: CheckCircle2,
  },
  'exceeds': {
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-400',
    border: 'border-cyan-400/30',
    icon: Sparkles,
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const iconSizes = {
  sm: 12,
  md: 16,
  lg: 20,
};

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  const style = verdictStyles[verdict];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        style.bg,
        style.text,
        style.border,
        sizeStyles[size]
      )}
    >
      <Icon size={iconSizes[size]} />
      <span>{getVerdictLabel(verdict)}</span>
    </div>
  );
}
