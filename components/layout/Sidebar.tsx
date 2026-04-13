'use client';

import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Search, 
  Library, 
  Settings,
  Gamepad2,
  Info,
  LogOut,
  LogIn,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type View = 'dashboard' | 'search' | 'library' | 'settings';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Search Games', icon: Search },
  { id: 'library', label: 'My Library', icon: Library },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Gamepad2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg uppercase tracking-tight">FPS Test</h1>
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest opacity-80">Performance Tool</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2 py-1">
              <Avatar className="w-9 h-9 border border-border">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.displayName?.charAt(0) || <UserIcon className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {user.displayName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider mt-0.5">
                  Synced to Cloud
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/5 border-red-500/10"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full gap-2 bg-primary hover:bg-primary/90"
            onClick={() => loginWithGoogle()}
          >
            <LogIn className="w-4 h-4" />
            Connect Account
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-footer/30">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
          <Info className="w-3 h-3" />
          <span>Web Preview</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed opacity-60">
          Sign in to save your hardware profile across devices.
        </p>
      </div>
    </aside>
  );
}
