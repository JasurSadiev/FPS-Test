'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Game } from '@/lib/types';
import { sampleGames } from '@/lib/mock-data';
import { popularGames } from '@/lib/popular-games';
import { useSystemInfo } from '@/hooks/use-system-info';
import { useAuth } from '@/lib/contexts/AuthContext';
import { userService } from '@/lib/services/user-service';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { SearchView } from '@/components/views/SearchView';
import { LibraryView } from '@/components/views/LibraryView';
import { SettingsView } from '@/components/views/SettingsView';
import { LoginView } from '@/components/auth/LoginView';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

type View = 'dashboard' | 'search' | 'library' | 'settings';

const viewTitles: Record<View, string> = {
  dashboard: 'Dashboard',
  search: 'Search Games',
  library: 'My Library',
  settings: 'Settings',
};

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [games, setGames] = useState<Game[]>(sampleGames);
  const [library, setLibrary] = useState<Game[]>([]); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);

  const { systemInfo, isLoading: sysLoading, isElectron, refresh } = useSystemInfo();

  // Fetch library from Firestore on auth
  useEffect(() => {
    if (user) {
      setIsLibraryLoading(true);
      userService.getLibrary(user.uid)
        .then(setLibrary)
        .finally(() => setIsLibraryLoading(false));
    }
  }, [user]);

  const handleAddGame = useCallback((gameData: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...gameData,
      id: Date.now(),
    };
    setGames(prev => [...prev, newGame]);
  }, []);

  const handleToggleLibrary = useCallback(async (gameId: number) => {
    if (!user) return;
    const existingIndex = library.findIndex(g => g.id === gameId);
    
    if (existingIndex > -1) {
      // Remove
      setLibrary(prev => prev.filter(g => g.id !== gameId));
      try {
        await userService.removeFromLibrary(user.uid, gameId);
        toast.info("Removed from cloud library");
      } catch (err) {
        toast.error("Failed to sync changes");
      }
    } else {
      // Add
      const game = games.find(g => g.id === gameId) || popularGames.find(g => g.id === gameId);
      if (game) {
        setLibrary(prev => [...prev, game]);
        try {
          await userService.addToLibrary(user.uid, game);
          toast.success("Saved to your account");
        } catch (err) {
          toast.error("Cloud sync failed");
        }
      }
    }
  }, [games, library, user]);

  if (authLoading) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    if (sysLoading || !systemInfo) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">
              {isElectron ? 'Detecting your hardware...' : 'Loading system information...'}
            </p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            systemInfo={systemInfo} 
            games={games} 
            library={library}
            onToggleLibrary={handleToggleLibrary}
            isElectron={isElectron}
          />
        );
      case 'search':
        return (
          <SearchView 
            systemInfo={systemInfo} 
            games={games} 
            library={library}
            onAddGame={handleAddGame} 
            onToggleLibrary={handleToggleLibrary}
          />
        );
      case 'library':
        return (
          <LibraryView 
            systemInfo={systemInfo} 
            library={library}
            allGames={games}
            onAddToLibrary={handleToggleLibrary}
            onRemoveFromLibrary={handleToggleLibrary}
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden animate-in fade-in duration-700">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar currentView={currentView} onNavigate={(view) => {
          setCurrentView(view);
          setSidebarOpen(false);
        }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={viewTitles[currentView]} 
          onMenuClick={() => setSidebarOpen(true)}
          isElectron={isElectron}
          onRefresh={refresh}
        />
        <main className="flex-1 overflow-auto p-6 scrollbar-hide">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
