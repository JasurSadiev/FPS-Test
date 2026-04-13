const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');

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
    },
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    frame: true,
    icon: path.join(__dirname, '../public/icon.png'),
  });

  // In development, load from Next.js dev server
  // In production, load from the exported static files
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
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

// IPC Handlers for system information
ipcMain.handle('get-system-info', async () => {
  try {
    const [cpu, graphics, mem, diskLayout, osInfo] = await Promise.all([
      si.cpu(),
      si.graphics(),
      si.mem(),
      si.diskLayout(),
      si.osInfo(),
    ]);

    // Get the primary/best GPU (usually the discrete one)
    const primaryGpu = graphics.controllers.find(
      (g) => g.vram > 0 && !g.model.toLowerCase().includes('integrated')
    ) || graphics.controllers[0];

    // Calculate total storage
    const totalStorage = diskLayout.reduce((acc, disk) => acc + disk.size, 0);

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
        model: primaryGpu?.model || 'Unknown',
        vendor: primaryGpu?.vendor || 'Unknown',
        vram: primaryGpu?.vram || 0, // in MB
        driver: primaryGpu?.driverVersion || 'Unknown',
      },
      ram: {
        total: Math.round(mem.total / (1024 * 1024 * 1024)), // Convert to GB
        free: Math.round(mem.free / (1024 * 1024 * 1024)),
        used: Math.round(mem.used / (1024 * 1024 * 1024)),
      },
      storage: {
        total: Math.round(totalStorage / (1024 * 1024 * 1024)), // Convert to GB
        drives: diskLayout.map((disk) => ({
          name: disk.name,
          type: disk.type,
          size: Math.round(disk.size / (1024 * 1024 * 1024)),
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

// Get real-time CPU usage
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

// Get real-time memory usage
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

// Get GPU usage (if available)
ipcMain.handle('get-gpu-usage', async () => {
  try {
    const graphics = await si.graphics();
    const primaryGpu = graphics.controllers.find(
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
