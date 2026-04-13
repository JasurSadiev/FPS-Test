'use client';

import { MemoryStick } from 'lucide-react';
import type { MemoryInfo } from '@/lib/types';

interface RamCardProps {
  memory: MemoryInfo;
}

export function RamCard({ memory }: RamCardProps) {
  const totalGb = (memory.total / (1024 * 1024 * 1024)).toFixed(0);
  const usedGb = (memory.used / (1024 * 1024 * 1024)).toFixed(1);
  const usedPercent = ((memory.used / memory.total) * 100).toFixed(0);

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MemoryStick className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Memory</p>
          <h3 className="font-semibold text-lg">{totalGb} GB RAM</h3>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Usage</span>
          <span className="font-mono">{usedGb} / {totalGb} GB</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{usedPercent}% in use</p>
      </div>
    </div>
  );
}
