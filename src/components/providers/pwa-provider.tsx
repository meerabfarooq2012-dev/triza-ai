'use client';

import { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react';
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
  // Push notification state
  pushSupported: boolean;
  pushPermission: NotificationPermission | 'default';
  pushSubscribed: boolean;
  requestPushPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
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
  pushSupported: false,
  pushPermission: 'default',
  pushSubscribed: false,
  requestPushPermission: async () => false,
  subscribeToPush: async () => false,
  unsubscribeFromPush: async () => false,
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

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'default'>('default');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const pushSubscriptionRef = useRef<PushSubscription | null>(null);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Always check server for SW updates (never use cached sw.js)
        });
        setRegistration(reg);

        // When a new SW takes control, reload once so users get fresh assets
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        // Check if already subscribed to push
        if ('PushManager' in window) {
          const existingSub = await reg.pushManager.getSubscription();
          if (existingSub) {
            pushSubscriptionRef.current = existingSub;
            setPushSubscribed(true);
          }
        }

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

    // Check push notification support
    const supported = 'PushManager' in window && 'Notification' in window;
    setPushSupported(supported);

    if (supported) {
      setPushPermission(Notification.permission);
    }
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

  // ── Push Notification Methods ──────────────────────────────────────────

  /**
   * Request notification permission from the browser
   * Returns true if granted, false otherwise
   */
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }, []);

  /**
   * Subscribe to push notifications
   * 1. Requests permission if not granted
   * 2. Gets VAPID public key from server
   * 3. Creates push subscription via service worker
   * 4. Sends subscription to server for storage
   */
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      console.warn('[Push] Service worker not registered');
      return false;
    }

    try {
      // Step 1: Request permission
      let permission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
        setPushPermission(permission);
      }

      if (permission !== 'granted') {
        console.warn('[Push] Notification permission denied');
        return false;
      }

      // Step 2: Get VAPID public key from server
      const keyResponse = await fetch('/api/push/vapid-key');
      if (!keyResponse.ok) {
        console.error('[Push] Failed to get VAPID key');
        return false;
      }
      const keyData = await keyResponse.json();
      if (!keyData.success || !keyData.data?.publicKey) {
        console.error('[Push] VAPID key not available:', keyData.error);
        return false;
      }

      const vapidPublicKey = keyData.data.publicKey;

      // Convert base64 to Uint8Array for the applicationServerKey
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Step 3: Create push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      pushSubscriptionRef.current = subscription;
      setPushSubscribed(true);

      // Step 4: Send subscription to server with auth token
      const subJson = subscription.toJSON();

      // Get auth token from the marketplace store
      let authToken: string | null = null;
      try {
        const { useMarketplaceStore } = await import('@/store/use-marketplace-store');
        const state = useMarketplaceStore.getState();
        authToken = state.authToken;
      } catch {
        // Store not available
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Push] Failed to save subscription on server:', errorData.error);
        // Roll back local subscription since server save failed
        try {
          await subscription.unsubscribe();
        } catch {
          // ignore
        }
        setPushSubscribed(false);
        pushSubscriptionRef.current = null;
        return false;
      }

      console.log('[Push] Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      setPushSubscribed(false);
      return false;
    }
  }, [registration]);

  /**
   * Unsubscribe from push notifications
   * 1. Unsubscribes via the PushSubscription object
   * 2. Tells server to remove the subscription
   */
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!pushSubscriptionRef.current) {
      // Try to get existing subscription from the service worker
      if (registration) {
        try {
          const existingSub = await registration.pushManager.getSubscription();
          if (existingSub) {
            pushSubscriptionRef.current = existingSub;
          }
        } catch {
          // ignore
        }
      }

      if (!pushSubscriptionRef.current) {
        setPushSubscribed(false);
        return true; // Already unsubscribed
      }
    }

    try {
      const sub = pushSubscriptionRef.current;
      const endpoint = sub.endpoint;

      // Unsubscribe locally
      await sub.unsubscribe();
      pushSubscriptionRef.current = null;
      setPushSubscribed(false);

      // Tell server to remove subscription with auth token
      let unsubscribeAuthToken: string | null = null;
      try {
        const { useMarketplaceStore } = await import('@/store/use-marketplace-store');
        const state = useMarketplaceStore.getState();
        unsubscribeAuthToken = state.authToken;
      } catch {
        // Store not available
      }

      const unsubHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (unsubscribeAuthToken) {
        unsubHeaders['Authorization'] = `Bearer ${unsubscribeAuthToken}`;
      }

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: unsubHeaders,
        body: JSON.stringify({ endpoint }),
      });

      console.log('[Push] Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }, [registration]);

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
    pushSupported,
    pushPermission,
    pushSubscribed,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
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

// ── Utility: Convert base64 URL to Uint8Array ────────────────────────────
// Required for the applicationServerKey parameter of pushManager.subscribe()
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
