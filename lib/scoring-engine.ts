import type { SystemInfo, Game, CompatibilityResult, ComponentScore, Verdict, HardwareBenchmark } from './types';
import { cpuBenchmarks, gpuBenchmarks } from './mock-data';

// Scoring weights
const WEIGHTS = {
  gpu: 0.40,
  cpu: 0.35,
  ram: 0.15,
  storage: 0.10,
};

// Realistic GPU Scoring
function scoreGpuRealistic(name: string, vramMb: number): number {
  const nameLower = name.toLowerCase();
  let baseScore = 15; // Lower fallback for unknown/general cards

  // Tiered lookup
  if (nameLower.includes('4090') || nameLower.includes('7900 xtx')) baseScore = 100;
  else if (nameLower.includes('4070') || nameLower.includes('7800 xt')) baseScore = 78;
  else if (nameLower.includes('3060') || nameLower.includes('6600')) baseScore = 58;
  else if (nameLower.includes('1660') || nameLower.includes('580')) baseScore = 38;
  else if (nameLower.includes('1050') || nameLower.includes('960')) baseScore = 18;
  else if (nameLower.includes('1030') || nameLower.includes('750') || nameLower.includes('950')) baseScore = 12;
  else if (nameLower.includes('640') || nameLower.includes('650') || nameLower.includes('550')) baseScore = 8;
  else if (nameLower.includes('integrated') || nameLower.includes('graphics') || nameLower.includes('hd ')) baseScore = 5;

  // VRAM bonus
  const vramGb = vramMb / 1024;
  let bonus = 0;
  if (vramGb >= 16) bonus = 5;
  else if (vramGb >= 12) bonus = 3;
  else if (vramGb >= 8) bonus = 1;
  else if (vramGb < 4) bonus = -10;

  return Math.min(100, Math.max(0, baseScore + bonus));
}

// Realistic CPU Scoring
function scoreCpuRealistic(name: string, cores: number, speed: number): number {
  const nameLower = name.toLowerCase();
  let baseScore = 25; // Lower fallback for unknown/general CPUs

  // Tiered lookup
  if (nameLower.includes('14900k') || nameLower.includes('7950x')) baseScore = 95;
  else if (nameLower.includes('13700k') || nameLower.includes('7700x')) baseScore = 80;
  else if (nameLower.includes('13600k') || nameLower.includes('7600')) baseScore = 68;
  else if (nameLower.includes('10400') || nameLower.includes('3600')) baseScore = 52;
  else if (nameLower.includes('i3') || nameLower.includes('ryzen 3') || nameLower.includes('quad') || nameLower.includes('xeon')) baseScore = 38;
  else if (nameLower.includes('duo') || nameLower.includes('pentium') || nameLower.includes('celeron')) baseScore = 15;

  // Core bonus: Add (coreCount - 4) * 1.5 clamped to max +12 bonus
  const coreBonus = Math.min(12, Math.max(0, (cores - 4) * 1.5));
  
  // GHz bonus: Add (ghz - 3.0) * 4 clamped to max +8 bonus
  const ghzBonus = Math.min(8, Math.max(0, (speed - 3.0) * 4));

  return Math.min(100, Math.max(0, baseScore + coreBonus + ghzBonus));
}

// Realistic RAM Scoring
function scoreRamRealistic(bytes: number): number {
  const gb = bytes / (1024 * 1024 * 1024);
  const breakpoints = [
    { gb: 0, score: 0 },
    { gb: 4, score: 15 },
    { gb: 8, score: 45 },
    { gb: 16, score: 72 },
    { gb: 32, score: 88 },
    { gb: 64, score: 100 }
  ];

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const start = breakpoints[i];
    const end = breakpoints[i + 1];
    if (gb >= start.gb && gb <= end.gb) {
      // Linear interpolation
      const ratio = (gb - start.gb) / (end.gb - start.gb);
      return Math.round(start.score + ratio * (end.score - start.score));
    }
  }
  return 100;
}

// Realistic Storage Scoring
function scoreStorageRealistic(type: string): number {
  let baseScore = 25; // HDD
  let speedMBps = 150; // HDD default

  if (type.toUpperCase().includes('NVME') || type.toUpperCase().includes('SSD')) {
    if (type.toUpperCase().includes('NVME')) {
      baseScore = 70;
      speedMBps = 3500;
    } else {
      baseScore = 50;
      speedMBps = 500;
    }
  }

  const speedBonus = Math.min(25, Math.max(0, (speedMBps - 100) / 50));
  return Math.min(100, Math.max(0, baseScore + speedBonus));
}

