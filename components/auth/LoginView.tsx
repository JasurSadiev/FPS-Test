'use client';

import { Github, Gamepad2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/AuthContext';

export function LoginView() {
  const { loginWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-bounce-subtle">
            <Gamepad2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white italic">
            FPS <span className="text-primary italic">TEST</span> PERFORMANCE
          </h1>
          <p className="text-muted-foreground text-lg">
            Professional Hardware Analysis & Benchmarking
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to sync your PC specs and game library to the cloud.</p>
            </div>

            <Button 
              size="lg"
              className="w-full bg-white text-black hover:bg-white/90 font-bold h-14 rounded-xl gap-3 transition-transform active:scale-95"
              onClick={() => loginWithGoogle()}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </Button>

            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Instant</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Synced</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-muted-foreground font-medium opacity-50">
          BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE
        </p>
      </div>
    </div>
  );
}
