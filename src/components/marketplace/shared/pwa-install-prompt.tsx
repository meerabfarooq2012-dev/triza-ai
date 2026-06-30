'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Star, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISSAL_KEY = 'thiora_pwa_dismissed';
const DISMISSAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Feature highlights — like an app store listing
// ---------------------------------------------------------------------------
const FEATURES = [
  { icon: Zap, text: 'Fast & Offline Ready' },
  { icon: Shield, text: 'Secure & Private' },
  { icon: Star, text: 'Free to Install' },
];

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  // Check if the user previously dismissed the banner
  const wasRecentlyDismissed = useCallback(() => {
    try {
      const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
      if (!dismissedAt) return false;
      return Date.now() - parseInt(dismissedAt, 10) < DISMISSAL_DURATION_MS;
    } catch {
      return false;
    }
  }, []);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Only show the banner if it wasn't recently dismissed
      if (!wasRecentlyDismissed()) {
        // Small delay so it doesn't appear instantly on page load
        setTimeout(() => setShowBanner(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [wasRecentlyDismissed]);

  // Listen for the appinstalled event to hide the banner
  useEffect(() => {
    const handler = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    // Simulate progress for app-store-like feel
    setInstallProgress(0);
    const progressInterval = setInterval(() => {
      setInstallProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallProgress(100);
        setTimeout(() => setShowBanner(false), 500);
      }
    } catch {
      // Prompt failed silently
    } finally {
      clearInterval(progressInterval);
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    } catch {
      // localStorage unavailable
    }
  };

  // Don't render if not showing
  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-center sm:inset-auto sm:bottom-4 sm:right-4 sm:max-w-sm animate-bottom-sheet">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden"
        onClick={handleDismiss}
      />

      {/* Card — App Store style */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-amber-500/20 bg-background shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-6 pt-5 pb-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1.5 bg-black/20 text-white/80 transition-colors hover:bg-black/30 hover:text-white"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* App icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
              <img
                src="/logo.png"
                alt="TRIZA"
                className="h-12 w-12 rounded-xl"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white leading-tight">
                TRIZA
              </h3>
              <p className="text-sm text-white/80 mt-0.5">
                Freelance. Digital. Physical.
              </p>
              {/* Star rating like app store */}
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300"
                  />
                ))}
                <span className="ml-1 text-xs text-white/70 font-medium">4.9</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="px-6 py-4 space-y-4">
          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.text}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Install progress or button */}
          {isInstalling ? (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-amber-500/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out"
                  style={{ width: `${installProgress}%` }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground font-medium">
                {installProgress >= 100 ? 'Installed! Opening...' : 'Installing TRIZA...'}
              </p>
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-base font-bold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-500/30 transition-all active:scale-[0.98]"
            >
              <Download className="mr-2 h-5 w-5" />
              Install App
            </Button>
          )}

          {/* Dismiss link */}
          {!isInstalling && (
            <button
              onClick={handleDismiss}
              className="block mx-auto text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Not now
            </button>
          )}
        </div>

        {/* Safe area for bottom */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>
  );
}