// Generate FPS estimates using realistic power curve formula
function estimateFpsRealistic(gpuScore: number, cpuScore: number, ramScore: number, storageScore: number): FpsEstimate {
  // Step 2 — Weighted composite score
  const weighted = (gpuScore * 0.55) + (cpuScore * 0.25) + (ramScore * 0.15) + (storageScore * 0.05);
  
  // Step 3 — Apply a power curve
  const MAX_FPS = 240;
  const curved = MAX_FPS * Math.pow(weighted / 100, 0.8);

  // Step 4 — Apply quality multipliers
  const multipliers = { low: 1.0, medium: 0.70, high: 0.45 };
  const minFPS = { low: 24, medium: 15, high: 10 };

  const calculateTier = (quality: keyof typeof multipliers) => {
    const fps = Math.round(curved * multipliers[quality]);
    const finalFPS = Math.max(fps, minFPS[quality]);
    
    // Step 5 — Add variance range
    const variance = Math.round(finalFPS * 0.07);
    const min = Math.max(minFPS[quality], finalFPS - variance);
    const max = finalFPS + variance;

    if (max < 30) return '<30 FPS';
    return `${min}-${max} FPS`;
  };

  return {
    low: calculateTier('low'),
    medium: calculateTier('medium'),
    high: calculateTier('high'),
  };
}

// Determine verdict based on score and estimated performance
function determineVerdict(score: number, components: CompatibilityResult['components'], fps: FpsEstimate): Verdict {
  const allMeetMinimum = Object.values(components).every(c => c.meetsMinimum);
  const allMeetRecommended = Object.values(components).every(c => c.meetsRecommended);

  if (!allMeetMinimum) {
    // AS REQUESTED: Only show "Cannot Run" if they are truly on integrated/ultra-low end hardware (score < 10)
    // If they have a dedicated GPU (even a 1050), never show 'cannot-run'
    if (components.gpu.score >= 12) return 'poor-experience';
    return 'cannot-run';
  }

  // Parse Low FPS to check for poor experience
  const lowFpsAvg = fps.low.includes('-') 
    ? (parseInt(fps.low.split('-')[0]) + parseInt(fps.low.split('-')[1])) / 2 
    : (fps.low.includes('<30') ? 25 : 144);

  if (lowFpsAvg < 30) return 'poor-experience';

  if (score >= 90) return 'exceeds';
  if (allMeetRecommended && score >= 75) return 'recommended';
  return 'minimum';
}

// Generate upgrade suggestions based on realistic scores
function generateSuggestions(components: CompatibilityResult['components']): string[] {
  const suggestions: string[] = [];

  const sortedComponents = Object.entries(components)
    .sort(([, a], [, b]) => a.score - b.score);

  for (const [component, score] of sortedComponents) {
    if (score.score < 50) {
      switch (component) {
        case 'gpu':
          suggestions.push(`A GPU upgrade would significantly boost your performance`);
          break;
        case 'cpu':
          suggestions.push(`Your CPU is currently a major performance bottleneck`);
          break;
        case 'ram':
          suggestions.push(`Upgrading to 16GB RAM would reduce micro-stutters`);
          break;
        case 'storage':
          suggestions.push(`Switching to an NVMe SSD would improve loading times`);
          break;
      }
    }
  }

  return suggestions.slice(0, 3);
}

// Helper to parse VRAM from a requirement string (e.g. "1GB GPU" -> 1024)
function parseVramFromStr(str: string): number {
  const match = str.match(/(\d+)\s*(GB|MB)/i);
  if (!match) return 1024; // Default 1GB
  let val = parseInt(match[1]);
  if (match[2].toUpperCase() === 'GB') val *= 1024;
  return val;
}

// Helper to score a set of requirements
function getRequirementScores(reqs: Game['requirements']) {
  const minVram = parseVramFromStr(reqs.minGpu);
  const recVram = reqs.recGpu ? parseVramFromStr(reqs.recGpu) : minVram * 1.5;

  return {
    min: {
      gpu: scoreGpuRealistic(reqs.minGpu, minVram),
      cpu: scoreCpuRealistic(reqs.minCpu, 4, 3.0),
      ram: scoreRamRealistic(reqs.minRam * 1024 * 1024 * 1024),
      storage: scoreStorageRealistic('HDD')
    },
    rec: {
      gpu: reqs.recGpu ? scoreGpuRealistic(reqs.recGpu, recVram) : 0,
      cpu: reqs.recCpu ? scoreCpuRealistic(reqs.recCpu, 6, 3.5) : 0,
      ram: reqs.recRam ? scoreRamRealistic(reqs.recRam * 1024 * 1024 * 1024) : 0,
      storage: scoreStorageRealistic('SSD')
    }
  };
}

