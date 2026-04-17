'use client';

import { useState } from 'react';
import { Sparkles, Loader2, BrainCircuit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SystemInfo, Game, CompatibilityResult } from '@/lib/types';

interface AiAnalysisCardProps {
  systemInfo: SystemInfo;
  game: Game;
  compatibility: CompatibilityResult;
}

interface AnalysisData {
  fps: {
    low: string;
    medium: string;
    high: string;
  };
  recommendations: string[];
  overallReport: string;
}

export function AiAnalysisCard({ systemInfo, game, compatibility }: AiAnalysisCardProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAiAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      const payload = {
        systemInfo,
        game,
        verdict: compatibility.verdict,
        fps: compatibility.fps,
      };

      if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
        result = await (window as any).electronAPI.aiAnalyze(payload);
      } else {
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to analyze');
      }
      
      setData(result);
    } catch (err: any) {

      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 backdrop-blur-md shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30">
          Independent Analyst
        </div>
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
          <CardTitle className="text-xl font-bold tracking-tight">AI Expert Analysis</CardTitle>
        </div>
        <CardDescription className="text-indigo-900/60 dark:text-indigo-200/60">
          Grounded research for {game.name} on your specific hardware.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <p className="text-sm text-center text-muted-foreground max-w-xs">
              Let Gemini research real-world benchmarks and provide an independent performance report.
            </p>
            <Button 
              onClick={getAiAnalysis}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30 h-11 px-8"
            >
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 animate-pulse">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 blur-lg bg-indigo-500/20 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-indigo-500/80 tracking-wide uppercase italic">
              Browsing benchmarks...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-4 shadow-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold mb-1 uppercase tracking-tight">Analysis Blocked</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
            
            {/* FPS Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Low', value: data.fps.low, color: 'from-blue-500/20 to-blue-500/10' },
                { label: 'Medium', value: data.fps.medium, color: 'from-indigo-500/20 to-indigo-500/10' },
                { label: 'High', value: data.fps.high, color: 'from-purple-500/20 to-purple-500/10' }
              ].map((tier) => (
                <div key={tier.label} className={`p-3 rounded-xl border border-white/5 bg-gradient-to-br ${tier.color} text-center shadow-sm`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{tier.label}</div>
                  <div className="text-sm font-black whitespace-nowrap">{tier.value}</div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-500/70 ml-1">Key Recommendations</div>
              <div className="grid gap-2">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-white/5 shadow-sm group hover:border-indigo-500/30 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-sm leading-snug">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Report */}
            <div className="relative pt-2">
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent rounded-full opacity-50" />
              <div className="pl-4 italic text-sm text-foreground/80 leading-relaxed font-medium">
                "{data.overallReport}"
              </div>
            </div>

            <div className="pt-2 flex justify-end">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setData(null)}
                 className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground hover:text-indigo-500"
               >
                 Reset Expert Insights
               </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
