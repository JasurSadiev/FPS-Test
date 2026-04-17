'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SystemInfo, Game, CompatibilityResult } from '@/lib/types';
import { checkCompatibility } from '@/lib/scoring-engine';
import { useAuth } from '@/lib/contexts/AuthContext';
import { userService } from '@/lib/services/user-service';
import { popularGames } from '@/lib/popular-games';
import { SystemOverview } from '@/components/system-specs/SystemOverview';
import { GameCard } from '@/components/game/GameCard';
import { GameSearch } from '@/components/game/GameSearch';
import { ComponentComparison } from '@/components/compatibility/ComponentComparison';
import { BottleneckCard } from '@/components/compatibility/BottleneckCard';
import { HardDrive, ArrowLeft, Zap, History, Flame, Sparkles, PenTool, Cpu, MonitorPlay, MemoryStick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DownloadAppBanner } from '@/components/layout/DownloadAppBanner';
import { ManualSystemInput } from '@/components/system-specs/ManualSystemInput';

interface DashboardViewProps {
  systemInfo: SystemInfo | null;
  games: Game[];
  library: Game[];
  onToggleLibrary: (gameId: number) => void;
  onDetectHardware: () => void;
  onManualSave: (info: SystemInfo) => void;
  isElectron: boolean;
}

