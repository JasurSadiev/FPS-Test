'use client';

import { AlertTriangle, Lightbulb } from 'lucide-react';

interface BottleneckCardProps {
  bottleneck: string | null;
  suggestions: string[];
}

export function BottleneckCard({ bottleneck, suggestions }: BottleneckCardProps) {
  if (!bottleneck && suggestions.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      {bottleneck && (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 shrink-0">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-500">Performance Bottleneck</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your <span className="font-mono text-foreground">{bottleneck}</span> is the weakest component 
              and may limit your gaming performance.
            </p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Upgrade Suggestions</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-2">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">-</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
