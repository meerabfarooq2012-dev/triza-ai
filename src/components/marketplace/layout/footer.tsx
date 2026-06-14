'use client'

import { useSyncExternalStore } from 'react'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/lib/constants'
import { useLanguage } from '@/hooks/use-language'
import { useIsMobile } from '@/hooks/use-mobile'
import type { ViewMode } from '@/types'

// PWA standalone mode detection
function subscribeToStandalone(callback: () => void) {
  const mq = window.matchMedia('(display-mode: standalone)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}
function getStandaloneSnapshot() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
}
function getStandaloneServerSnapshot() { return false }

const quickLinks = [
  { label: 'About', view: 'landing' as ViewMode },
  { label: 'How it Works', view: 'landing' as ViewMode },
  { label: 'Categories', view: 'search' as ViewMode },
  { label: 'Become a Seller', view: 'auth' as ViewMode },
]

const supportLinks = [
  { label: 'Help Center', view: null, href: '#' },
  { label: 'Contact Us', view: null, href: '#' },
  { label: 'Terms of Service', view: 'terms' as ViewMode | null, href: undefined },
  { label: 'Privacy Policy', view: 'privacy' as ViewMode | null, href: undefined },
]

const socialLinks = [
  { label: 'Twitter', icon: Twitter, href: '#' },
  { label: 'GitHub', icon: Github, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
  { label: 'Email', icon: Mail, href: '#' },
]

export function Footer() {
  const { setCurrentView, isAuthenticated } = useMarketplaceStore()
  const { t } = useLanguage()
  const isMobile = useIsMobile()
  const isStandalone = useSyncExternalStore(subscribeToStandalone, getStandaloneSnapshot, getStandaloneServerSnapshot)

  const handleNavClick = (view: ViewMode, params?: Record<string, string>) => {
    if (view === 'auth' && !isAuthenticated) {
      setCurrentView('auth', { mode: 'register' })
    } else {
      setCurrentView(view)
    }
  }

  // Hide footer on mobile and in PWA standalone mode (bottom nav provides navigation)
  if (isMobile || isStandalone) return null

  return (
    <footer className="mt-auto border-t bg-muted/20 pb-16 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => handleNavClick('landing')}
              className="inline-flex items-center gap-2 mb-3"
              aria-label="Go to homepage"
            >
              <img src="/logo.png" alt="Thiora" className="h-7 w-7 rounded-lg" />
              <span className="text-xl font-extrabold gold-gradient-text">
                {PLATFORM_NAME}
              </span>
            </button>
            <p className="text-sm text-muted-foreground max-w-xs">
              {PLATFORM_TAGLINE}. {t('footer.footerDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.view)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  {link.view ? (
                    <button
                      onClick={() => setCurrentView(link.view as ViewMode)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.connect')}</h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 gold-divider" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {PLATFORM_NAME}. {t('footer.allRightsReserved')}</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('terms')} className="hover:text-foreground transition-colors">{t('footer.terms')}</button>
            <button onClick={() => setCurrentView('privacy')} className="hover:text-foreground transition-colors">{t('footer.privacy')}</button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('thiora:open-cookie-preferences'))}
              className="hover:text-foreground transition-colors"
            >
              {t('footer.cookieSettings')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
