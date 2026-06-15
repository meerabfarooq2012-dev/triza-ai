'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, ChevronDown, Check, Search, CreditCard, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PAYMENT_METHODS,
  type PaymentMethodId,
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
  const [enabledMethods, setEnabledMethods] = useState<PaymentMethodId[] | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Fetch platform-enabled payment methods
  useEffect(() => {
    async function fetchEnabled() {
      try {
        const res = await fetch('/api/payment-methods')
        const data = await res.json()
        if (data.success && Array.isArray(data.methods)) {
          setEnabledMethods(data.methods as PaymentMethodId[])
        } else {
          setEnabledMethods([])
        }
      } catch {
        setEnabledMethods([])
      }
    }
    fetchEnabled()
  }, [])

  // Filter methods to only show enabled ones
  const availableMethods = useMemo(() => {
    if (!enabledMethods) return null // still loading
    if (enabledMethods.length === 0) return [] as PaymentMethodId[]
    return enabledMethods
  }, [enabledMethods])

  const popularMethods = useMemo(() => {
    if (!availableMethods) return []
    // Popular are the first ones in enabled list (already configured by admin)
    return availableMethods.filter((id) => PAYMENT_METHODS[id]?.popular)
  }, [availableMethods])

  const methodsByCategory = useMemo(() => {
    if (!availableMethods) return {}
    const groups: Record<string, PaymentMethodId[]> = {}
    for (const id of availableMethods) {
      const config = PAYMENT_METHODS[id]
      if (!config) continue
      if (!groups[config.category]) groups[config.category] = []
      groups[config.category].push(id)
    }
    return groups
  }, [availableMethods])

  const categoryOrder = useMemo(() => getPaymentCategoryOrder(), [])

  const filteredSearch = useMemo(() => {
    if (!search.trim() || !availableMethods) return []
    return searchPaymentMethods(search).filter((id) => availableMethods.includes(id))
  }, [search, availableMethods])

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

  const toggleMethod = (id: PaymentMethodId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const selectAll = () => {
    if (availableMethods) onChange([...availableMethods])
  }

  const clearAll = () => {
    onChange([])
  }

  // Loading state
  if (availableMethods === null) {
    return (
      <div className="min-h-[42px] flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading payment methods...</span>
      </div>
    )
  }

  // No methods enabled
  if (availableMethods.length === 0) {
    return (
      <div className="min-h-[42px] flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-3 py-2">
        <CreditCard className="h-4 w-4 text-amber-500" />
        <span className="text-sm text-amber-600 dark:text-amber-400">
          No payment methods configured yet. Contact admin.
        </span>
      </div>
    )
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
                className="h-6 text-xs text-amber-600 hover:text-amber-700"
                onClick={(e) => { e.stopPropagation(); selectAll() }}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-red-500 hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); clearAll() }}
              >
                Clear All
              </Button>
              <span className="text-xs text-gray-400 self-center ml-auto">
                {selected.length} selected · {availableMethods.length} available
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
                      onClick={(e) => { e.stopPropagation(); toggleMethod(id) }}
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
                {/* Grouped by category */}
                {categoryOrder.map((category) => {
                  const ids = methodsByCategory[category]
                  if (!ids?.length) return null
                  return (
                    <div key={category}>
                      <div className="px-3 pt-2 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{category}</span>
                      </div>
                      {ids.map((id) => {
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
                            onClick={(e) => { e.stopPropagation(); toggleMethod(id) }}
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
