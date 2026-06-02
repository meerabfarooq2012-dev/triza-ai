'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Check, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProductVariantOption, ProductVariant } from '@/types'

interface VariantSelectorProps {
  variantOptions: ProductVariantOption[]
  variants: ProductVariant[]
  basePrice: number
  onVariantChange: (selected: {
    variantId: string | null
    price: number
    stock: number
    image: string | null
    label: string
    sku: string | null
  }) => void
}

export function VariantSelector({
  variantOptions,
  variants,
  basePrice,
  onVariantChange,
}: VariantSelectorProps) {
  // Track selected value for each option (optionId -> valueId)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Pre-compute unavailable combinations for each option+value pair
  const unavailableMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    variantOptions.forEach((option) => {
      option.values?.forEach((value) => {
        const testSelection = { ...selectedOptions, [option.id]: value.id }
        const allSel = variantOptions.every(
          (opt) => testSelection[opt.id] !== undefined
        )
        if (!allSel) {
          map[`${option.id}-${value.id}`] = false
          return
        }
        map[`${option.id}-${value.id}`] = !variants.some((variant) => {
          if (!variant.isActive || !variant.values) return false
          return variantOptions.every((opt) => {
            const selVal = testSelection[opt.id]
            return variant.values!.some(
              (v) => v.optionId === opt.id && v.valueId === selVal
            )
          })
        })
      })
    })
    return map
  }, [selectedOptions, variantOptions, variants])

  // Find the matching variant based on selected options
  const matchedVariant = useMemo(() => {
    if (variantOptions.length === 0) return null
    // Check if all options have a selected value
    const allSelected = variantOptions.every(
      (opt) => selectedOptions[opt.id] !== undefined
    )
    if (!allSelected) return null

    // Find a variant whose values match all selected options
    return variants.find((variant) => {
      if (!variant.values || variant.values.length === 0) return false
      if (!variant.isActive) return false

      return variantOptions.every((opt) => {
        const selectedValueId = selectedOptions[opt.id]
        if (!selectedValueId) return false
        return variant.values!.some(
          (v) => v.optionId === opt.id && v.valueId === selectedValueId
        )
      })
    }) || null
  }, [selectedOptions, variantOptions, variants])

  // Determine if all options are selected but no matching variant found
  const allOptionsSelected = variantOptions.every(
    (opt) => selectedOptions[opt.id] !== undefined
  )
  const combinationNotFound = allOptionsSelected && !matchedVariant

  // Calculate effective price
  const effectivePrice = matchedVariant
    ? matchedVariant.price
    : basePrice

  const priceAdjustment = matchedVariant
    ? matchedVariant.priceAdjustment
    : 0

  // Get variant image
  const variantImage = useMemo(() => {
    if (!matchedVariant) return null
    try {
      const imgs = JSON.parse(matchedVariant.images || '[]')
      return imgs.length > 0 ? imgs[0] : null
    } catch {
      return null
    }
  }, [matchedVariant])

  // Get label for selected variant
  const variantLabel = useMemo(() => {
    if (!matchedVariant) return ''
    const parts: string[] = []
    variantOptions.forEach((opt) => {
      const selectedValueId = selectedOptions[opt.id]
      if (selectedValueId && opt.values) {
        const value = opt.values.find((v) => v.id === selectedValueId)
        if (value) parts.push(value.value)
      }
    })
    return parts.join(' / ')
  }, [matchedVariant, selectedOptions, variantOptions])

  // Notify parent of variant changes
  useEffect(() => {
    if (matchedVariant) {
      onVariantChange({
        variantId: matchedVariant.id,
        price: effectivePrice,
        stock: matchedVariant.stock,
        image: variantImage,
        label: variantLabel,
        sku: matchedVariant.sku,
      })
    } else {
      onVariantChange({
        variantId: null,
        price: basePrice,
        stock: 0,
        image: null,
        label: '',
        sku: null,
      })
    }
  }, [matchedVariant, effectivePrice, variantImage, variantLabel, basePrice, onVariantChange])

  const handleSelectValue = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: prev[optionId] === valueId ? '' : valueId,
    }))
  }

  if (variantOptions.length === 0) return null

  return (
    <div className="space-y-4">
      {variantOptions.map((option) => {
        const selectedValueId = selectedOptions[option.id]
        const selectedValue = option.values?.find((v) => v.id === selectedValueId)

        return (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {option.name}:
              </span>
              {selectedValue && (
                <span className="text-sm text-emerald-600 font-medium">
                  {selectedValue.value}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {option.values
                ?.sort((a, b) => a.sortOrder - b.sortOrder)
                .map((value) => {
                  const isSelected = selectedValueId === value.id
                  const wouldBeUnavailable = unavailableMap[`${option.id}-${value.id}`] ?? false

                  return (
                    <motion.div
                      key={value.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className={`
                          rounded-full px-4 h-8 text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700'
                            : wouldBeUnavailable
                              ? 'opacity-40 cursor-not-allowed border-dashed'
                              : 'hover:border-emerald-300 hover:text-emerald-700'
                          }
                        `}
                        onClick={() => handleSelectValue(option.id, value.id)}
                        disabled={wouldBeUnavailable && !isSelected}
                      >
                        {isSelected && <Check size={14} className="mr-1" />}
                        {value.value}
                      </Button>
                    </motion.div>
                  )
                })}
            </div>
          </div>
        )
      })}

      {/* Price Display */}
      <AnimatePresence mode="wait">
        {matchedVariant ? (
          <motion.div
            key="variant-price"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Base:</span>
              <span className="font-medium">${basePrice.toFixed(2)}</span>
              {priceAdjustment !== 0 && (
                <>
                  <span className="text-muted-foreground">+</span>
                  <span className={priceAdjustment > 0 ? 'text-emerald-600' : 'text-red-500'}>
                    {priceAdjustment > 0 ? '+' : ''}${priceAdjustment.toFixed(2)} adjustment
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>Total:</span>
              <span className="text-lg text-emerald-600">${effectivePrice.toFixed(2)}</span>
            </div>
          </motion.div>
        ) : !allOptionsSelected ? (
          <motion.div
            key="select-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Package size={14} />
            <span>Select options to see price</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Stock Status */}
      {matchedVariant && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          {matchedVariant.stock > 0 ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {matchedVariant.stock} in stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Out of stock
            </Badge>
          )}
          {matchedVariant.sku && (
            <span className="text-xs text-muted-foreground">
              SKU: {matchedVariant.sku}
            </span>
          )}
        </motion.div>
      )}

      {/* Combination not available */}
      <AnimatePresence>
        {combinationNotFound && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>This combination is not available</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
