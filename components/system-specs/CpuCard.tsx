'use client';

import { Cpu } from 'lucide-react';
import type { CpuInfo } from '@/lib/types';

interface CpuCardProps {
  cpu: CpuInfo;
}

export function CpuCard({ cpu }: CpuCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Cpu className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Processor</p>
          <h3 className="font-semibold text-lg">{cpu.manufacturer} {cpu.brand}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-primary">{cpu.physicalCores}</p>
          <p className="text-xs text-muted-foreground">Cores</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-primary">{cpu.cores}</p>
          <p className="text-xs text-muted-foreground">Threads</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-primary">{cpu.speed}</p>
          <p className="text-xs text-muted-foreground">GHz</p>
        </div>
      </div>
    </div>
  );
}
