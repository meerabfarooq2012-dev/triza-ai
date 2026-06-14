'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { InstallAppDialog } from '@/components/marketplace/shared/install-app-dialog';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextValue {
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  promptInstall: () => Promise<void>;
  openInstallDialog: () => void;
  registration: ServiceWorkerRegistration | null;
}

const isIOSSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
};

const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(window.navigator.userAgent);
};

const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
};

const PwaContext = createContext<PwaContextValue>({
  isInstalled: false,
  isOnline: true,
  canInstall: false,
  isStandalone: false,
  isIOS: false,
  isAndroid: false,
  promptInstall: async () => {},
  openInstallDialog: () => {},
  registration: null,
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        setRegistration(reg);

        const interval = setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    };

    registerSW();
  }, []);

  // Check if already installed and detect device
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone = isStandaloneMode();
    const ios = isIOSSafari();
    const android = isAndroidDevice();

    setIsStandalone(standalone);
    setIsIOS(ios);
    setIsAndroid(android);
    setIsInstalled(standalone);
  }, []);

  // Track online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Listen for appinstalled
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  // Legacy prompt install function (for backward compatibility)
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // No deferred prompt — open the install dialog instead
      setInstallDialogOpen(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch {
      // Prompt failed silently
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Open the install dialog with 3 options
  const openInstallDialog = useCallback(() => {
    setInstallDialogOpen(true);
  }, []);

  const contextValue: PwaContextValue = {
    isInstalled,
    isOnline,
    canInstall: !!deferredPrompt,
    isStandalone,
    isIOS,
    isAndroid,
    promptInstall,
    openInstallDialog,
    registration,
  };

  return (
    <PwaContext.Provider value={contextValue}>
      {children}
      <InstallAppDialog
        open={installDialogOpen}
        onOpenChange={setInstallDialogOpen}
        deferredPrompt={deferredPrompt}
        isStandalone={isStandalone}
      />
    </PwaContext.Provider>
  );
}
