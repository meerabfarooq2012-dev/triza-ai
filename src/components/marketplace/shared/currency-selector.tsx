'use client'

import { useState, useMemo } from 'react'
import { Banknote, Check, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CURRENCIES, type CurrencyCode, getPopularCurrencies, getCurrenciesByRegion, getRegionOrder, searchCurrencies } from '@/lib/currency'

export function CurrencySelector({ variant = 'default' }: { variant?: 'default' | 'compact' | 'icon' }) {
  const { currency, changeCurrency, currencyConfig } = useCurrency()
  const [searchQuery, setSearchQuery] = useState('')
  const popularCurrencies = getPopularCurrencies()
  const regionsByGroup = useMemo(() => getCurrenciesByRegion(), [])
  const regionOrder = useMemo(() => getRegionOrder(), [])

  if (variant === 'icon') {
    return (
      <DropdownMenu onOpenChange={() => setSearchQuery('')}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Banknote className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold leading-none">
              {currency}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Currency
          </DropdownMenuLabel>
          <div className="px-2 pb-2">
            <Input
              placeholder="Search currency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <DropdownMenuSeparator />
          <ScrollArea className="max-h-72">
            {searchQuery ? (
              searchCurrencies(searchQuery).map((key) => {
                const config = CURRENCIES[key]
                if (!config) return null
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => { changeCurrency(key); setSearchQuery('') }}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{config.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{config.symbol} {config.code}</span>
                        <span className="text-[10px] text-muted-foreground">{config.name}</span>
                      </div>
                    </div>
                    {key === currency && (
                      <Check size={14} className="text-amber-600 flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                )
              })
            ) : (
              Object.entries(CURRENCIES).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => { changeCurrency(key as CurrencyCode); setSearchQuery('') }}
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
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu onOpenChange={() => setSearchQuery('')}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 px-2">
            <span className="text-sm">{currencyConfig.flag}</span>
            <span className="text-xs font-medium">{currencyConfig.symbol}</span>
            <span className="text-[10px] text-muted-foreground">{currency}</span>
            <ChevronDown size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {/* Search */}
          <div className="px-2 py-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search currency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-7"
              />
            </div>
          </div>
          <DropdownMenuSeparator />

          <ScrollArea className="max-h-80">
            {searchQuery ? (
              // Search results
              searchCurrencies(searchQuery).map((key) => {
                const config = CURRENCIES[key]
                if (!config) return null
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => { changeCurrency(key); setSearchQuery('') }}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{config.flag}</span>
                      <span className="text-sm">{config.symbol}</span>
                      <span className="text-xs">{config.code}</span>
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">{config.name}</span>
                    </div>
                    {key === currency && (
                      <Check size={14} className="text-amber-600" />
                    )}
                  </DropdownMenuItem>
                )
              })
            ) : (
              <>
                {/* Popular currencies */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Popular
                </DropdownMenuLabel>
                {popularCurrencies.map((key) => {
                  const config = CURRENCIES[key]
                  if (!config) return null
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => { changeCurrency(key); setSearchQuery('') }}
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

                {/* Grouped by region */}
                {regionOrder.map((region) => {
                  const codes = regionsByGroup[region]
                  if (!codes?.length) return null
                  // Filter out popular ones that are already shown
                  const remaining = codes.filter((c) => !popularCurrencies.includes(c))
                  if (!remaining.length) return null
                  return (
                    <div key={region}>
                      <DropdownMenuLabel className="text-xs text-muted-foreground pt-2">
                        {region}
                      </DropdownMenuLabel>
                      {remaining.map((key) => {
                        const config = CURRENCIES[key]
                        if (!config) return null
                        return (
                          <DropdownMenuItem
                            key={key}
                            onClick={() => { changeCurrency(key); setSearchQuery('') }}
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
                    </div>
                  )
                })}
              </>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default variant - full dropdown with search + grouped regions
  return (
    <DropdownMenu onOpenChange={() => setSearchQuery('')}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9">
          <Banknote className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{currencyConfig.symbol} {currency}</span>
          <span className="sm:hidden text-xs">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select Currency
        </DropdownMenuLabel>

        {/* Search input */}
        <div className="px-2 py-1.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search currencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm pl-8"
            />
          </div>
        </div>

        <DropdownMenuSeparator />
        <ScrollArea className="max-h-96">
          {searchQuery ? (
            // Search results
            searchCurrencies(searchQuery).map((key) => {
              const config = CURRENCIES[key]
              if (!config) return null
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => { changeCurrency(key); setSearchQuery('') }}
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
                      <span className="text-[10px] text-muted-foreground">{config.name} · {config.region}</span>
                    </div>
                  </div>
                  {key === currency && (
                    <Check size={16} className="text-amber-600" />
                  )}
                </DropdownMenuItem>
              )
            })
          ) : (
            <>
              {/* Popular currencies */}
              <DropdownMenuLabel className="text-xs text-muted-foreground text-uppercase tracking-wider">
                ⭐ Popular
              </DropdownMenuLabel>
              {popularCurrencies.map((key) => {
                const config = CURRENCIES[key]
                if (!config) return null
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => { changeCurrency(key); setSearchQuery('') }}
                    className={`
                      flex items-center justify-between gap-3 cursor-pointer py-2
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
                )
              })}
              <DropdownMenuSeparator />

              {/* Grouped by region */}
              {regionOrder.map((region) => {
                const codes = regionsByGroup[region]
                if (!codes?.length) return null
                const remaining = codes.filter((c) => !popularCurrencies.includes(c))
                if (!remaining.length) return null
                return (
                  <div key={region}>
                    <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider pt-2">
                      {region}
                    </DropdownMenuLabel>
                    {remaining.map((key) => {
                      const config = CURRENCIES[key]
                      if (!config) return null
                      return (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => { changeCurrency(key); setSearchQuery('') }}
                          className={`
                            flex items-center justify-between gap-3 cursor-pointer py-2
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
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
