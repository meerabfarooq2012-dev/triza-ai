'use client';

import { useState, useEffect, useCallback } from 'react';
import { Share, Plus, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DISMISSAL_KEY = 'thiora_ios_install_dismissed';
const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isIOSSafari = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
};

const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
};

const wasRecentlyDismissed = (): boolean => {
  try {
    const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
    if (!dismissedAt) return false;
    return Date.now() - parseInt(dismissedAt, 10) < DISMISSAL_DURATION_MS;
  } catch {
    return false;
  }
};

const steps = [
  {
    icon: Share,
    label: 'Step 1',
    title: 'Tap the Share button',
    description:
      'Look for the Share icon (arrow pointing up) at the bottom of Safari, then tap it.',
  },
  {
    icon: Plus,
    label: 'Step 2',
    title: 'Tap "Add to Home Screen"',
    description:
      'Scroll down in the share menu and select "Add to Home Screen" from the list of options.',
  },
  {
    icon: Check,
    label: 'Step 3',
    title: 'Tap "Add"',
    description:
      'Confirm by tapping "Add" in the top-right corner. Thiora will now appear on your home screen!',
  },
];

export function IosInstallInstructions() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari, not in standalone mode, and not recently dismissed
    if (!isIOSSafari()) return;
    if (isStandaloneMode()) return;
    if (wasRecentlyDismissed()) return;

    // Small delay so it doesn't appear instantly on page load
    const timer = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    } catch {
      // localStorage unavailable
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        handleDismiss();
      }
    }}>
      <DialogContent className="sm:max-w-md border-amber-500/20 bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-stone-950/95 backdrop-blur-sm text-amber-50">
        <DialogHeader className="items-center text-center">
          <img
            src="/logo.png"
            alt="Thiora"
            className="h-14 w-14 rounded-xl shadow-lg mb-1"
          />
          <DialogTitle className="text-lg font-bold text-amber-100">
            Install Thiora on your iPhone
          </DialogTitle>
          <DialogDescription className="text-sm text-amber-200/70">
            Add Thiora to your home screen for a faster, app-like experience.
          </DialogDescription>
        </DialogHeader>

        {/* Steps */}
        <div className="mt-2 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-amber-500/15 bg-amber-900/20 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400/70">
                    {step.label}
                  </span>
                  <h4 className="text-sm font-semibold text-amber-100 leading-tight">
                    {step.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-amber-200/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dismiss button */}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleDismiss}
            className="bg-gradient-to-r from-amber-500 to-amber-600 font-semibold text-white shadow-md hover:from-amber-600 hover:to-amber-700"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
