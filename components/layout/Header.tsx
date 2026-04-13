'use client';

import { Menu, RefreshCw, Monitor, Globe, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  isElectron?: boolean;
  onRefresh?: () => void;
}

export function Header({ title, onMenuClick, isElectron, onRefresh }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                ${isElectron 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                  : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }
              `}>
                {isElectron ? (
                  <>
                    <Monitor className="w-3 h-3" />
                    Desktop
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" />
                    Web Preview
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isElectron 
                ? 'Running as desktop app with real hardware detection' 
                : 'Running in browser with simulated hardware data'
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!isElectron && (
          <Button 
            variant="default" 
            size="sm" 
            className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            onClick={() => window.location.href = '/downloads/CanIRunIt-Setup.exe'}
          >
            <Download className="w-4 h-4" />
            Download App
          </Button>
        )}

        {onRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh system info</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
}
