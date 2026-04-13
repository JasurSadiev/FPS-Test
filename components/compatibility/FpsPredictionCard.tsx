'use client';

import { Activity, Monitor, Flame } from 'lucide-react';
import type { FpsEstimate } from '@/lib/types';

interface FpsPredictionCardProps {
  fps?: FpsEstimate;
}

export function FpsPredictionCard({ fps }: FpsPredictionCardProps) {
  if (!fps) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Estimated Performance</h3>
          <p className="text-sm text-muted-foreground">Expected framerates based on your hardware</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Low */}
        <div className="rounded-lg bg-muted/50 p-4 border border-border/50 flex flex-col items-center justify-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Low Quality</span>
          <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            {fps.low}
          </span>
        </div>

        {/* Medium */}
        <div className="rounded-lg bg-muted/50 p-4 border border-border/50 flex flex-col items-center justify-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Medium Quality</span>
          <span className="text-2xl font-black text-foreground">
            {fps.medium}
          </span>
        </div>

        {/* High */}
        <div className="rounded-lg bg-muted/50 p-4 border border-border/50 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-50 transition-opacity" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex gap-1 items-center">
            <Flame className="w-3 h-3 text-amber-500" /> High Quality
          </span>
          <span className="text-2xl font-black text-foreground">
            {fps.high}
          </span>
        </div>
      </div>
    </div>
  );
}
