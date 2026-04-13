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
import { FpsPredictionCard } from '@/components/compatibility/FpsPredictionCard';
import { AiAnalysisCard } from '@/components/compatibility/AiAnalysisCard';
import { Cpu, MonitorPlay, MemoryStick, HardDrive, ArrowLeft, Zap, History, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DownloadAppBanner } from '@/components/layout/DownloadAppBanner';

interface DashboardViewProps {
  systemInfo: SystemInfo;
  games: Game[];
  library: Game[];
  onToggleLibrary: (gameId: number) => void;
  isElectron: boolean;
}

export function DashboardView({ systemInfo, games, library, onToggleLibrary, isElectron }: DashboardViewProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [recentChecks, setRecentChecks] = useState<{game: Game, result: CompatibilityResult}[]>([]);
  const { user } = useAuth();

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
    if (!selectedGame) return null;
    const result = checkCompatibility(systemInfo, selectedGame);
    
    // Save to recently analyzed when compatibility is calculated
    if (user && selectedGame) {
      userService.addToRecentlyAnalyzed(user.uid, selectedGame, result)
        .catch(console.error);
    }
    
    return result;
  }, [selectedGame, systemInfo, user]);

  if (selectedGame && compatibility) {
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
      <SystemOverview systemInfo={systemInfo} />

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
            const result = checkCompatibility(systemInfo, game);
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

