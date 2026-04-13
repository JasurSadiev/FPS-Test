'use client';

import { Settings, Monitor, Download, Info, Github, Terminal, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSystemInfo } from '@/hooks/use-system-info';

export function SettingsView() {
  const { isElectron } = useSystemInfo();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">About</h2>
            <p className="text-sm text-muted-foreground">FPS Test - System Requirements & Performance Analysis</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-mono">{isElectron ? 'Desktop App' : 'Web Preview'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">System Detection</span>
            {isElectron ? (
              <span className="font-mono text-green-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Real Hardware
              </span>
            ) : (
              <span className="font-mono text-yellow-500">Simulated</span>
            )}
          </div>
        </div>
      </div>

      {!isElectron && (
        <div className="glass-card rounded-xl p-6 space-y-4 border border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold">Get Real Hardware Detection</h2>
              <p className="text-sm text-muted-foreground">Download and run locally</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              To detect your actual hardware specs, download this project and run it as a desktop app:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <p className="text-sm">Click the <strong>three dots (...)</strong> in the top-right corner of v0</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <p className="text-sm">Select <strong>&quot;Download ZIP&quot;</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <p className="text-sm">Extract and open in terminal</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <p className="text-sm">Run the commands below:</p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Terminal className="w-3 h-3" />
                <span>Terminal</span>
              </div>
              <p className="text-green-400">pnpm install</p>
              <p className="text-green-400">pnpm electron:dev</p>
            </div>

            <p className="text-xs text-muted-foreground">
              This will launch the desktop app with full hardware detection via the systeminformation package.
            </p>
          </div>
        </div>
      )}

      {isElectron && (
        <div className="glass-card rounded-xl p-6 space-y-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="font-bold text-green-500">Desktop Mode Active</h2>
              <p className="text-sm text-muted-foreground">Real hardware detection enabled for accuracy</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your actual CPU, GPU, RAM, and storage are being analyzed in real-time to provide the most accurate FPS estimates.
          </p>
        </div>
      )}

      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">Display</h2>
            <p className="text-sm text-muted-foreground">Visual preferences</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Dark mode is always on for the gaming aesthetic</p>
            </div>
            <span className="text-sm font-mono bg-muted px-3 py-1 rounded">Dark</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Animations</p>
              <p className="text-sm text-muted-foreground">Score meter animations</p>
            </div>
            <span className="text-sm font-mono bg-green-500/20 text-green-500 px-3 py-1 rounded">Enabled</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">Data</h2>
            <p className="text-sm text-muted-foreground">Game database and library</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Games in Database</p>
              <p className="text-sm text-muted-foreground">Including Steam and custom games</p>
            </div>
            <span className="text-sm font-mono">6</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Library Storage</p>
              <p className="text-sm text-muted-foreground">Local browser storage</p>
            </div>
            <span className="text-sm font-mono">localStorage</span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          Export Library Data
        </Button>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Github className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">Open Source</h2>
            <p className="text-sm text-muted-foreground">Built with Electron + Next.js</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This project uses the systeminformation package for cross-platform hardware detection.
        </p>
      </div>
    </div>
  );
}
