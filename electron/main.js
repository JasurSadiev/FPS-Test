const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');
const http = require('http');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Disable security restrictions so local file:// assets load correctly
      webSecurity: false,
      allowRunningInsecureContent: true,
      sandbox: false,
    },
    backgroundColor: '#0a0a0f',
    frame: true,
    show: true, // Show immediately so we can see what happens
    icon: path.join(__dirname, '../public/icon.png'),
  });

  const isDev = !app.isPackaged;

  // Log every load event for debugging
  mainWindow.webContents.on('did-fail-load', (event, code, desc, url) => {
    console.error(`[LOAD FAIL] code=${code} desc="${desc}" url=${url}`);
  });
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[LOAD OK] Page finished loading');
  });
  mainWindow.webContents.on('dom-ready', () => {
    console.log('[DOM READY]');
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Spin up a tiny local static server for Next.js out/ folder.
    // This allows origin to be http://localhost, unlocking Google OAuth in Firebase native!
    const nextOutPath = path.join(__dirname, '..', 'out');
    
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.txt': 'text/plain'
    };

    const server = http.createServer((req, res) => {
      try {
        const relativePath = decodeURIComponent(req.url.split('?')[0]);
        let cleanPath = relativePath;
        
        // Next.js routing maps
        if (cleanPath.endsWith('/')) {
          cleanPath += 'index.html';
        } else if (!path.extname(cleanPath)) {
          cleanPath += '/index.html';
        }

        // Prevent directory traversal
        cleanPath = cleanPath.replace(/^(\.\.[\/\\])+/, '');
        
        const filePath = path.join(nextOutPath, cleanPath);

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }

          const extname = String(path.extname(filePath)).toLowerCase();
          const contentType = mimeTypes[extname] || 'application/octet-stream';

          res.writeHead(200, {
            'Content-Type': contentType,
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'unsafe-none',
            // Allow caching of immutable Next.js assets
            'Cache-Control': relativePath.startsWith('/_next/static/') ? 'public, max-age=31536000, immutable' : 'no-cache'
          });
          const readStream = fs.createReadStream(filePath);
          readStream.pipe(res);
        });
      } catch (err) {
        res.writeHead(500);
        res.end('Server Error');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      console.log(`[STARTUP] Local server listening on http://localhost:${port}`);
      mainWindow.loadURL(`http://localhost:${port}`);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ── IPC: Full system info ─────────────────────────────────────────────────────
ipcMain.handle('get-system-info', async () => {
  try {
    const [cpu, mem, osInfo, graphics, diskLayout] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.graphics().catch(() => ({ controllers: [] })),
      si.diskLayout().catch(() => []),
    ]);

    const primaryGpu =
      graphics.controllers.find(
        (g) => g.vram > 0 && !g.model.toLowerCase().includes('integrated')
      ) || graphics.controllers[0];

    return {
      cpu: {
        model: cpu.brand,
        manufacturer: cpu.manufacturer,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed,
        speedMax: cpu.speedMax || cpu.speed,
      },
      gpu: {
        model: primaryGpu?.model || 'Unknown GPU',
        vendor: primaryGpu?.vendor || 'Unknown',
        vram: primaryGpu?.vram || 0,
        driver: primaryGpu?.driverVersion || 'Unknown',
      },
      ram: {
        total: Math.round(mem.total / (1024 * 1024 * 1024)),
        free: Math.round(mem.free / (1024 * 1024 * 1024)),
        used: Math.round(mem.used / (1024 * 1024 * 1024)),
      },
      storage: {
        total:
          diskLayout.reduce((acc, disk) => acc + (disk.size || 0), 0) /
          (1024 * 1024 * 1024),
        drives: diskLayout.map((disk) => ({
          name: disk.name || 'Local Drive',
          type: disk.type || 'Storage',
          size: Math.round((disk.size || 0) / (1024 * 1024 * 1024)),
        })),
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
      },
      isElectron: true,
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    throw error;
  }
});

// ── IPC: CPU usage ────────────────────────────────────────────────────────────
ipcMain.handle('get-cpu-usage', async () => {
  try {
    const load = await si.currentLoad();
    return {
      currentLoad: load.currentLoad,
      cpus: load.cpus.map((cpu) => cpu.load),
    };
  } catch (error) {
    console.error('Error getting CPU usage:', error);
    throw error;
  }
});

// ── IPC: Memory usage ─────────────────────────────────────────────────────────
ipcMain.handle('get-memory-usage', async () => {
  try {
    const mem = await si.mem();
    return {
      total: Math.round(mem.total / (1024 * 1024 * 1024)),
      used: Math.round(mem.used / (1024 * 1024 * 1024)),
      free: Math.round(mem.free / (1024 * 1024 * 1024)),
      usedPercent: (mem.used / mem.total) * 100,
    };
  } catch (error) {
    console.error('Error getting memory usage:', error);
    throw error;
  }
});

