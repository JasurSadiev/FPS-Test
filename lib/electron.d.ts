export interface ElectronSystemInfo {
  cpu: {
    model: string;
    manufacturer: string;
    cores: number;
    physicalCores: number;
    speed: number;
    speedMax: number;
  };
  gpu: {
    model: string;
    vendor: string;
    vram: number;
    driver: string;
  };
  ram: {
    total: number;
    free: number;
    used: number;
  };
  storage: {
    total: number;
    drives: Array<{
      name: string;
      type: string;
      size: number;
    }>;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
  };
  isElectron: boolean;
}

export interface CpuUsage {
  currentLoad: number;
  cpus: number[];
}

export interface MemoryUsage {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
}

export interface GpuUsage {
  utilizationGpu: number;
  utilizationMemory: number;
  temperatureGpu: number;
}

export interface ElectronAPI {
  getSystemInfo: () => Promise<ElectronSystemInfo>;
  getCpuUsage: () => Promise<CpuUsage>;
  getMemoryUsage: () => Promise<MemoryUsage>;
  getGpuUsage: () => Promise<GpuUsage>;
  isElectron: boolean;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
