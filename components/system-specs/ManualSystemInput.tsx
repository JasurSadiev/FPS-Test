'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { popularCPUs, popularGPUs, popularRAM, popularStorage } from '@/lib/hardware-lists';
import type { SystemInfo } from '@/lib/types';
import { MonitorPlay, Cpu, MemoryStick, HardDrive, AlertCircle, Loader2Icon } from 'lucide-react';

interface ManualSystemInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (systemInfo: SystemInfo) => void;
  currentSystemInfo?: SystemInfo | null;
}

export function ManualSystemInput({ open, onOpenChange, onSave, currentSystemInfo }: ManualSystemInputProps) {
  // Field values
  const [cpuVal, setCpuVal] = useState<string>('');
  const [gpuVal, setGpuVal] = useState<string>('');
  const [ramVal, setRamVal] = useState<string>('');
  const [storageVal, setStorageVal] = useState<string>('');

  // Fallback 'other' text inputs
  const [customCpu, setCustomCpu] = useState('');
  const [customGpu, setCustomGpu] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pre-fill form when opened with existing info
  useEffect(() => {
    if (open && currentSystemInfo) {
      // Find CPU
      const matchedCpu = popularCPUs.find(c => c.brand.toLowerCase() === currentSystemInfo.cpu.brand.toLowerCase());
      if (matchedCpu) {
        setCpuVal(matchedCpu.value);
      } else {
        setCpuVal('other');
        setCustomCpu(currentSystemInfo.cpu.brand);
      }

      // Find GPU
      const matchedGpu = popularGPUs.find(g => g.model.toLowerCase() === currentSystemInfo.gpu.model.toLowerCase());
      if (matchedGpu) {
        setGpuVal(matchedGpu.value);
      } else {
        setGpuVal('other');
        setCustomGpu(currentSystemInfo.gpu.model);
      }

      // Find RAM (total bytes to GB)
      const ramGb = Math.round(currentSystemInfo.memory.total / (1024 ** 3)).toString();
      const matchedRam = popularRAM.find(r => r.value === ramGb);
      if (matchedRam) setRamVal(matchedRam.value);

      // Find Storage
      if (currentSystemInfo.storage.length > 0) {
        const primaryDrive = currentSystemInfo.storage[0];
        const sizeGb = Math.round(primaryDrive.size / (1024 ** 3));
        const type = primaryDrive.type.toLowerCase();
        const storageKey = `${sizeGb}-${type}`;
        const matchedStorage = popularStorage.find(s => s.value === storageKey);
        if (matchedStorage) setStorageVal(matchedStorage.value);
      }
    }
  }, [open, currentSystemInfo]);

  const handleSave = async () => {
    let aiCpu: any = null;
    let aiGpu: any = null;

    if (cpuVal === 'other' || gpuVal === 'other') {
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/hardware-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cpuQuery: cpuVal === 'other' ? customCpu : undefined,
            gpuQuery: gpuVal === 'other' ? customGpu : undefined
          })
        });
        if (res.ok) {
          const data = await res.json();
          aiCpu = data.cpu;
          aiGpu = data.gpu;
        }
      } catch (err) {
        console.error("Hardware AI Lookup Failed", err);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // Construct real system info
    let finalCpuName = customCpu;
    let finalCpuManufacturer = 'Unknown';
    let finalCpuSpeed = 3.5;
    let finalCpuCores = 4;
    let finalCpuPhyCores = 4;

    let finalCpuObj = popularCPUs.find(c => c.value === cpuVal);
    if (cpuVal !== 'other' && finalCpuObj) {
      finalCpuName = finalCpuObj.brand;
      finalCpuManufacturer = finalCpuObj.manufacturer;
    } else if (!customCpu) {
      finalCpuName = 'Basic Processor';
    }

    let finalGpuModel = customGpu;
    let finalGpuVendor = 'Unknown';
    let finalGpuVram = 4; // fallback 4GB
    let finalGpuObj = popularGPUs.find(g => g.value === gpuVal);
    if (gpuVal !== 'other' && finalGpuObj) {
      finalGpuModel = finalGpuObj.model;
      finalGpuVendor = finalGpuObj.vendor;
      finalGpuVram = finalGpuObj.vram;
    } else if (!customGpu) {
      finalGpuModel = 'Basic Graphics';
    }

    if (aiCpu) {
      finalCpuName = aiCpu.brand || finalCpuName;
      finalCpuManufacturer = aiCpu.manufacturer || finalCpuManufacturer;
      finalCpuSpeed = aiCpu.speed || finalCpuSpeed;
      finalCpuCores = aiCpu.cores || finalCpuCores;
      finalCpuPhyCores = aiCpu.physicalCores || finalCpuPhyCores;
    }

    if (aiGpu) {
      finalGpuVendor = aiGpu.vendor || finalGpuVendor;
      finalGpuModel = aiGpu.model || finalGpuModel;
      finalGpuVram = aiGpu.vram ? Math.floor(aiGpu.vram / 1024) : finalGpuVram; 
    }

    let memoryBytes = 8 * 1024 * 1024 * 1024;
    let ramObj = popularRAM.find(r => r.value === ramVal);
    if (ramObj) {
      memoryBytes = ramObj.gb * 1024 * 1024 * 1024;
    }

    let storageBytes = 512 * 1024 * 1024 * 1024;
    let storageType = 'SSD';
    let storageObj = popularStorage.find(s => s.value === storageVal);
    if (storageObj) {
      storageBytes = storageObj.sizeGb * 1024 * 1024 * 1024;
      storageType = storageObj.type;
    }

    const payload: SystemInfo = {
      cpu: {
        manufacturer: finalCpuManufacturer,
        brand: finalCpuName,
        speed: finalCpuSpeed,
        cores: finalCpuCores,
        physicalCores: finalCpuPhyCores,
        processors: 1,
      },
      gpu: {
        vendor: finalGpuVendor,
        model: finalGpuModel,
        vram: finalGpuVram * 1024, // Store inside MBs as expected by systemInfo natively? Or mb?
      },
      memory: {
        total: memoryBytes,
        free: memoryBytes * 0.5,
        used: memoryBytes * 0.5,
        available: memoryBytes * 0.5,
      },
      storage: [
        {
          device: 'Main Drive',
          type: storageType,
          size: storageBytes,
          available: storageBytes * 0.5,
        }
      ],
      os: {
        platform: 'Windows',
        distro: 'Windows 11',
        release: '10',
        arch: 'x64',
      }
    };

    onSave(payload);
    onOpenChange(false);
  };

  const isFormValid = cpuVal && gpuVal && ramVal && storageVal && 
                      (cpuVal !== 'other' || customCpu.trim() !== '') &&
                      (gpuVal !== 'other' || customGpu.trim() !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase">System Specifications</DialogTitle>
          <DialogDescription>
            Select your hardware from the lists below. We use this to estimate your game performance.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4 py-4 shrink-0">
          <div className="space-y-6">
            {/* CPU */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Cpu className="w-5 h-5" />
                <Label className="text-sm font-bold uppercase italic">Processor (CPU)</Label>
              </div>
              <Select value={cpuVal} onValueChange={setCpuVal}>
                <SelectTrigger className="bg-black/50 border-white/10">
                  <SelectValue placeholder="Select your CPU" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {popularCPUs.map(cpu => (
                    <SelectItem key={cpu.value} value={cpu.value}>{cpu.label}</SelectItem>
                  ))}
                  <SelectItem value="other" className="font-bold text-primary">Other / Type Manually...</SelectItem>
                </SelectContent>
              </Select>
              {cpuVal === 'other' && (
                <Input 
                  placeholder="e.g. Intel Core i5-4460" 
                  value={customCpu} 
                  onChange={(e) => setCustomCpu(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              )}
            </div>

            {/* GPU */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <MonitorPlay className="w-5 h-5" />
                <Label className="text-sm font-bold uppercase italic">Graphics Card (GPU)</Label>
              </div>
              <Select value={gpuVal} onValueChange={setGpuVal}>
                <SelectTrigger className="bg-black/50 border-white/10">
                  <SelectValue placeholder="Select your GPU" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {popularGPUs.map(gpu => (
                    <SelectItem key={gpu.value} value={gpu.value}>{gpu.label}</SelectItem>
                  ))}
                  <SelectItem value="other" className="font-bold text-primary">Other / Type Manually...</SelectItem>
                </SelectContent>
              </Select>
              {gpuVal === 'other' && (
                <Input 
                  placeholder="e.g. NVIDIA GTX 960" 
                  value={customGpu} 
                  onChange={(e) => setCustomGpu(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              )}
            </div>

            {/* RAM */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <MemoryStick className="w-5 h-5" />
                <Label className="text-sm font-bold uppercase italic">System Memory (RAM)</Label>
              </div>
              <Select value={ramVal} onValueChange={setRamVal}>
                <SelectTrigger className="bg-black/50 border-white/10">
                  <SelectValue placeholder="Select your RAM" />
                </SelectTrigger>
                <SelectContent>
                  {popularRAM.map(ram => (
                    <SelectItem key={ram.value} value={ram.value}>{ram.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* STORAGE */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <HardDrive className="w-5 h-5" />
                <Label className="text-sm font-bold uppercase italic">Storage Drive</Label>
              </div>
              <Select value={storageVal} onValueChange={setStorageVal}>
                <SelectTrigger className="bg-black/50 border-white/10">
                  <SelectValue placeholder="Select your primary storage type" />
                </SelectTrigger>
                <SelectContent>
                  {popularStorage.map(storage => (
                    <SelectItem key={storage.value} value={storage.value}>{storage.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-white/5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <p>These specifications will be saved securely to your cloud profile for future compatibility checks.</p>
            </div>

          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t border-white/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isAnalyzing}>Cancel</Button>
          <Button disabled={!isFormValid || isAnalyzing} onClick={handleSave} className="font-bold">
            {isAnalyzing ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Looking up Specs...</> : 'Save Hardware Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
