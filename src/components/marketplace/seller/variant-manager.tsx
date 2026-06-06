'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Layers,
  Settings2,
  Save,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { ProductVariantOption, ProductVariant } from '@/types'

// ---- Internal Types ----

interface OptionGroup {
  name: string
  values: string[]
}

interface CombinationRow {
  id: string
  optionValues: Record<string, string> // optionName -> value
  priceAdjustment: number
  stock: number
  sku: string
}

interface VariantManagerProps {
  productId: string
  shopId: string
  existingOptions?: ProductVariantOption[]
  existingVariants?: ProductVariant[]
  basePrice: number
  onSave: () => void
}

// Generate a unique ID for combination rows
function generateRowId(optionValues: Record<string, string>): string {
  return Object.entries(optionValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|')
}

// Generate all permutations of option values
function generatePermutations(optionGroups: OptionGroup[]): Record<string, string>[] {
  if (optionGroups.length === 0) return []

  const results: Record<string, string>[] = []

  function backtrack(index: number, current: Record<string, string>) {
    if (index === optionGroups.length) {
      results.push({ ...current })
      return
    }
    const group = optionGroups[index]
    for (const value of group.values) {
      current[group.name] = value
      backtrack(index + 1, current)
    }
    delete current[group.name]
  }

  backtrack(0, {})
  return results
}

export function VariantManager({
  productId,
  shopId,
  existingOptions,
  existingVariants,
  basePrice,
  onSave,
}: VariantManagerProps) {
  const { currentUser } = useMarketplaceStore()
  const [saving, setSaving] = useState(false)

  // Step 1: Option Groups
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([])
  const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({})

  // Step 2: Generated combinations
  const [combinations, setCombinations] = useState<CombinationRow[]>([])
  const [combinationsGenerated, setCombinationsGenerated] = useState(false)

  // Initialize from existing data
  useEffect(() => {
    if (existingOptions && existingOptions.length > 0) {
      const groups: OptionGroup[] = existingOptions.map((opt) => ({
        name: opt.name,
        values: opt.values?.map((v) => v.value) || [],
      }))
      setOptionGroups(groups)

      // Also generate combinations from existing variants
      if (existingVariants && existingVariants.length > 0 && existingOptions.length > 0) {
        const rows: CombinationRow[] = existingVariants
          .filter((v) => v.isActive)
          .map((variant) => {
            const optionValues: Record<string, string> = {}
            if (variant.values) {
              variant.values.forEach((vv) => {
                const option = existingOptions.find((o) => o.id === vv.optionId)
                const value = option?.values?.find((v) => v.id === vv.valueId)
                if (option && value) {
                  optionValues[option.name] = value.value
                }
              })
            }
            return {
              id: generateRowId(optionValues),
              optionValues,
              priceAdjustment: variant.priceAdjustment,
              stock: variant.stock,
              sku: variant.sku || '',
            }
          })
        setCombinations(rows)
        setCombinationsGenerated(true)
      }
    }
  }, [existingOptions, existingVariants])

  // ---- Option Group Management ----

  const addOptionGroup = () => {
    setOptionGroups([...optionGroups, { name: '', values: [] }])
  }

  const removeOptionGroup = (index: number) => {
    setOptionGroups(optionGroups.filter((_, i) => i !== index))
    setCombinationsGenerated(false)
    setCombinations([])
  }

  const updateOptionName = (index: number, name: string) => {
    const updated = [...optionGroups]
    updated[index] = { ...updated[index], name }
    setOptionGroups(updated)
    setCombinationsGenerated(false)
  }

  const addValue = (groupIndex: number) => {
    const val = (newValueInputs[groupIndex] || '').trim()
    if (!val) return
    const updated = [...optionGroups]
    if (updated[groupIndex].values.includes(val)) {
      toast.error('Value already exists')
      return
    }
    updated[groupIndex] = {
      ...updated[groupIndex],
      values: [...updated[groupIndex].values, val],
    }
    setOptionGroups(updated)
    setNewValueInputs({ ...newValueInputs, [groupIndex]: '' })
    setCombinationsGenerated(false)
  }

  const removeValue = (groupIndex: number, valueIndex: number) => {
    const updated = [...optionGroups]
    updated[groupIndex] = {
      ...updated[groupIndex],
      values: updated[groupIndex].values.filter((_, i) => i !== valueIndex),
    }
    setOptionGroups(updated)
    setCombinationsGenerated(false)
  }

  // ---- Combination Generation ----

  const handleGenerateCombinations = () => {
    // Validate option groups
    const validGroups = optionGroups.filter((g) => g.name.trim() && g.values.length > 0)
    if (validGroups.length === 0) {
      toast.error('Please define at least one option with values')
      return
    }

    // Check for duplicate option names
    const names = validGroups.map((g) => g.name.trim().toLowerCase())
    const uniqueNames = new Set(names)
    if (uniqueNames.size !== names.length) {
      toast.error('Option names must be unique')
      return
    }

    const permutations = generatePermutations(validGroups)

    // Preserve existing combination data if any
    const existingMap = new Map<string, CombinationRow>()
    combinations.forEach((c) => existingMap.set(c.id, c))

    const rows: CombinationRow[] = permutations.map((perm) => {
      const id = generateRowId(perm)
      const existing = existingMap.get(id)
      return {
        id,
        optionValues: perm,
        priceAdjustment: existing?.priceAdjustment ?? 0,
        stock: existing?.stock ?? 0,
        sku: existing?.sku || '',
      }
    })

    setCombinations(rows)
    setCombinationsGenerated(true)
    toast.success(`Generated ${rows.length} combinations`)
  }

  // ---- Combination Editing ----

  const updateCombinationField = (
    rowId: string,
    field: 'priceAdjustment' | 'stock' | 'sku',
    value: string | number
  ) => {
    setCombinations((prev) =>
      prev.map((c) => (c.id === rowId ? { ...c, [field]: value } : c))
    )
  }

  const setAllStock = (stock: number) => {
    setCombinations((prev) => prev.map((c) => ({ ...c, stock })))
    toast.success(`Set all stock to ${stock}`)
  }

  const setAllPriceAdjustment = (adjustment: number) => {
    setCombinations((prev) => prev.map((c) => ({ ...c, priceAdjustment: adjustment })))
    toast.success(`Set all price adjustments to $${adjustment.toFixed(2)}`)
  }

  // ---- Save ----

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Please log in')
      return
    }

    const validGroups = optionGroups.filter((g) => g.name.trim() && g.values.length > 0)
    if (validGroups.length === 0) {
      toast.error('Please define at least one option with values')
      return
    }

    if (combinations.length === 0) {
      toast.error('Please generate combinations first')
      return
    }

    setSaving(true)
    try {
      // Build the payload
      const optionsPayload = validGroups.map((g) => ({
        name: g.name.trim(),
        values: g.values,
      }))

      const variantsPayload = combinations.map((c) => ({
        optionCombination: c.optionValues,
        priceAdjustment: c.priceAdjustment,
        stock: c.stock,
        sku: c.sku || undefined,
        price: basePrice + c.priceAdjustment,
      }))

      const res = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          options: optionsPayload,
          variants: variantsPayload,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Failed to save variants')
        return
      }

      toast.success('Variants saved successfully!')
      onSave()
    } catch (error) {
      console.error('Save variants error:', error)
      toast.error('Failed to save variants')
    } finally {
      setSaving(false)
    }
  }

  // ---- Computed ----

  const canGenerate = optionGroups.some((g) => g.name.trim() && g.values.length > 0)
  const canSave = combinationsGenerated && combinations.length > 0 && !saving

  const totalCombinations = useMemo(() => {
    const validGroups = optionGroups.filter((g) => g.name.trim() && g.values.length > 0)
    if (validGroups.length === 0) return 0
    return validGroups.reduce((acc, g) => acc * g.values.length, 1)
  }, [optionGroups])

  return (
    <div className="space-y-6">
      {/* Step 1: Define Options */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers size={18} className="text-amber-600" />
            Step 1 — Define Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {optionGroups.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Layers size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No options defined yet</p>
              <p className="text-xs">Add options like Size, Color, Material, etc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {optionGroups.map((group, gi) => (
                <motion.div
                  key={gi}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-gray-100 p-4 bg-gray-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1">Option Name</Label>
                      <Input
                        placeholder="e.g. Size, Color, Material..."
                        value={group.name}
                        onChange={(e) => updateOptionName(gi, e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 mt-5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeOptionGroup(gi)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Values as pills */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Values</Label>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((val, vi) => (
                        <Badge
                          key={vi}
                          variant="outline"
                          className="px-3 py-1 text-sm bg-white border-amber-200 text-amber-700 gap-1.5"
                        >
                          {val}
                          <button
                            onClick={() => removeValue(gi, vi)}
                            className="ml-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    {/* Add value input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a value..."
                        value={newValueInputs[gi] || ''}
                        onChange={(e) =>
                          setNewValueInputs({ ...newValueInputs, [gi]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addValue(gi)
                          }
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => addValue(gi)}
                        disabled={!(newValueInputs[gi] || '').trim()}
                      >
                        <Plus size={14} />
                        Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full gap-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400"
            onClick={addOptionGroup}
          >
            <Plus size={16} />
            Add Option
          </Button>

          {totalCombinations > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Will generate <span className="font-semibold">{totalCombinations}</span> combinations
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Generate & Edit Combinations */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 size={18} className="text-amber-600" />
            Step 2 — Generate & Edit Combinations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!combinationsGenerated ? (
            <div className="text-center py-6">
              <Button
                className="gap-2 bg-amber-600 hover:bg-amber-700"
                onClick={handleGenerateCombinations}
                disabled={!canGenerate}
              >
                <Settings2 size={16} />
                Generate Combinations
              </Button>
              {!canGenerate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Add at least one option with values to generate combinations
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setAllStock(10)}
                >
                  Set all stock to 10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setAllPriceAdjustment(0)}
                >
                  Set all price adj. to $0
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={handleGenerateCombinations}
                >
                  Regenerate
                </Button>
              </div>

              {/* Combinations Table */}
              <div className="max-h-96 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {optionGroups
                        .filter((g) => g.name.trim())
                        .map((g, i) => (
                          <TableHead key={i} className="text-xs">
                            {g.name}
                          </TableHead>
                        ))}
                      <TableHead className="text-xs">Price Adj. ($)</TableHead>
                      <TableHead className="text-xs">Stock</TableHead>
                      <TableHead className="text-xs">SKU</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinations.map((row) => (
                      <TableRow key={row.id}>
                        {optionGroups
                          .filter((g) => g.name.trim())
                          .map((g, i) => (
                            <TableCell key={i} className="text-sm">
                              <Badge variant="outline" className="text-xs">
                                {row.optionValues[g.name] || '-'}
                              </Badge>
                            </TableCell>
                          ))}
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={row.priceAdjustment}
                            onChange={(e) =>
                              updateCombinationField(
                                row.id,
                                'priceAdjustment',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-7 w-20 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={row.stock}
                            onChange={(e) =>
                              updateCombinationField(
                                row.id,
                                'stock',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-7 w-16 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.sku}
                            onChange={(e) =>
                              updateCombinationField(row.id, 'sku', e.target.value)
                            }
                            placeholder="SKU"
                            className="h-7 w-24 text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground">
                {combinations.length} combination{combinations.length !== 1 ? 's' : ''} • Base price: ${basePrice.toFixed(2)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          className="gap-2 bg-amber-600 hover:bg-amber-700 min-w-[140px]"
          onClick={handleSave}
          disabled={!canSave}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Variants
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