export function DashboardView({ systemInfo, games, library, onToggleLibrary, onDetectHardware, onManualSave, isElectron }: DashboardViewProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [recentChecks, setRecentChecks] = useState<{game: Game, result: CompatibilityResult}[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const { user } = useAuth();

  // If no system info, show setup view
  if (!systemInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
          <Cpu className="w-24 h-24 text-primary relative" />
        </div>
        
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">First-Time Setup</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Welcome to <strong>FPS Test</strong>. To estimate your performance in games, we need to securely scan your PC hardware. This process is one-time and will be saved to your cloud account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {isElectron ? (
            <Button 
              size="lg" 
              onClick={onDetectHardware}
              className="h-16 px-10 text-xl font-bold italic uppercase gap-3 hover:scale-105 transition-transform"
            >
              <Zap className="w-6 h-6 fill-black" />
              Run Hardware Scan
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                onClick={() => setShowManualInput(true)}
                className="h-16 px-10 text-xl font-bold italic uppercase hover:scale-105 transition-transform gap-3"
              >
                <PenTool className="w-6 h-6 fill-black" />
                Enter Specs Manually
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => {
                  window.location.href = 'https://github.com/JasurSadiev/FPS-Test/releases/download/v2.0.0/FPS.Test.Setup.1.0.0.exe';
                }}
                className="h-16 px-8 text-xl font-bold italic uppercase hover:bg-white/5 transition-colors group gap-3"
              >
                <MonitorPlay className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                Download Desktop App
              </Button>
            </>
          )}
        </div>

        <ManualSystemInput 
          open={showManualInput} 
          onOpenChange={setShowManualInput} 
          onSave={onManualSave} 
          currentSystemInfo={systemInfo}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-10">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <MonitorPlay className="w-8 h-8 text-purple-400" />
            <h3 className="font-bold uppercase italic">GPU Analysis</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Detecting your exact VRAM and driver version for precise FPS scaling.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <Cpu className="w-8 h-8 text-blue-400" />
            <h3 className="font-bold uppercase italic">CPU Grading</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Calculating single-core and multi-core performance ratings.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <MemoryStick className="w-8 h-8 text-amber-400" />
            <h3 className="font-bold uppercase italic">RAM Verification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Ensuring you have enough memory for modern AAA titles.</p>
          </div>
        </div>
      </div>
    );
  }

  // Automatically sync to cloud when systemInfo or user changes
  useEffect(() => {
    if (user && systemInfo) {
      userService.syncSystemInfo(user, systemInfo)
        .catch(err => console.error('Auto-sync failed:', err));
    }
  }, [user, systemInfo]);

  // Load recent checks
  useEffect(() => {
    if (user) {
      userService.getRecentlyAnalyzed(user.uid)
        .then(setRecentChecks)
        .catch(console.error);
    }
  }, [user]);
  
  const compatibility = useMemo(() => {
    if (!selectedGame || !systemInfo) return null;
    const result = checkCompatibility(systemInfo, selectedGame);
    
    // Save to recently analyzed when compatibility is calculated
    if (user && selectedGame) {
      userService.addToRecentlyAnalyzed(user.uid, selectedGame, result)
        .catch(console.error);
    }
    
    return result;
  }, [selectedGame, systemInfo, user]);

  if (selectedGame && compatibility && systemInfo) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedGame(null)}
          className="gap-2 hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <GameCard game={selectedGame} compatibility={compatibility} variant="full" />

        <AiAnalysisCard 
          systemInfo={systemInfo} 
          game={selectedGame} 
          compatibility={compatibility} 
        />

        <FpsPredictionCard fps={compatibility.fps} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComponentComparison
            label="CPU"
            icon={<Cpu className="w-5 h-5 text-blue-400" />}
            score={compatibility.components.cpu}
          />
          <ComponentComparison
            label="GPU"
            icon={<MonitorPlay className="w-5 h-5 text-purple-400" />}
            score={compatibility.components.gpu}
          />
          <ComponentComparison
            label="RAM"
            icon={<MemoryStick className="w-5 h-5 text-amber-400" />}
            score={compatibility.components.ram}
          />
          <ComponentComparison
            label="Storage"
            icon={<HardDrive className="w-5 h-5 text-emerald-400" />}
            score={compatibility.components.storage}
          />
        </div>

        <BottleneckCard 
          bottleneck={compatibility.bottleneck} 
          suggestions={compatibility.suggestions} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* SEO Optimized Header Section */}
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-primary leading-none">
          FPS Test — Can Your PC Run It?
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-3xl leading-relaxed">
          The ultimate <strong>FPS Test</strong> and <strong>game requirements checker</strong>. 
          Analyze your PC hardware instantly to estimate how many FPS you will get on Low, Medium, and High settings. 
          Check if your system meets the official requirements for the latest titles without any download required.
        </p>
      </section>

      {/* System Overview */}
      <SystemOverview 
        systemInfo={systemInfo} 
        onRefresh={isElectron ? onDetectHardware : undefined} 
        onEditSpecs={!isElectron ? () => setShowManualInput(true) : undefined}
      />

      <ManualSystemInput 
        open={showManualInput} 
        onOpenChange={setShowManualInput} 
        onSave={onManualSave} 
        currentSystemInfo={systemInfo}
      />

      {/* Download Banner for Web Users */}
      {!isElectron && <DownloadAppBanner />}

      {/* Recently Analyzed */}
      {recentChecks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <History className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold italic tracking-tight">RECENT ANALYSIS</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4">
              {recentChecks.map(({ game, result }) => (
                <div key={game.id} className="w-[300px]">
                  <GameCard
                    game={game}
                    compatibility={result}
                    onClick={() => setSelectedGame(game)}
                    isInLibrary={library.some(l => l.id === game.id)}
                    onLibraryToggle={() => onToggleLibrary(game.id)}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Search Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold italic tracking-tight uppercase">Quick Search</h2>
        </div>
        <GameSearch games={games} onSelect={setSelectedGame} />
      </div>

      {/* Popular Section */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold italic tracking-tight uppercase">Popular Highlights</h2>
              <p className="text-xs text-muted-foreground font-mono">TRENDING ON STEAM • 2024/2025</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularGames.map(game => {
            const result = systemInfo ? checkCompatibility(systemInfo, game) : null;
            return (
              <GameCard
                key={game.id}
                game={game}
                compatibility={result}
                onClick={() => setSelectedGame(game)}
                isInLibrary={library.some(l => l.id === game.id)}
                onLibraryToggle={() => onToggleLibrary(game.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

