'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Game, CompatibilityResult } from '@/lib/types';
import { VerdictBadge } from '@/components/compatibility/VerdictBadge';
import { ScoreMeter } from '@/components/compatibility/ScoreMeter';
import { Calendar, HardDrive, Bookmark, BookmarkCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  game: Game;
  compatibility?: CompatibilityResult;
  onClick?: () => void;
  variant?: 'compact' | 'full';
  isInLibrary?: boolean;
  onLibraryToggle?: (e: React.MouseEvent) => void;
}

export function GameCard({ 
  game, 
  compatibility, 
  onClick, 
  variant = 'compact',
  isInLibrary,
  onLibraryToggle
}: GameCardProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLibraryToggle?.(e);
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'glass-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group',
          'hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10',
          'border border-transparent hover:border-primary/30'
        )}
      >
        <div className="relative aspect-[460/215] w-full">
          {game.coverImage ? (
            <Image
              src={game.coverImage}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-2">
            {onLibraryToggle && (
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg backdrop-blur-md transition-all active:scale-90",
                  isInLibrary 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-black/40 text-white border-white/10 hover:bg-black/60"
                )}
                onClick={handleToggle}
              >
                {isInLibrary ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            )}
            {compatibility && (
              <VerdictBadge verdict={compatibility.verdict} size="sm" />
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-base truncate mb-2">{game.name}</h3>
          
          {compatibility ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HardDrive className="w-3 h-3 text-primary/60" />
                <span>{game.requirements.minStorage} GB</span>
              </div>
              <div className="text-2xl font-black font-mono text-primary italic">
                {compatibility.overallScore}%
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{game.releaseDate || 'Unknown'}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant with more details
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-card/40 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-80 aspect-[460/215] md:aspect-auto md:h-auto shrink-0 group">
          {game.coverImage ? (
            <Image
              src={game.coverImage}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center min-h-40">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          {onLibraryToggle && (
            <div className="absolute top-4 left-4">
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "gap-2 backdrop-blur-md font-bold uppercase text-[10px] tracking-widest",
                  isInLibrary 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-black/50 text-white border-white/10 hover:bg-black/70"
                )}
                onClick={handleToggle}
              >
                {isInLibrary ? (
                  <><BookmarkCheck className="w-3 h-3" /> In Library</>
                ) : (
                  <><Bookmark className="w-3 h-3" /> Add to Library</>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter">Verified Specs</span>
              </div>
              <h2 className="text-3xl font-black italic mb-1 uppercase tracking-tight">{game.name}</h2>
              {game.releaseDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium opacity-80">
                  <Calendar className="w-4 h-4" />
                  {game.releaseDate}
                </p>
              )}
            </div>
            {compatibility && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">SCORE</p>
                <div className="text-5xl font-black italic text-primary">
                  {compatibility.overallScore}%
                </div>
              </div>
            )}
          </div>

          {compatibility && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <VerdictBadge verdict={compatibility.verdict} size="lg" />
                 {compatibility.bottleneck && (
                    <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-500 flex items-center gap-2">
                       <Zap className="w-3 h-3" />
                       BOTTLENECK DETECTED: {compatibility.bottleneck}
                    </div>
                 )}
              </div>
              
              {compatibility.suggestions.length > 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 opacity-60">PRO OPTIMIZATION TIPS</p>
                  <ul className="text-sm space-y-2">
                    {compatibility.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-white/80 flex items-center gap-2 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
