'use client';

import type { SystemInfo } from '@/lib/types';
import { CpuCard } from './CpuCard';
import { GpuCard } from './GpuCard';
import { RamCard } from './RamCard';
import { StorageCard } from './StorageCard';
import { Monitor, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemOverviewProps {
  systemInfo: SystemInfo;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function SystemOverview({ systemInfo, onRefresh, isLoading }: SystemOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">System Specifications</h2>
            <p className="text-sm text-muted-foreground">
              {systemInfo.os.distro} {systemInfo.os.arch}
            </p>
          </div>
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Rescan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CpuCard cpu={systemInfo.cpu} />
        <GpuCard gpu={systemInfo.gpu} />
        <RamCard memory={systemInfo.memory} />
        <StorageCard storage={systemInfo.storage} />
      </div>
    </div>
  );
}
