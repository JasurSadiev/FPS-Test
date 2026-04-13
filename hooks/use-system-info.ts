'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SystemInfo } from '@/lib/types';
import { mockSystemInfo } from '@/lib/mock-data';
import type { ElectronSystemInfo } from '@/lib/electron.d';

function convertElectronToSystemInfo(electronInfo: ElectronSystemInfo): SystemInfo {
  return {
    cpu: {
      manufacturer: electronInfo.cpu.manufacturer,
      brand: electronInfo.cpu.model,
      speed: electronInfo.cpu.speed,
      cores: electronInfo.cpu.cores,
      physicalCores: electronInfo.cpu.physicalCores,
      processors: 1,
    },
    gpu: {
      vendor: electronInfo.gpu.vendor,
      model: electronInfo.gpu.model,
      vram: electronInfo.gpu.vram,
      driverVersion: electronInfo.gpu.driver,
    },
    memory: {
      total: electronInfo.ram.total * 1024 * 1024 * 1024,
      free: electronInfo.ram.free * 1024 * 1024 * 1024,
      used: electronInfo.ram.used * 1024 * 1024 * 1024,
      available: electronInfo.ram.free * 1024 * 1024 * 1024,
    },
    storage: electronInfo.storage.drives.map(drive => ({
      device: drive.name,
      type: drive.type,
      size: drive.size * 1024 * 1024 * 1024,
      available: drive.size * 1024 * 1024 * 1024 * 0.5,
    })),
    os: {
      platform: electronInfo.os.platform,
      distro: electronInfo.os.distro,
      release: electronInfo.os.release,
      arch: electronInfo.os.arch,
    },
  };
}

export function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if running in Electron
      if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
        setIsElectron(true);
        const electronInfo = await window.electronAPI.getSystemInfo();
        const converted = convertElectronToSystemInfo(electronInfo);
        setSystemInfo(converted);
      } else {
        // Use mock data for web preview
        setIsElectron(false);
        // Simulate a small delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSystemInfo(mockSystemInfo);
      }
    } catch (err) {
      console.error('Failed to get system info:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect system');
      // Fallback to mock data
      setSystemInfo(mockSystemInfo);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemInfo();
  }, [fetchSystemInfo]);

  return {
    systemInfo,
    isLoading,
    isElectron,
    error,
    refresh: fetchSystemInfo,
  };
}

// Hook for real-time monitoring (only works in Electron)
export function useSystemMonitor(intervalMs: number = 2000) {
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [gpuUsage, setGpuUsage] = useState<number>(0);
  const [gpuTemp, setGpuTemp] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.isElectron) {
      // Simulate usage in web preview
      const interval = setInterval(() => {
        setCpuUsage(Math.random() * 30 + 10);
        setMemoryUsage(Math.random() * 20 + 40);
        setGpuUsage(Math.random() * 15 + 5);
        setGpuTemp(Math.random() * 10 + 45);
      }, intervalMs);
      return () => clearInterval(interval);
    }

    // Real monitoring in Electron
    const fetchUsage = async () => {
      try {
        const [cpu, mem, gpu] = await Promise.all([
          window.electronAPI!.getCpuUsage(),
          window.electronAPI!.getMemoryUsage(),
          window.electronAPI!.getGpuUsage(),
        ]);
        setCpuUsage(cpu.currentLoad);
        setMemoryUsage(mem.usedPercent);
        setGpuUsage(gpu.utilizationGpu);
        setGpuTemp(gpu.temperatureGpu);
      } catch (err) {
        console.error('Failed to get usage:', err);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { cpuUsage, memoryUsage, gpuUsage, gpuTemp };
}
