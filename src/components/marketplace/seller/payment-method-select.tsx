'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, ChevronDown, Check, Search, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PAYMENT_METHODS,
  type PaymentMethodId,
  getPopularPaymentMethods,
  getPaymentMethodsByCategory,
  getPaymentCategoryOrder,
  searchPaymentMethods,
} from '@/lib/payment-methods'

interface PaymentMethodMultiSelectProps {
  selected: PaymentMethodId[]
  onChange: (methods: PaymentMethodId[]) => void
}

export function PaymentMethodMultiSelect({ selected, onChange }: PaymentMethodMultiSelectProps) {
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const popularMethods = useMemo(() => getPopularPaymentMethods(), [])
  const methodsByCategory = useMemo(() => getPaymentMethodsByCategory(), [])
  const categoryOrder = useMemo(() => getPaymentCategoryOrder(), [])

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
    return searchPaymentMethods(search)
  }, [search])

  const toggleMethod = (id: PaymentMethodId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const selectPopular = () => {
    const merged = new Set([...selected, ...popularMethods])
    onChange([...merged] as PaymentMethodId[])
  }

  const selectAll = () => {
    onChange(Object.keys(PAYMENT_METHODS) as PaymentMethodId[])
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected methods display + trigger */}
      <div
        className="min-h-[42px] flex flex-wrap gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 cursor-text"
        onClick={() => {
          setDropdownOpen(!dropdownOpen)
          setSearch('')
        }}
      >
        {selected.length === 0 ? (
          <span className="text-sm text-gray-400 select-none flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" />
            Select payment methods you accept...
          </span>
        ) : (
          selected.slice(0, 5).map((id) => {
            const config = PAYMENT_METHODS[id]
            return (
              <Badge
                key={id}
                variant="outline"
                className="gap-1 text-xs bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800"
              >
                <span className="text-sm">{config?.icon}</span>
                <span>{config?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMethod(id)
                  }}
                  className="ml-0.5 rounded-full hover:bg-violet-200 dark:hover:bg-violet-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })
        )}
        {selected.length > 5 && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
            +{selected.length - 5} more
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
                placeholder="Search payment methods..."
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
                className="h-6 text-xs text-violet-600 hover:text-violet-700"
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

          {/* Payment methods list */}
          <div className="max-h-56 overflow-y-auto">
            {search.trim() ? (
              // Search results
              filteredSearch.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-400">
                  No payment method found
                </div>
              ) : (
                filteredSearch.map((id) => {
                  const config = PAYMENT_METHODS[id]
                  if (!config) return null
                  const isSelected = selected.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-violet-50 dark:bg-violet-950/30' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleMethod(id)
                      }}
                    >
                      <span className="flex-shrink-0">
                        {isSelected ? (
                          <Check className="h-4 w-4 text-violet-600" />
                        ) : (
                          <span className="inline-block h-4 w-4 rounded border border-gray-300" />
                        )}
                      </span>
                      <span className="text-base">{config.icon}</span>
                      <span className={isSelected ? 'font-medium text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}>
                        {config.name}
                      </span>
                      <span className="ml-auto text-[10px] text-gray-400">{config.category}</span>
                    </button>
                  )
                })
              )
            ) : (
              <>
                {/* Popular methods */}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Popular</span>
                </div>
                {popularMethods.map((id) => {
                  const config = PAYMENT_METHODS[id]
                  if (!config) return null
                  const isSelected = selected.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-violet-50 dark:bg-violet-950/30' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleMethod(id)
                      }}
                    >
                      <span className="flex-shrink-0">
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-violet-600" />
                        ) : (
                          <span className="inline-block h-3.5 w-3.5 rounded border border-gray-300" />
                        )}
                      </span>
                      <span className="text-sm">{config.icon}</span>
                      <span className={isSelected ? 'font-medium text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}>
                        {config.name}
                      </span>
                      <span className="ml-auto text-[10px] text-gray-400 hidden sm:inline">{config.description}</span>
                    </button>
                  )
                })}

                {/* Grouped by category */}
                {categoryOrder.map((category) => {
                  const ids = methodsByCategory[category]
                  if (!ids?.length) return null
                  const remaining = ids.filter((m) => !popularMethods.includes(m))
                  if (!remaining.length) return null
                  return (
                    <div key={category}>
                      <div className="px-3 pt-2 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{category}</span>
                      </div>
                      {remaining.map((id) => {
                        const config = PAYMENT_METHODS[id]
                        if (!config) return null
                        const isSelected = selected.includes(id)
                        return (
                          <button
                            key={id}
                            type="button"
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              isSelected ? 'bg-violet-50 dark:bg-violet-950/30' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleMethod(id)
                            }}
                          >
                            <span className="flex-shrink-0">
                              {isSelected ? (
                                <Check className="h-3.5 w-3.5 text-violet-600" />
                              ) : (
                                <span className="inline-block h-3.5 w-3.5 rounded border border-gray-300" />
                              )}
                            </span>
                            <span className="text-sm">{config.icon}</span>
                            <span className={isSelected ? 'font-medium text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}>
                              {config.name}
                            </span>
                            <span className="ml-auto text-[10px] text-gray-400 hidden sm:inline">{config.description}</span>
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
