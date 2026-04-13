'use client';

import { useState, useMemo } from 'react';
import type { SystemInfo, Game, Verdict } from '@/lib/types';
import { checkCompatibility } from '@/lib/scoring-engine';
import { GameCard } from '@/components/game/GameCard';
import { ComponentComparison } from '@/components/compatibility/ComponentComparison';
import { BottleneckCard } from '@/components/compatibility/BottleneckCard';
import { VerdictBadge } from '@/components/compatibility/VerdictBadge';
import { Button } from '@/components/ui/button';
import { Cpu, MonitorPlay, MemoryStick, HardDrive, ArrowLeft, Library, Plus } from 'lucide-react';

interface LibraryViewProps {
  systemInfo: SystemInfo;
  library: Game[];
  allGames: Game[];
  onAddToLibrary: (gameId: number) => void;
  onRemoveFromLibrary: (gameId: number) => void;
}

export function LibraryView({ 
  systemInfo, 
  library, 
  allGames,
  onAddToLibrary,
  onRemoveFromLibrary 
}: LibraryViewProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [filterVerdict, setFilterVerdict] = useState<Verdict | 'all'>('all');

  const libraryWithCompatibility = useMemo(() => {
    return library.map(game => ({
      game,
      compatibility: checkCompatibility(systemInfo, game)
    }));
  }, [library, systemInfo]);

  const filteredLibrary = useMemo(() => {
    if (filterVerdict === 'all') return libraryWithCompatibility;
    return libraryWithCompatibility.filter(
      item => item.compatibility.verdict === filterVerdict
    );
  }, [libraryWithCompatibility, filterVerdict]);

  const gamesNotInLibrary = useMemo(() => {
    const libraryIds = new Set(library.map(g => g.id));
    return allGames.filter(g => !libraryIds.has(g.id));
  }, [library, allGames]);

  const compatibility = useMemo(() => {
    if (!selectedGame) return null;
    return checkCompatibility(systemInfo, selectedGame);
  }, [selectedGame, systemInfo]);

  const stats = useMemo(() => {
    const counts = {
      total: libraryWithCompatibility.length,
      cannotRun: 0,
      minimum: 0,
      recommended: 0,
      exceeds: 0,
    };
    
    libraryWithCompatibility.forEach(({ compatibility }) => {
      switch (compatibility.verdict) {
        case 'cannot-run': counts.cannotRun++; break;
        case 'minimum': counts.minimum++; break;
        case 'recommended': counts.recommended++; break;
        case 'exceeds': counts.exceeds++; break;
      }
    });

    return counts;
  }, [libraryWithCompatibility]);

  if (selectedGame && compatibility) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedGame(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              onRemoveFromLibrary(selectedGame.id);
              setSelectedGame(null);
            }}
          >
            Remove from Library
          </Button>
        </div>

        <GameCard 
          game={selectedGame} 
          compatibility={compatibility} 
          variant="full" 
          isInLibrary={true}
          onLibraryToggle={() => {
            onRemoveFromLibrary(selectedGame.id);
            setSelectedGame(null);
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComponentComparison
            label="CPU"
            icon={<Cpu className="w-5 h-5" />}
            score={compatibility.components.cpu}
          />
          <ComponentComparison
            label="GPU"
            icon={<MonitorPlay className="w-5 h-5" />}
            score={compatibility.components.gpu}
          />
          <ComponentComparison
            label="RAM"
            icon={<MemoryStick className="w-5 h-5" />}
            score={compatibility.components.ram}
          />
          <ComponentComparison
            label="Storage"
            icon={<HardDrive className="w-5 h-5" />}
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
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Library className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold">Library Overview</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <button
            onClick={() => setFilterVerdict('all')}
            className={`text-center p-3 rounded-lg transition-colors ${
              filterVerdict === 'all' ? 'bg-primary/20' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <p className="text-2xl font-bold font-mono">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </button>
          <button
            onClick={() => setFilterVerdict('exceeds')}
            className={`text-center p-3 rounded-lg transition-colors ${
              filterVerdict === 'exceeds' ? 'bg-cyan-500/20' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <p className="text-2xl font-bold font-mono text-cyan-400">{stats.exceeds}</p>
            <p className="text-xs text-muted-foreground">Exceeds</p>
          </button>
          <button
            onClick={() => setFilterVerdict('recommended')}
            className={`text-center p-3 rounded-lg transition-colors ${
              filterVerdict === 'recommended' ? 'bg-green-500/20' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <p className="text-2xl font-bold font-mono text-green-500">{stats.recommended}</p>
            <p className="text-xs text-muted-foreground">Recommended</p>
          </button>
          <button
            onClick={() => setFilterVerdict('minimum')}
            className={`text-center p-3 rounded-lg transition-colors ${
              filterVerdict === 'minimum' ? 'bg-yellow-500/20' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <p className="text-2xl font-bold font-mono text-yellow-500">{stats.minimum}</p>
            <p className="text-xs text-muted-foreground">Minimum</p>
          </button>
          <button
            onClick={() => setFilterVerdict('cannot-run')}
            className={`text-center p-3 rounded-lg transition-colors ${
              filterVerdict === 'cannot-run' ? 'bg-red-500/20' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <p className="text-2xl font-bold font-mono text-red-500">{stats.cannotRun}</p>
            <p className="text-xs text-muted-foreground">Cannot Run</p>
          </button>
        </div>
      </div>

      {/* Library Games */}
      {filteredLibrary.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLibrary.map(({ game, compatibility }) => (
            <GameCard
              key={game.id}
              game={game}
              compatibility={compatibility}
              onClick={() => setSelectedGame(game)}
              isInLibrary={true}
              onLibraryToggle={() => onRemoveFromLibrary(game.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass-card rounded-xl">
          <Library className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {library.length === 0 
              ? "Your library is empty. Add games from the Search tab!"
              : "No games match the selected filter."
            }
          </p>
        </div>
      )}

      {/* Add to Library Section */}
      {gamesNotInLibrary.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add to Library
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {gamesNotInLibrary.slice(0, 6).map(game => (
              <button
                key={game.id}
                onClick={() => onAddToLibrary(game.id)}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <p className="text-sm font-medium truncate">{game.name}</p>
                <p className="text-xs text-muted-foreground">Click to add</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
