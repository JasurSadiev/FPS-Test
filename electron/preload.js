const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Get full system information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Get real-time CPU usage
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  
  // Get real-time memory usage
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  
  // Get GPU usage (temperature, utilization)
  getGpuUsage: () => ipcRenderer.invoke('get-gpu-usage'),
  
  // Check if running in Electron
  isElectron: true,
  
  // Platform info
  platform: process.platform,
});
