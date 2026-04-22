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
  
  // High End (80-100)
  if (nameLower.includes('4090') || nameLower.includes('7900 xtx')) return 100;
  if (nameLower.includes('4080') || nameLower.includes('7900 xt')) return 92;
  if (nameLower.includes('4070 ti') || nameLower.includes('7900 gre')) return 88;
  if (nameLower.includes('4070') || nameLower.includes('7800 xt')) return 82;
  if (nameLower.includes('3090') || nameLower.includes('6950 xt')) return 85;
  if (nameLower.includes('3080') || nameLower.includes('6900 xt')) return 80;
  
  // Upper Mid (60-79)
  if (nameLower.includes('4060 ti') || nameLower.includes('7700 xt')) return 75;
  if (nameLower.includes('3070 ti') || nameLower.includes('6800 xt')) return 72;
  if (nameLower.includes('3070') || nameLower.includes('6800')) return 68;
  if (nameLower.includes('2080 ti')) return 65;
  if (nameLower.includes('2080 super') || nameLower.includes('3060 ti')) return 62;
  if (nameLower.includes('2080') || nameLower.includes('6700 xt')) return 60;

  // Mid Range (40-59)
  if (nameLower.includes('4060') || nameLower.includes('7600')) return 58;
  if (nameLower.includes('3060') || nameLower.includes('6600 xt')) return 55;
  if (nameLower.includes('2070') || nameLower.includes('6600')) return 52;
  if (nameLower.includes('1080 ti') || nameLower.includes('5700 xt')) return 50;
  if (nameLower.includes('2060 super') || nameLower.includes('arc a770')) return 48;
  if (nameLower.includes('2060') || nameLower.includes('5700') || nameLower.includes('arc a750')) return 45;
  if (nameLower.includes('1080') || nameLower.includes('vega 64')) return 42;
  if (nameLower.includes('1070') || nameLower.includes('5600 xt')) return 40;

  // Budget / Older (20-39)
  if (nameLower.includes('3050') || nameLower.includes('1660 ti')) return 38;
  if (nameLower.includes('1660 super') || nameLower.includes('1660')) return 35;
  if (nameLower.includes('1060 6gb') || nameLower.includes('590')) return 32;
  if (nameLower.includes('1060 3gb') || nameLower.includes('580') || nameLower.includes('480')) return 30;
  if (nameLower.includes('1650 super') || nameLower.includes('5500 xt')) return 28;
  if (nameLower.includes('1650') || nameLower.includes('570')) return 25;
  if (nameLower.includes('970') || nameLower.includes('1050 ti')) return 22;
  if (nameLower.includes('960') || nameLower.includes('1050')) return 20;

  // Legacy / Basic (0-19)
  let baseScore = 15;
  if (nameLower.includes('1030') || nameLower.includes('750') || nameLower.includes('950')) baseScore = 12;
  else if (nameLower.includes('640') || nameLower.includes('650') || nameLower.includes('550')) baseScore = 8;
  else if (nameLower.includes('integrated') || nameLower.includes('graphics') || nameLower.includes('hd ')) baseScore = 5;

  // Smarter fallback: Guess based on VRAM also
  const vramGb = vramMb / 1024;
  let bonus = 0;
  if (vramGb >= 16) bonus = 5;
  else if (vramGb >= 12) bonus = 3;
  else if (vramGb >= 8) bonus = 1;
  else if (vramGb < 4) bonus = -5;

  return Math.min(100, Math.max(0, baseScore + bonus));
}

