'use client';

import { MonitorPlay } from 'lucide-react';
import type { GpuInfo } from '@/lib/types';

interface GpuCardProps {
  gpu: GpuInfo;
}

export function GpuCard({ gpu }: GpuCardProps) {
  const vramGb = (gpu.vram / 1024).toFixed(0);

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MonitorPlay className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Graphics Card</p>
          <h3 className="font-semibold text-lg">{gpu.vendor} {gpu.model}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-primary">{vramGb} GB</p>
          <p className="text-xs text-muted-foreground">VRAM</p>
        </div>
        {gpu.driverVersion && (
          <div className="text-center">
            <p className="text-xl font-bold font-mono text-primary">{gpu.driverVersion}</p>
            <p className="text-xs text-muted-foreground">Driver</p>
          </div>
        )}
      </div>
    </div>
  );
}
