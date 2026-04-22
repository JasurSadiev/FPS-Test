// System Information Types
export interface CpuInfo {
  manufacturer: string;
  brand: string;
  speed: number; // GHz
  cores: number;
  physicalCores: number;
  processors: number;
}

export interface GpuInfo {
  vendor: string;
  model: string;
  vram: number; // MB
  driverVersion?: string;
}

export interface MemoryInfo {
  total: number; // bytes
  free: number;
  used: number;
  available: number;
}

export interface StorageInfo {
  device: string;
  type: string; // SSD, HDD
  size: number; // bytes
  available: number;
}

export interface SystemInfo {
  cpu: CpuInfo;
  gpu: GpuInfo;
  memory: MemoryInfo;
  storage: StorageInfo[];
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
  };
}

// Game Types
export interface GameRequirements {
  minCpu: string;
  minGpu: string;
  minRam: number; // GB
  minStorage: number; // GB
  recCpu?: string;
  recGpu?: string;
  recRam?: number; // GB
  recStorage?: number; // GB
}

export interface Game {
  id: number;
  name: string;
  steamAppId?: number;
  coverImage?: string;
  releaseDate?: string;
  requirements: GameRequirements;
  isCustom: boolean;
}

// Compatibility Types
export type Verdict = 'cannot-run' | 'below-minimum' | 'poor-experience' | 'minimum' | 'recommended' | 'exceeds';

export interface ComponentScore {
  score: number; // 0-100
  userHardware: string;
  minRequired: string;
  recRequired?: string;
  meetsMinimum: boolean;
  meetsRecommended: boolean;
  vramPasses?: boolean; // New flag for independent VRAM check
}

export interface FpsEstimate {
  low: string;
  medium: string;
  high: string;
}

export interface CompatibilityResult {
  overallScore: number; // 0-100
  verdict: Verdict;
  components: {
    cpu: ComponentScore;
    gpu: ComponentScore;
    ram: ComponentScore;
    storage: ComponentScore;
  };
  bottleneck: string | null;
  suggestions: string[];
  fps?: FpsEstimate;
  aiAnalysis?: string;
}

// Hardware benchmark data for scoring
export interface HardwareBenchmark {
  name: string;
  score: number;
  tier: 'low' | 'mid' | 'high' | 'ultra';
}

// Steam API Types
export interface SteamSearchResult {
  appid: number;
  name: string;
  icon?: string;
}

export interface SteamAppDetails {
  steam_appid: number;
  name: string;
  header_image: string;
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  pc_requirements: {
    minimum?: string;
    recommended?: string;
  };
}
