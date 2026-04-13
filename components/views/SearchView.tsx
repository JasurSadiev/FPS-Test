'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SystemInfo, Game } from '@/lib/types';
import { checkCompatibility } from '@/lib/scoring-engine';
import { GameCard } from '@/components/game/GameCard';
import { AddGameDialog } from '@/components/game/AddGameDialog';
import { ComponentComparison } from '@/components/compatibility/ComponentComparison';
import { BottleneckCard } from '@/components/compatibility/BottleneckCard';
import { FpsPredictionCard } from '@/components/compatibility/FpsPredictionCard';
import { AiAnalysisCard } from '@/components/compatibility/AiAnalysisCard';
import { Input } from '@/components/ui/input';
import { Search, Cpu, MonitorPlay, MemoryStick, HardDrive, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchViewProps {
  systemInfo: SystemInfo;
  games: Game[];
  library: Game[];
  onAddGame: (game: Omit<Game, 'id'>) => void;
  onToggleLibrary: (gameId: number) => void;
}

export function SearchView({ systemInfo, games, library, onAddGame, onToggleLibrary }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Debounced Search via API
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/steam/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle clicking a search result
  const handleSelectGame = async (steamApp: any) => {
    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/steam/details?appId=${steamApp.appid}`);
      if (!res.ok) throw new Error('Details failed');
      const data = await res.json();
      if (data.game) {
        setSelectedGame(data.game);
        // Optionally save to local immediately so it shows up next time
        // onAddGame(data.game); 
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load full requirements for this game.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const compatibility = useMemo(() => {
    if (!selectedGame) return null;
    return checkCompatibility(systemInfo, selectedGame);
  }, [selectedGame, systemInfo]);

  if (selectedGame && compatibility) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedGame(null)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Button>

        <GameCard 
          game={selectedGame} 
          compatibility={compatibility} 
          variant="full" 
          isInLibrary={library.some(l => l.id === selectedGame.id)}
          onLibraryToggle={() => onToggleLibrary(selectedGame.id)}
        />
        
        <AiAnalysisCard 
          systemInfo={systemInfo} 
          game={selectedGame} 
          compatibility={compatibility} 
        />

        <FpsPredictionCard fps={compatibility.fps} />

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

  // Determine what to map over - local games if empty, search results if querying
  const showLocal = !query.trim() && searchResults.length === 0;

  return (
    <div className="space-y-6 relative">
      {isEvaluating && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
           <div className="flex flex-col items-center gap-3">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <p className="text-sm font-medium">Analyzing Requirements...</p>
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-md">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <Input
            type="text"
            placeholder="Search Steam Games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddGameDialog onAdd={onAddGame} />
      </div>

      {!showLocal && (
        <div className="text-sm text-muted-foreground">
          {searchResults.length} game{searchResults.length !== 1 ? 's' : ''} found on Steam
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {showLocal ? (
           // Show local games
           games.map(game => {
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
           })
        ) : (
           // Show fetched steam games
           searchResults.map(app => (
              <div 
                key={app.appid}
                onClick={() => handleSelectGame(app)}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg flex items-center p-3 gap-3"
              >
                {app.logo && (
                  <img src={app.logo} alt={app.name} className="w-16 h-8 object-cover rounded opacity-80" />
                )}
                <span className="font-semibold text-sm truncate">{app.name}</span>
              </div>
           ))
        )}
      </div>

      {!showLocal && searchResults.length === 0 && !isSearching && query.trim() !== '' && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No games found on Steam matching '{query}'.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term or add a custom game.
          </p>
        </div>
      )}
    </div>
  );
}
