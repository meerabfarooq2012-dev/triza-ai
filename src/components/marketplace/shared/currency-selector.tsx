'use client'

import { Banknote, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCurrency } from '@/hooks/use-currency'
import { CURRENCIES, type CurrencyCode, getPopularCurrencies } from '@/lib/currency'

export function CurrencySelector({ variant = 'default' }: { variant?: 'default' | 'compact' | 'icon' }) {
  const { currency, changeCurrency, currencyConfig } = useCurrency()
  const popularCurrencies = getPopularCurrencies()

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Banknote className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold leading-none">
              {currency}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Currency
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="max-h-72">
            {Object.entries(CURRENCIES).map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => changeCurrency(key as CurrencyCode)}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{config.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{config.code}</span>
                    {key !== currency && (
                      <span className="text-[10px] text-muted-foreground">{config.name}</span>
                    )}
                  </div>
                </div>
                {key === currency && (
                  <Check size={14} className="text-amber-600 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 px-2">
            <span className="text-sm">{currencyConfig.flag}</span>
            <span className="text-xs font-medium">{currencyConfig.symbol}</span>
            <span className="text-[10px] text-muted-foreground">{currency}</span>
            <ChevronDown size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Popular Currencies
          </DropdownMenuLabel>
          {popularCurrencies.map((key) => {
            const config = CURRENCIES[key]
            if (!config) return null
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => changeCurrency(key)}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{config.flag}</span>
                  <span className="text-sm">{config.symbol}</span>
                  <span className="text-xs text-muted-foreground">{config.code}</span>
                </div>
                {key === currency && (
                  <Check size={14} className="text-amber-600" />
                )}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            All Currencies
          </DropdownMenuLabel>
          {Object.entries(CURRENCIES)
            .filter(([key]) => !popularCurrencies.includes(key as CurrencyCode))
            .map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => changeCurrency(key as CurrencyCode)}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{config.flag}</span>
                  <span className="text-sm">{config.symbol}</span>
                  <span className="text-xs text-muted-foreground">{config.code}</span>
                </div>
                {key === currency && (
                  <Check size={14} className="text-amber-600" />
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
          <Banknote className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{currencyConfig.symbol} {currency}</span>
          <span className="sm:hidden text-xs">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select Currency
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-80">
          {Object.entries(CURRENCIES).map(([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => changeCurrency(key as CurrencyCode)}
              className={`
                flex items-center justify-between gap-3 cursor-pointer py-2.5
                ${key === currency ? 'bg-amber-50 dark:bg-amber-950/30' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{config.flag}</span>
                <div className="flex flex-col">
                  <span className={`text-sm ${key === currency ? 'font-semibold text-amber-700 dark:text-amber-400' : 'font-medium'}`}>
                    {config.symbol} {config.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{config.name}</span>
                </div>
              </div>
              {key === currency && (
                <Check size={16} className="text-amber-600" />
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
