'use client';

import { HardDrive } from 'lucide-react';
import type { StorageInfo } from '@/lib/types';

interface StorageCardProps {
  storage: StorageInfo[];
}

export function StorageCard({ storage }: StorageCardProps) {
  const totalSize = storage.reduce((sum, s) => sum + s.size, 0);
  const totalAvailable = storage.reduce((sum, s) => sum + s.available, 0);
  const totalSizeGb = (totalSize / (1024 * 1024 * 1024)).toFixed(0);
  const availableGb = (totalAvailable / (1024 * 1024 * 1024)).toFixed(0);
  const usedPercent = (((totalSize - totalAvailable) / totalSize) * 100).toFixed(0);

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <HardDrive className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Storage</p>
          <h3 className="font-semibold text-lg">{totalSizeGb} GB Total</h3>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available</span>
            <span className="font-mono text-green-500">{availableGb} GB</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          {storage.map((drive, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate flex-1">{drive.device}</span>
              <span className="font-mono px-2 py-0.5 rounded bg-muted ml-2">
                {drive.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
