'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISSAL_KEY = 'thiora_pwa_dismissed';
const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

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
        setTimeout(() => setShowBanner(true), 3000);
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
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
    } catch {
      // Prompt failed silently
    } finally {
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-stone-950/95 p-4 shadow-2xl backdrop-blur-sm">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-amber-400/70 transition-colors hover:bg-amber-900/30 hover:text-amber-300"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-4">
          {/* Icon */}
          <img src="/logo.png" alt="Thiora" className="h-10 w-10 shrink-0 rounded-lg shadow-md" />

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-sm font-semibold text-amber-100">
                Install Thiora
              </h3>
              <p className="mt-0.5 text-xs text-amber-200/70">
                Add to your home screen for a faster, app-like experience.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={isInstalling}
                className="h-8 bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-semibold text-white shadow-md hover:from-amber-600 hover:to-amber-700 disabled:opacity-60"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {isInstalling ? 'Installing...' : 'Install'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 text-xs text-amber-400/70 hover:bg-amber-900/20 hover:text-amber-300"
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
