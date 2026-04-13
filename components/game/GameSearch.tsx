'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Game } from '@/lib/types';

interface GameSearchProps {
  games: Game[]; // Used to filter locally if needed, but we will hit Steam API now
  onSelect: (game: Game) => void;
}

export function GameSearch({ onSelect }: GameSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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
          setSearchResults(data.slice(0, 6)); // limit to 6 for dropdown
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectSteamGame = async (app: any) => {
    setIsLoadingDetails(true);
    setQuery('');
    setTimeout(() => setIsFocused(false), 100);
    
    try {
      const res = await fetch(`/api/steam/details?appId=${app.appid}`);
      if (!res.ok) throw new Error('Details failed');
      const data = await res.json();
      if (data.game) {
        onSelect(data.game);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load full requirements for this game.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const showDropdown = isFocused && searchResults.length > 0;

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        {isSearching || isLoadingDetails ? (
           <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        ) : (
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        )}
        <Input
          type="text"
          placeholder={isLoadingDetails ? "Loading game details..." : "Search Steam for a game..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 bg-card border-border"
          disabled={isLoadingDetails}
        />
      </div>

      {showDropdown && !isLoadingDetails && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {searchResults.map((app) => (
            <button
              key={app.appid}
              onClick={() => handleSelectSteamGame(app)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
            >
              {app.logo && (
                <img 
                  src={app.logo} 
                  alt={app.name}
                  className="w-12 h-6 object-cover rounded opacity-80"
                />
              )}
              <span className="font-medium text-sm truncate">{app.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
