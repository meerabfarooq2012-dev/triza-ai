'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, ChevronDown, Check, Search, CreditCard, Loader2, Clock, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PAYMENT_METHODS,
  type PaymentMethodId,
  getPaymentMethodsByCategory,
  getPaymentCategoryOrder,
  searchPaymentMethods,
  isPaymentMethodActive,
} from '@/lib/payment-methods'

interface PaymentMethodMultiSelectProps {
  selected: PaymentMethodId[]
  onChange: (methods: PaymentMethodId[]) => void
}

export function PaymentMethodMultiSelect({ selected, onChange }: PaymentMethodMultiSelectProps) {
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // All active payment methods (always available regardless of admin config)
  const activeMethods = useMemo(() => {
    return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, typeof PAYMENT_METHODS[PaymentMethodId]][])
      .filter(([, config]) => config.active)
      .map(([id]) => id)
  }, [])

  // Coming soon methods
  const comingSoonMethods = useMemo(() => {
    return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, typeof PAYMENT_METHODS[PaymentMethodId]][])
      .filter(([, config]) => !config.active)
      .map(([id]) => id)
  }, [])

  const activeByCategory = useMemo(() => {
    const groups: Record<string, PaymentMethodId[]> = {}
    for (const id of activeMethods) {
      const config = PAYMENT_METHODS[id]
      if (!config) continue
      if (!groups[config.category]) groups[config.category] = []
      groups[config.category].push(id)
    }
    return groups
  }, [activeMethods])

  const comingSoonByCategory = useMemo(() => {
    const groups: Record<string, PaymentMethodId[]> = {}
    for (const id of comingSoonMethods) {
      const config = PAYMENT_METHODS[id]
      if (!config) continue
      if (!groups[config.category]) groups[config.category] = []
      groups[config.category].push(id)
    }
    return groups
  }, [comingSoonMethods])

  const categoryOrder = useMemo(() => getPaymentCategoryOrder(), [])

  const filteredActiveSearch = useMemo(() => {
    if (!search.trim()) return []
    return searchPaymentMethods(search).filter((id) => activeMethods.includes(id))
  }, [search, activeMethods])

  const filteredComingSoonSearch = useMemo(() => {
    if (!search.trim()) return []
    return searchPaymentMethods(search).filter((id) => comingSoonMethods.includes(id))
  }, [search, comingSoonMethods])

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
    if (!isPaymentMethodActive(id)) return // Cannot select coming soon
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const selectAll = () => {
    onChange([...activeMethods])
  }

  const clearAll = () => {
    onChange([])
  }

  // Remove any coming-soon methods that somehow got selected
  const validSelected = useMemo(() => {
    return selected.filter((id) => isPaymentMethodActive(id))
  }, [selected])

  // Render a payment method row
  const renderMethodRow = (id: PaymentMethodId, isComingSoon: boolean) => {
    const config = PAYMENT_METHODS[id]
    if (!config) return null
    const isSelected = validSelected.includes(id)

    if (isComingSoon) {
      return (
        <div
          key={id}
          className="flex items-center gap-2 px-3 py-1.5 text-left text-sm opacity-50 cursor-not-allowed"
          title={config.reason || 'Coming Soon'}
        >
          <span className="flex-shrink-0">
            <Lock className="h-3.5 w-3.5 text-gray-400" />
          </span>
          <span className="text-sm">{config.icon}</span>
          <span className="text-gray-400 dark:text-gray-500 line-through decoration-gray-300">
            {config.name}
          </span>
          <Badge
            variant="outline"
            className="ml-auto text-[9px] h-4 px-1 bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-500 dark:border-amber-800"
          >
            <Clock className="h-2.5 w-2.5 mr-0.5" />
            Soon
          </Badge>
        </div>
      )
    }

    return (
      <button
        key={id}
        type="button"
        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors ${
          isSelected ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
        }`}
        onClick={(e) => { e.stopPropagation(); toggleMethod(id) }}
      >
        <span className="flex-shrink-0">
          {isSelected ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <span className="inline-block h-3.5 w-3.5 rounded border border-gray-300" />
          )}
        </span>
        <span className="text-sm">{config.icon}</span>
        <span className={isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}>
          {config.name}
        </span>
        <span className="ml-auto text-[10px] text-gray-400 hidden sm:inline">{config.description}</span>
      </button>
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
        {validSelected.length === 0 ? (
          <span className="text-sm text-gray-400 select-none flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" />
            Select payment methods you accept...
          </span>
        ) : (
          validSelected.slice(0, 5).map((id) => {
            const config = PAYMENT_METHODS[id]
            return (
              <Badge
                key={id}
                variant="outline"
                className="gap-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              >
                <span className="text-sm">{config?.icon}</span>
                <span>{config?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMethod(id)
                  }}
                  className="ml-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })
        )}
        {validSelected.length > 5 && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
            +{validSelected.length - 5} more
          </Badge>
        )}
        <ChevronDown className="ml-auto h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-96 overflow-hidden">
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
            <div className="mt-1.5 flex gap-2 flex-wrap items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-emerald-600 hover:text-emerald-700"
                onClick={(e) => { e.stopPropagation(); selectAll() }}
              >
                Select All Active
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
                {validSelected.length} selected · {activeMethods.length} active · {comingSoonMethods.length} coming soon
              </span>
            </div>
          </div>

          {/* Active payment methods */}
          <div className="max-h-64 overflow-y-auto">
            {search.trim() ? (
              <>
                {filteredActiveSearch.length > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">✓ Available Now</span>
                    </div>
                    {filteredActiveSearch.map((id) => renderMethodRow(id, false))}
                  </div>
                )}
                {filteredComingSoonSearch.length > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">🕐 Coming Soon</span>
                    </div>
                    {filteredComingSoonSearch.map((id) => renderMethodRow(id, true))}
                  </div>
                )}
                {filteredActiveSearch.length === 0 && filteredComingSoonSearch.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-gray-400">
                    No payment method found
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Active methods by category */}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">✓ Available Now</span>
                </div>
                {categoryOrder.map((category) => {
                  const ids = activeByCategory[category]
                  if (!ids?.length) return null
                  return (
                    <div key={category}>
                      <div className="px-3 pt-1 pb-0.5">
                        <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">{category}</span>
                      </div>
                      {ids.map((id) => renderMethodRow(id, false))}
                    </div>
                  )
                })}

                {/* Coming Soon toggle */}
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowComingSoon(!showComingSoon) }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {showComingSoon ? 'Hide' : 'Show'} Coming Soon ({comingSoonMethods.length} methods)
                    <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${showComingSoon ? 'rotate-180' : ''}`} />
                  </button>
                  {showComingSoon && (
                    <>
                      {categoryOrder.map((category) => {
                        const ids = comingSoonByCategory[category]
                        if (!ids?.length) return null
                        return (
                          <div key={category}>
                            <div className="px-3 pt-1 pb-0.5">
                              <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">{category}</span>
                            </div>
                            {ids.map((id) => renderMethodRow(id, true))}
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
