'use client';

import { Monitor, Download, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DownloadAppBanner() {
  const handleDownload = () => {
    // This will be replaced by the actual Vercel/GitHub download link
    window.location.href = '/downloads/FPSTest-Setup.exe';
  };

  return (
    <div className="relative overflow-hidden rounded-xl glass-card p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary uppercase tracking-wider">
            <Zap className="w-3 h-3" />
            Recommended Experience
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Get the <span className="text-primary italic">Desktop App</span> for Automatic Detection
          </h2>
          
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            The web version only shows manual results. Download the desktop app to automatically detect your 
            <span className="text-foreground font-medium"> CPU, GPU, and RAM</span> for instant 100% accurate compatibility checks.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Secure & Lightweight
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg">
              <Monitor className="w-4 h-4 text-primary" />
              Windows 10 / 11
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Button 
            size="lg" 
            onClick={handleDownload}
            className="group relative overflow-hidden px-8 py-6 h-auto text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]"
          >
            <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />
            Download Installer
          </Button>
          <p className="text-center mt-3 text-xs text-muted-foreground">
            Version 1.0.0 • 64-bit EXE
          </p>
        </div>
      </div>
    </div>
  );
}
