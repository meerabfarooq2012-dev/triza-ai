'use client';

import { useState, useEffect, useCallback } from 'react';
import { Share, Plus, Check, X, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DISMISSAL_KEY = 'thiora_ios_install_dismissed';
const DISMISSAL_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

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
      'Look for the Share icon (square with arrow pointing up) at the bottom of Safari.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Plus,
    label: 'Step 2',
    title: 'Add to Home Screen',
    description:
      'Scroll down in the share menu and tap "Add to Home Screen".',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Check,
    label: 'Step 3',
    title: 'Tap "Add"',
    description:
      'Confirm by tapping "Add" — Thiora will appear on your home screen like a real app!',
    color: 'from-amber-500 to-orange-600',
  },
];

export function IosInstallInstructions() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isIOSSafari()) return;
    if (isStandaloneMode()) return;
    if (wasRecentlyDismissed()) return;

    const timer = setTimeout(() => setOpen(true), 4000);
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
      <DialogContent className="sm:max-w-md border-0 bg-background shadow-2xl p-0 overflow-hidden animate-modal-pop">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-6 pt-5 pb-6">
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1.5 bg-black/20 text-white/80 hover:bg-black/30 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
              <img
                src="/logo.png"
                alt="Thiora"
                className="h-10 w-10 rounded-xl"
              />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Install Thiora
              </DialogTitle>
              <DialogDescription className="text-sm text-white/80 mt-0.5">
                Get the app experience on your iPhone
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {step.label}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground leading-tight -mt-0.5">
                    {step.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="px-6 pb-6 pt-1">
          <Button
            onClick={handleDismiss}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Got it, I'll install it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