// Realistic CPU Scoring
function scoreCpuRealistic(name: string, cores: number, speed: number): number {
  const nameLower = name.toLowerCase();
  
  // High End
  if (nameLower.includes('14900') || nameLower.includes('7950x')) return 100;
  if (nameLower.includes('13900') || nameLower.includes('7900x')) return 92;
  if (nameLower.includes('12900') || nameLower.includes('5950x')) return 85;
  
  // Upper Mid
  if (nameLower.includes('14700') || nameLower.includes('7800x')) return 80;
  if (nameLower.includes('13700') || nameLower.includes('7700x')) return 78;
  if (nameLower.includes('12700') || nameLower.includes('5800x')) return 72;
  if (nameLower.includes('13600') || nameLower.includes('7600')) return 68;

  // Mid Range
  if (nameLower.includes('12600') || nameLower.includes('5600x')) return 60;
  if (nameLower.includes('12400') || nameLower.includes('5600')) return 55;
  if (nameLower.includes('10700') || nameLower.includes('3700x')) return 52;
  if (nameLower.includes('10400') || nameLower.includes('3600')) return 48;
  if (nameLower.includes('i7') || nameLower.includes('ryzen 7')) return 45;
  if (nameLower.includes('i5') || nameLower.includes('ryzen 5')) return 40;

  // Budget / Older
  let baseScore = 30;
  if (nameLower.includes('i3') || nameLower.includes('ryzen 3') || nameLower.includes('quad')) baseScore = 35;
  else if (nameLower.includes('duo') || nameLower.includes('pentium') || nameLower.includes('celeron')) baseScore = 15;

  // Core bonus: Add (coreCount - 4) * 2 clamped to max +20 bonus
  const coreBonus = Math.min(20, Math.max(0, (cores - 4) * 2));
  
  // GHz bonus: Add (ghz - 3.0) * 5 clamped to max +10 bonus
  const ghzBonus = Math.min(10, Math.max(0, (speed - 3.0) * 5));

  return Math.min(100, Math.max(0, baseScore + coreBonus + ghzBonus));
}