// Main compatibility check function
export function checkCompatibility(system: SystemInfo, game: Game): CompatibilityResult {
  const { requirements } = game;

  // Step 1 — Score user hardware
  const userScores = {
    gpu: scoreGpuRealistic(`${system.gpu.vendor} ${system.gpu.model}`, system.gpu.vram),
    cpu: scoreCpuRealistic(`${system.cpu.manufacturer} ${system.cpu.brand}`, system.cpu.cores, system.cpu.speed),
    ram: scoreRamRealistic(system.memory.total),
    storage: scoreStorageRealistic(system.storage[0]?.type || 'HDD')
  };

  // Step 2 — Get requirement scores
  const reqScores = getRequirementScores(requirements);

  // Step 3 — Physical VRAM override (Direct comparison)
  const reqMinVramMb = parseVramFromStr(requirements.minGpu);
  const vramPasses = system.gpu.vram >= reqMinVramMb;

  // Step 4 — Composite Component Result
  const components = {
    cpu: {
      score: userScores.cpu,
      userHardware: `${system.cpu.manufacturer} ${system.cpu.brand}`,
      minRequired: requirements.minCpu,
      recRequired: requirements.recCpu,
      meetsMinimum: userScores.cpu >= reqScores.min.cpu,
      meetsRecommended: reqScores.rec.cpu > 0 && userScores.cpu >= reqScores.rec.cpu,
    },
    gpu: {
      score: userScores.gpu,
      userHardware: `${system.gpu.vendor} ${system.gpu.model}`,
      minRequired: requirements.minGpu,
      recRequired: requirements.recGpu,
      meetsMinimum: userScores.gpu >= reqScores.min.gpu && vramPasses,
      meetsRecommended: reqScores.rec.gpu > 0 && userScores.gpu >= reqScores.rec.gpu,
    },
    ram: {
      score: userScores.ram,
      userHardware: `${(system.memory.total / (1024 ** 3)).toFixed(0)} GB`,
      minRequired: `${requirements.minRam} GB`,
      recRequired: requirements.recRam ? `${requirements.recRam} GB` : undefined,
      meetsMinimum: (system.memory.total / (1024 ** 3)) >= requirements.minRam * 0.9,
      meetsRecommended: requirements.recRam ? (system.memory.total / (1024 ** 3)) >= requirements.recRam * 0.95 : false,
    },
    storage: {
      score: userScores.storage,
      userHardware: system.storage[0] 
        ? `${system.storage[0].type} - ${(system.storage[0].size / (1024 ** 3)).toFixed(0)} GB (${(system.storage[0].available / (1024 ** 3)).toFixed(0)} GB Free)`
        : 'HDD',
      minRequired: `${requirements.minStorage} GB`,
      recRequired: requirements.recStorage ? `${requirements.recStorage} GB` : undefined,
      meetsMinimum: userScores.storage >= reqScores.min.storage,
      meetsRecommended: userScores.storage >= reqScores.rec.storage,
    },
  };

  // Step 5 — Overall Verdict
  const meetsMinimum = Object.values(components).every(c => c.meetsMinimum);
  const meetsRecommended = Object.values(components).every(c => c.meetsRecommended);
  
  const fps = estimateFpsRealistic(userScores.gpu, userScores.cpu, userScores.ram, userScores.storage);
  const overallScore = Math.round((userScores.gpu * 0.55) + (userScores.cpu * 0.25) + (userScores.ram * 0.15) + (userScores.storage * 0.05));

  let verdict: Verdict;
  if (meetsRecommended) {
    verdict = 'recommended';
  } else if (meetsMinimum) {
    verdict = 'minimum';
  } else if (system.gpu.model.toLowerCase().includes('integrated') || system.gpu.model.toLowerCase().includes('graphics')) {
    verdict = 'cannot-run'; // Only for true integrated/missing GPU cases
  } else {
    verdict = 'poor-experience'; // Acts as "below minimum" for dedicated hardware
  }

  // Adjust "poor-experience" if FPS is high but requirements failed (unlikely but possible)
  const lowFpsVal = parseInt(fps.low);
  if (verdict === 'minimum' && lowFpsVal < 30) {
    verdict = 'poor-experience';
  }

  // Determine bottleneck
  const sorted = Object.entries(components).sort(([, a], [, b]) => a.score - b.score);
  const bottleneck = sorted[0][0].toUpperCase();

  const suggestions = generateSuggestions(components);

  return {
    overallScore,
    verdict,
    components,
    bottleneck: overallScore < 70 ? bottleneck : null,
    suggestions,
    fps,
  };
}

export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'cannot-run': return 'text-red-500';
    case 'poor-experience': return 'text-orange-500';
    case 'minimum': return 'text-yellow-500';
    case 'recommended': return 'text-green-500';
    case 'exceeds': return 'text-cyan-400';
  }
}

export function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'cannot-run': return 'Cannot Run';
    case 'poor-experience': return 'Poor Experience';
    case 'minimum': return 'Meets Minimum';
    case 'recommended': return 'Meets Recommended';
    case 'exceeds': return 'Exceeds Requirements';
  }
}

export function getScoreColor(score: number): string {
  if (score < 50) return 'score-cannot-run';
  if (score < 75) return 'score-minimum';
  if (score < 90) return 'score-recommended';
  return 'score-exceeds';
}
