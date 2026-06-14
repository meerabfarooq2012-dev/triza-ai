'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, ChevronDown, Check, Search, Banknote } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CURRENCIES, type CurrencyCode, getPopularCurrencies, getCurrenciesByRegion, getRegionOrder, searchCurrencies } from '@/lib/currency'

interface CurrencyMultiSelectProps {
  selected: CurrencyCode[]
  onChange: (currencies: CurrencyCode[]) => void
}

export function CurrencyMultiSelect({ selected, onChange }: CurrencyMultiSelectProps) {
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const popularCurrencies = useMemo(() => getPopularCurrencies(), [])
  const regionsByGroup = useMemo(() => getCurrenciesByRegion(), [])
  const regionOrder = useMemo(() => getRegionOrder(), [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredSearch = useMemo(() => {
    if (!search.trim()) return []
    return searchCurrencies(search)
  }, [search])

  const toggleCurrency = (code: CurrencyCode) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code))
    } else {
      onChange([...selected, code])
    }
  }

  const selectPopular = () => {
    const merged = new Set([...selected, ...popularCurrencies])
    onChange([...merged] as CurrencyCode[])
  }

  const selectAll = () => {
    onChange(Object.keys(CURRENCIES) as CurrencyCode[])
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected currencies display + trigger */}
      <div
        className="min-h-[42px] flex flex-wrap gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 cursor-text"
        onClick={() => {
          setDropdownOpen(!dropdownOpen)
          setSearch('')
        }}
      >
        {selected.length === 0 ? (
          <span className="text-sm text-gray-400 select-none flex items-center gap-1.5">
            <Banknote className="h-4 w-4" />
            Select currencies you accept...
          </span>
        ) : (
          selected.slice(0, 6).map((code) => {
            const config = CURRENCIES[code]
            return (
              <Badge
                key={code}
                variant="outline"
                className="gap-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              >
                <span className="text-sm">{config?.flag}</span>
                <span>{config?.symbol} {code}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCurrency(code)
                  }}
                  className="ml-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })
        )}
        {selected.length > 6 && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
            +{selected.length - 6} more
          </Badge>
        )}
        <ChevronDown className="ml-auto h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-80 overflow-hidden">
          {/* Search + Actions */}
          <div className="border-b border-gray-100 dark:border-gray-700 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search currencies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-emerald-600 hover:text-emerald-700"
                onClick={(e) => {
                  e.stopPropagation()
                  selectPopular()
                }}
              >
                Popular
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-amber-600 hover:text-amber-700"
                onClick={(e) => {
                  e.stopPropagation()
                  selectAll()
                }}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-red-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
              >
                Clear All
              </Button>
              <span className="text-xs text-gray-400 self-center ml-auto">
                {selected.length} selected
              </span>
            </div>
          </div>

          {/* Currency list */}
          <div className="max-h-56 overflow-y-auto">
            {search.trim() ? (
              // Search results
              filteredSearch.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-400">
                  No currency found
                </div>
              ) : (
                filteredSearch.map((code) => {
                  const config = CURRENCIES[code]
                  if (!config) return null
                  const isSelected = selected.includes(code)
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCurrency(code)
                      }}
                    >
                      <span className="flex-shrink-0">
                        {isSelected ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <span className="inline-block h-4 w-4 rounded border border-gray-300" />
                        )}
                      </span>
                      <span className="text-base">{config.flag}</span>
                      <span className={isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}>
                        {config.symbol} {config.code}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">{config.name}</span>
                    </button>
                  )
                })
              )
            ) : (
              <>
                {/* Popular currencies */}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Popular</span>
                </div>
                {popularCurrencies.map((code) => {
                  const config = CURRENCIES[code]
                  if (!config) return null
                  const isSelected = selected.includes(code)
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCurrency(code)
                      }}
                    >
                      <span className="flex-shrink-0">
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <span className="inline-block h-3.5 w-3.5 rounded border border-gray-300" />
                        )}
                      </span>
                      <span className="text-sm">{config.flag}</span>
                      <span className={isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}>
                        {config.symbol} {code}
                      </span>
                      <span className="ml-auto text-[10px] text-gray-400">{config.name}</span>
                    </button>
                  )
                })}

                {/* Grouped by region */}
                {regionOrder.map((region) => {
                  const codes = regionsByGroup[region]
                  if (!codes?.length) return null
                  const remaining = codes.filter((c) => !popularCurrencies.includes(c))
                  if (!remaining.length) return null
                  return (
                    <div key={region}>
                      <div className="px-3 pt-2 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{region}</span>
                      </div>
                      {remaining.map((code) => {
                        const config = CURRENCIES[code]
                        if (!config) return null
                        const isSelected = selected.includes(code)
                        return (
                          <button
                            key={code}
                            type="button"
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              isSelected ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCurrency(code)
                            }}
                          >
                            <span className="flex-shrink-0">
                              {isSelected ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <span className="inline-block h-3.5 w-3.5 rounded border border-gray-300" />
                              )}
                            </span>
                            <span className="text-sm">{config.flag}</span>
                            <span className={isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}>
                              {config.symbol} {code}
                            </span>
                            <span className="ml-auto text-[10px] text-gray-400">{config.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