// ── IPC: GPU usage ────────────────────────────────────────────────────────────
ipcMain.handle('get-gpu-usage', async () => {
  try {
    const graphics = await si.graphics();
    const primaryGpu =
      graphics.controllers.find(
        (g) => g.vram > 0 && !g.model.toLowerCase().includes('integrated')
      ) || graphics.controllers[0];

    return {
      utilizationGpu: primaryGpu?.utilizationGpu || 0,
      utilizationMemory: primaryGpu?.utilizationMemory || 0,
      temperatureGpu: primaryGpu?.temperatureGpu || 0,
    };
  } catch (error) {
    console.error('Error getting GPU usage:', error);
    throw error;
  }
});

// ── IPC: API Migrations ────────────────────────────────────────────────────────

// Light .env parser for the main process (useful for development config)
try {
  const fs = require('fs');
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim();
        if (k && !process.env[k]) process.env[k] = v;
      }
    });
  }
} catch (e) {
  // Silent fallback
}

// Steam Search Proxy
ipcMain.handle('steam-search', async (_, query) => {
  try {
    const response = await fetch(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Steam API failed');
    return await response.json();
  } catch (error) {
    console.error('Steam search error:', error);
    throw error;
  }
});

// Helper for parsing Steam Requirements natively
function extractNumberAndUnit(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(MB|GB|TB)/i);
  if (!match) return null;
  let val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'MB') val = val / 1024;
  if (unit === 'TB') val = val * 1024;
  return Math.round(val);
}

function extractRequirementStr(htmlLine) {
  const clean = htmlLine.replace(/<[^>]+>/g, '').trim();
  return clean.replace(/^[^:]+:\s*/i, '').trim();
}

function parseSteamRequirements(requirementsHtml) {
  if (!requirementsHtml) return null;
  
  const result = {
    minCpu: 'Intel Core i5-4460',
    minGpu: 'NVIDIA GeForce GTX 960',
    minRam: 8,
    minStorage: 50,
  };

  const processSection = (html, isMin) => {
    const lines = html.split(/<li>|<br\s*\/?>/i);
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('processor:') || lower.includes('cpu:')) {
        const val = extractRequirementStr(line);
        if (val) {
          if (isMin) result.minCpu = val.split(' / ')[0].split(' or ')[0];
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

  if (requirementsHtml.minimum) processSection(requirementsHtml.minimum, true);
  if (requirementsHtml.recommended) processSection(requirementsHtml.recommended, false);
  else {
    result.recCpu = result.minCpu;
    result.recGpu = result.minGpu;
    result.recRam = result.minRam * 1.5;
    result.recStorage = result.minStorage;
  }
  return result;
}

// Steam Details Proxy
ipcMain.handle('steam-details', async (_, appId) => {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`);
    if (!response.ok) throw new Error(`Steam Details API failed for ${appId}`);
    
    const data = await response.json();
    const appData = data[appId];
    if (!appData || !appData.success || !appData.data) throw new Error('Game data not found');

    const gameData = appData.data;
    const reqs = parseSteamRequirements(gameData.pc_requirements);

    if (appId === '730' && reqs) {
      reqs.recRam = 8;
      reqs.recGpu = 'NVIDIA GeForce GTX 1060';
    }

    return {
      game: {
        id: parseInt(appId),
        name: gameData.name,
        steamAppId: parseInt(appId),
        coverImage: gameData.header_image,
        releaseDate: gameData.release_date?.date,
        requirements: reqs || {
          minCpu: 'Unknown',
          minGpu: 'Unknown',
          minRam: 4,
          minStorage: 10,
        },
      }
    };
  } catch (error) {
    console.error(`Steam details error for ${appId}:`, error);
    throw error;
  }
});

// AI Analyze
ipcMain.handle('ai-analyze', async (_, data) => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key is not configured in .env');

  try {
    const { systemInfo, game } = data;
    const prompt = `
      You are an independent GPU performance expert. 
      IGNORE any previous compatibility verdicts. You must perform your own independent research using Google Search for the following setup:
      
      GAME: ${game.name}
      SPECS:
      - CPU: ${systemInfo.cpu.manufacturer} ${systemInfo.cpu.brand}
      - GPU: ${systemInfo.gpu.vendor} ${systemInfo.gpu.model} (${Math.round(systemInfo.gpu.vram / 1024)}GB VRAM)
      - RAM: ${Math.round(systemInfo.memory.total / (1024 ** 3))}GB
      
      REQUIREMENTS:
      1. Research real-word benchmarks (YouTube, Reddit, Benchmark sites) for this SPECIFIC GPU/CPU combo in ${game.name}.
      2. Return a PURE JSON response (no markdown, no extra text) with the following structure:
         {
           "fps": {
             "low": "e.g. 60-90 FPS",
             "medium": "e.g. 45-60 FPS",
             "high": "e.g. 30-45 FPS"
           },
           "recommendations": [
             "Short, actionable recommendation 1",
             "Short, actionable recommendation 2"
           ],
           "overallReport": "A professional 2-3 sentence summary."
         }
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API call failed');
    }

    const payload = await response.json();
    let textResult = payload.candidates?.[0]?.content?.parts?.[0]?.text || '';
    textResult = textResult.replace(/```json|```/g, '').trim();

    return JSON.parse(textResult);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
});
