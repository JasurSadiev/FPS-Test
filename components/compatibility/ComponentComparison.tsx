'use client';

import { cn } from '@/lib/utils';
import type { ComponentScore } from '@/lib/types';
import { CheckCircle2, XCircle, MinusCircle, User, ShieldCheck, Sparkles } from 'lucide-react';

interface ComponentComparisonProps {
  label: string;
  icon: React.ReactNode;
  score: ComponentScore;
}

export function ComponentComparison({ label, icon, score }: ComponentComparisonProps) {
  const getProgressColor = (value: number) => {
    if (value < 50) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    if (value < 90) return 'bg-green-500';
    return 'bg-cyan-400';
  };

  return (
    <div className="glass-card rounded-2xl p-5 space-y-5 border border-white/5 hover:border-primary/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            {icon}
          </div>
          <div>
            <h3 className="font-black italic text-sm uppercase tracking-wider">{label}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
               {score.meetsRecommended ? (
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">Peak Performance</span>
              ) : score.meetsMinimum ? (
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Meets Minimum</span>
              ) : (
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Below Spec</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors">
            {score.score}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn('h-full transition-all duration-1000 cube-shimmer rounded-full', getProgressColor(score.score))}
          style={{ width: `${score.score}%` }}
        />
      </div>

      {/* Detailed Spec Stack */}
      <div className="space-y-3 pt-1">
        {/* User Spec */}
        <div className="relative group/row">
          <div className="flex justify-between items-start mb-1 px-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
              <User className="w-2.5 h-2.5" /> Your Hardware
            </span>
            {score.meetsMinimum ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 group-hover/row:bg-white/[0.05] transition-colors leading-relaxed">
            <p className="text-[13px] font-bold text-foreground">
              {score.userHardware}
            </p>
          </div>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Minimum */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" /> Minimum Req
            </span>
            <div className="p-2.5 rounded-xl bg-muted/30 border border-white/5 min-h-[50px] flex items-center">
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                {score.minRequired}
              </p>
            </div>
          </div>

          {/* Recommended */}
          {score.recRequired && (
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Recommended
              </span>
              <div className="p-2.5 rounded-xl bg-muted/30 border border-white/5 min-h-[50px] flex items-center">
                <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {score.recRequired}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

