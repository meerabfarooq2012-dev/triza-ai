'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/hooks/use-language'
import { LOCALE_CONFIG, type Locale } from '@/lib/i18n'

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' | 'icon' }) {
  const { locale, setLocale, t } = useLanguage()
  const currentConfig = LOCALE_CONFIG[locale]

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Globe className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold leading-none">
              {locale.toUpperCase()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {t('language.title')}
          </DropdownMenuLabel>
          {Object.entries(LOCALE_CONFIG).map(([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setLocale(key as Locale)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{config.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{config.nativeLabel}</span>
                  {key !== locale && (
                    <span className="text-[10px] text-muted-foreground">{config.label}</span>
                  )}
                </div>
              </div>
              {key === locale && (
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 px-2">
            <span className="text-sm">{currentConfig.flag}</span>
            <span className="text-xs font-medium">{currentConfig.nativeLabel}</span>
            <ChevronDown size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(LOCALE_CONFIG).map(([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setLocale(key as Locale)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{config.flag}</span>
                <span className="text-sm">{config.nativeLabel}</span>
              </div>
              {key === locale && (
                <Check size={14} className="text-emerald-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default variant - full dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{currentConfig.nativeLabel}</span>
          <span className="sm:hidden text-xs">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('language.changeLanguage')}
        </DropdownMenuLabel>
        {Object.entries(LOCALE_CONFIG).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLocale(key as Locale)}
            className={`
              flex items-center justify-between gap-3 cursor-pointer py-2.5
              ${key === locale ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{config.flag}</span>
              <div className="flex flex-col">
                <span className={`text-sm ${key === locale ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'font-medium'}`}>
                  {config.nativeLabel}
                </span>
                <span className="text-[10px] text-muted-foreground">{config.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {config.direction === 'rtl' && (
                <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                  RTL
                </span>
              )}
              {key === locale && (
                <Check size={16} className="text-emerald-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
