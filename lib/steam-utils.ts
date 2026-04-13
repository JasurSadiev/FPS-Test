import type { Game, GameRequirements } from './types';

// Helps extract numbers from a string
function extractNumberAndUnit(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(MB|GB|TB)/i);
  if (!match) return null;
  let val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'MB') val = val / 1024;
  if (unit === 'TB') val = val * 1024;
  return Math.round(val);
}

// Scrape strings from Steam PC Requirements HTML
function extractRequirementStr(htmlLine: string): string {
  // Matches e.g. "<strong>Processor:</strong> Intel Core i5-8400<br>"
  // Strip all HTML tags
  const clean = htmlLine.replace(/<[^>]+>/g, '').trim();
  // Strip the prefix like "Processor:" or "Memory:"
  return clean.replace(/^[^:]+:\s*/i, '').trim();
}

export function parseSteamRequirements(requirementsHtml?: { minimum?: string; recommended?: string }): GameRequirements | null {
  if (!requirementsHtml) {
    return null;
  }

  const result: GameRequirements = {
    minCpu: 'Intel Core i5-4460', // Fallbacks
    minGpu: 'NVIDIA GeForce GTX 960',
    minRam: 8,
    minStorage: 50,
  };

  const processSection = (html: string, isMin: boolean) => {
    // split by <li> or <br> to get individual lines
    const lines = html.split(/<li>|<br\s*\/?>/i);
    
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('processor:') || lower.includes('cpu:')) {
        const val = extractRequirementStr(line);
        if (val) {
          if (isMin) result.minCpu = val.split(' / ')[0].split(' or ')[0]; // take just the first one if multiple
          else result.recCpu = val.split(' / ')[0].split(' or ')[0];
        }
      } else if (lower.includes('graphics:') || lower.includes('video card:')) {
        const val = extractRequirementStr(line);
        if (val) {
          if (isMin) result.minGpu = val.split(' / ')[0].split(' or ')[0];
          else result.recGpu = val.split(' / ')[0].split(' or ')[0];
        }
      } else if (lower.includes('memory:') || lower.includes('ram:')) {
        const val = extractRequirementStr(line);
        const ram = extractNumberAndUnit(val);
        if (ram) {
          if (isMin) result.minRam = ram;
          else result.recRam = ram;
        }
      } else if (lower.includes('storage:') || lower.includes('hard drive:')) {
        const val = extractRequirementStr(line);
        const storage = extractNumberAndUnit(val);
        if (storage) {
          if (isMin) result.minStorage = storage;
          else result.recStorage = storage;
        }
      }
    }
  };

  if (requirementsHtml.minimum) {
    processSection(requirementsHtml.minimum, true);
  }
  if (requirementsHtml.recommended) {
    processSection(requirementsHtml.recommended, false);
  } else {
    // if no recommended, copy min as recommended baseline
    result.recCpu = result.minCpu;
    result.recGpu = result.minGpu;
    result.recRam = result.minRam * 1.5;
    result.recStorage = result.minStorage;
  }

  return result;
}