// Realistic RAM Scoring
function scoreRamRealistic(bytes: number): number {
  if (!bytes || isNaN(bytes)) return 0;
  
  const gb = bytes / (1024 * 1024 * 1024);
  
  // Handle extreme high-end
  if (gb >= 64) return 100;
  // Handle extreme low-end
  if (gb <= 0.5) return 0;

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
  
  return 45; // Safe default for middle-tier if loop somehow misses
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

// Generate FPS estimates using game-relative performance scaling
function estimateFpsRealistic(userScores: any, reqScores: any): FpsEstimate {
  // Use weighted formula for composite scores
  const getComposite = (s: any) => (s.gpu * 0.55) + (s.cpu * 0.25) + (s.ram * 0.15) + (s.storage * 0.05);
  
  const userC = getComposite(userScores);
  const minC = getComposite(reqScores.min);
  const recC = reqScores.rec.gpu > 0 ? getComposite(reqScores.rec) : minC * 1.5;

  // Reliability flag
  const isBelowMin = userC < minC * 0.95;

  // Base FPS scaling:
  // If user == min, base ~35 FPS
  // If user == rec, base ~75 FPS
  let baseFps = 30;
  if (userC >= recC) {
    const ratio = userC / recC;
    baseFps = 60 + (ratio - 1) * 60; // Scale up beyond 60
  } else if (userC >= minC) {
    const ratio = (userC - minC) / (recC - minC);
    baseFps = 35 + ratio * 35; // Interpolate between 35 and 70
  } else {
    const ratio = userC / minC;
    baseFps = 15 + ratio * 20; // Falling below minimum
  }

  // Quality multipliers
  const multipliers = { low: 1.2, medium: 1.0, high: 0.65 };
  
  const calculateTier = (quality: keyof typeof multipliers) => {
    const targetFps = baseFps * multipliers[quality];
    const variance = targetFps * 0.1;
    const min = Math.max(10, Math.round(targetFps - variance));
    const max = Math.round(targetFps + variance);

    let result = max < 25 ? '<30 FPS' : `${min}-${max} FPS`;
    
    // Add stability warning if below minimum
    if (isBelowMin) {
      result += ' (May be unstable)';
    }
    
    return result;
  };

  return {
    low: calculateTier('low'),
    medium: calculateTier('medium'),
    high: calculateTier('high'),
  };
}

/**
 * Generate upgrade suggestions based on realistic scores
 */
function generateSuggestions(components: CompatibilityResult['components']): string[] {
  const suggestions: string[] = [];
  const sortedComponents = Object.entries(components).sort(([, a], [, b]) => a.score - b.score);

  for (const [component, score] of sortedComponents) {
    if (score.score < 50) {
      switch (component) {
        case 'gpu': suggestions.push(`A GPU upgrade would significantly boost your performance`); break;
        case 'cpu': suggestions.push(`Your CPU is currently a major performance bottleneck`); break;
        case 'ram': suggestions.push(`Upgrading to 16GB RAM would reduce micro-stutters`); break;
        case 'storage': suggestions.push(`Switching to an NVMe SSD would improve loading times`); break;
      }
    }
  }
  return suggestions.slice(0, 3);
}

/**
 * Helper to parse VRAM from a requirement string (e.g. "1GB GPU" -> 1024)
 */
function parseVramFromStr(str: string): number {
  if (!str) return 1024;
  const match = str.match(/(\d+)\s*(GB|MB)/i);
  if (!match) return 1024; 
  let val = parseInt(match[1]);
  if (match[2].toUpperCase() === 'GB') val *= 1024;
  return val;
}

/**
 * Extracts approximate cores and GHz from a CPU requirement string
 */
function parseCpuDetails(str: string): { cores: number; speed: number } {
  const s = str.toLowerCase();
  let cores = 4;
  let speed = 3.0;

  // Extract GHz
  const ghzMatch = s.match(/(\d+\.?\d*)\s*ghz/);
  if (ghzMatch) speed = parseFloat(ghzMatch[1]);

  // Infer cores from common names
  if (s.includes('i9') || s.includes('ryzen 9')) cores = 12;
  else if (s.includes('i7') || s.includes('ryzen 7') || s.includes('8-core')) cores = 8;
  else if (s.includes('i5') || s.includes('ryzen 5') || s.includes('6-core')) cores = 6;
  else if (s.includes('quad') || s.includes('4-core')) cores = 4;
  else if (s.includes('dual') || s.includes('2-core')) cores = 2;

  return { cores, speed };
}

/**
 * Helper to score a set of requirements - NO MAGIC NUMBERS
 */
function getRequirementScores(reqs: Game['requirements']) {
  const minVram = parseVramFromStr(reqs.minGpu);
  const recVram = reqs.recGpu ? parseVramFromStr(reqs.recGpu) : minVram * 1.5;

  const minCpu = parseCpuDetails(reqs.minCpu);
  const recCpu = reqs.recCpu ? parseCpuDetails(reqs.recCpu) : { cores: minCpu.cores + 2, speed: minCpu.speed + 0.5 };

  return {
    min: {
      gpu: scoreGpuRealistic(reqs.minGpu, minVram),
      cpu: scoreCpuRealistic(reqs.minCpu, minCpu.cores, minCpu.speed),
      ram: scoreRamRealistic(reqs.minRam * 1024 * 1024 * 1024),
      storage: scoreStorageRealistic('HDD')
    },
    rec: {
      gpu: reqs.recGpu ? scoreGpuRealistic(reqs.recGpu, recVram) : 0,
      cpu: reqs.recCpu ? scoreCpuRealistic(reqs.recCpu, recCpu.cores, recCpu.speed) : 0,
      ram: reqs.recRam ? scoreRamRealistic(reqs.recRam * 1024 * 1024 * 1024) : 0,
      storage: scoreStorageRealistic('SSD')
    }
  };
}

/**
 * Determine bottleneck and suggestions
 */
function determineBottleneck(components: any): string | null {
  const sorted = Object.entries(components).sort(([, a]: any, [, b]: any) => a.score - b.score);
  return sorted[0][1].score < 70 ? sorted[0][0].toUpperCase() : null;
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

  // Step 2 — Get requirement scores (Score vs. Score)
  const reqScores = getRequirementScores(requirements);

  // Step 3 — Physical VRAM override (Direct GB comparison as requested)
  // Converting MB to GB for the comparison
  const userVramGb = system.gpu.vram / 1024;
  const reqMinVramGb = parseVramFromStr(requirements.minGpu) / 1024;
  const vramPasses = userVramGb >= reqMinVramGb;

  // Step 4 — Composite Component Result (Relative comparisons)
  const components = {
    cpu: {
      score: userScores.cpu,
      userHardware: `${system.cpu.manufacturer} ${system.cpu.brand}`,
      minRequired: requirements.minCpu,
      recRequired: requirements.recCpu || 'Not Specified',
      meetsMinimum: userScores.cpu >= reqScores.min.cpu,
      meetsRecommended: reqScores.rec.cpu > 0 && userScores.cpu >= reqScores.rec.cpu,
    },
    gpu: {
      score: userScores.gpu,
      userHardware: `${system.gpu.vendor} ${system.gpu.model}`,
      minRequired: requirements.minGpu,
      recRequired: requirements.recGpu || 'Not Specified',
      meetsMinimum: userScores.gpu >= reqScores.min.gpu && vramPasses,
      meetsRecommended: reqScores.rec.gpu > 0 && userScores.gpu >= reqScores.rec.gpu,
      vramPasses, // Pass our direct GB check flag
    },
    ram: {
      score: Math.round((userScores.ram / (reqScores.rec.ram || reqScores.min.ram * 1.5)) * 100),
      userHardware: `${(system.memory.total / (1024 ** 3)).toFixed(0)} GB`,
      minRequired: `${requirements.minRam} GB`,
      recRequired: requirements.recRam ? `${requirements.recRam} GB` : undefined,
      meetsMinimum: (system.memory.total / (1024 ** 3)) >= (requirements.minRam - 0.1),
      meetsRecommended: requirements.recRam ? (system.memory.total / (1024 ** 3)) >= (requirements.recRam - 0.1) : false,
    },
    storage: {
      score: userScores.storage,
      userHardware: system.storage[0] 
        ? `${system.storage[0].type} - ${(system.storage[0].size / (1024 ** 3)).toFixed(0)} GB`
        : 'HDD',
      minRequired: `${requirements.minStorage} GB`,
      recRequired: requirements.recStorage ? `${requirements.recStorage} GB` : undefined,
      meetsMinimum: userScores.storage >= reqScores.min.storage,
      meetsRecommended: reqScores.rec.storage > 0 ? userScores.storage >= reqScores.rec.storage : true,
    },
  };

  // Step 5 — Overall Verdict
  const meetsMinimum = Object.values(components).every(c => c.meetsMinimum);
  const meetsRecommended = Object.values(components).every(c => c.meetsRecommended);
  
  const fps = estimateFpsRealistic(userScores, reqScores);
  
  // FIXED: Overall score is now a COMPATIBILITY RATING (0-100%)
  const userC = (userScores.gpu * 0.55) + (userScores.cpu * 0.25) + (userScores.ram * 0.15) + (userScores.storage * 0.05);
  const recC = reqScores.rec.gpu > 0 ? (reqScores.rec.gpu * 0.55) + (reqScores.rec.cpu * 0.25) + (reqScores.rec.ram * 0.15) + (reqScores.rec.storage * 0.05) : (reqScores.min.gpu * 1.5 * 0.55) + (reqScores.min.cpu * 1.3 * 0.25) + (reqScores.min.ram * 1.5 * 0.15) + (reqScores.min.storage * 0.05);

  const overallScore = Math.min(100, Math.round((userC / recC) * 100));

  let verdict: Verdict;
  if (meetsRecommended && overallScore >= 90) {
    verdict = 'exceeds';
  } else if (meetsRecommended) {
    verdict = 'recommended';
  } else if (meetsMinimum) {
    verdict = 'minimum';
  } else if (overallScore >= 40) {
    verdict = 'poor-experience';
  } else if (overallScore >= 20) {
    verdict = 'below-minimum';
  } else {
    verdict = 'cannot-run';
  }

  const bottleneck = determineBottleneck(components);
  const suggestions = generateSuggestions(components);

  return {
    overallScore,
    verdict,
    components,
    bottleneck: overallScore < 75 ? bottleneck : null,
    suggestions,
    fps,
  };
}

export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'cannot-run': return 'text-red-500';
    case 'below-minimum': return 'text-orange-500';
    case 'poor-experience': return 'text-orange-500';
    case 'minimum': return 'text-yellow-500';
    case 'recommended': return 'text-green-500';
    case 'exceeds': return 'text-cyan-400';
  }
}

export function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'cannot-run': return 'Cannot Run';
    case 'below-minimum': return 'Below Minimum';
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
