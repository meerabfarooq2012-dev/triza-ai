'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  Truck,
  Percent,
  FileText,
  Loader2,
  Info,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { ReturnPolicy, RefundMethod, ReturnShippingPaidBy } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReturnPolicyPageProps {
  shopId: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REFUND_METHOD_OPTIONS: { value: RefundMethod; label: string; icon: typeof CreditCard; description: string }[] = [
  { value: 'original', label: 'Original Payment', icon: CreditCard, description: 'Refund to the original payment method' },
  { value: 'wallet', label: 'Wallet Credit', icon: Wallet, description: 'Add funds to buyer\'s wallet' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Banknote, description: 'Transfer to buyer\'s bank account' },
]

const SHIPPING_PAID_BY_OPTIONS: { value: ReturnShippingPaidBy; label: string; description: string }[] = [
  { value: 'buyer', label: 'Buyer Pays', description: 'Customer covers return shipping' },
  { value: 'seller', label: 'Seller Pays', description: 'You cover return shipping costs' },
  { value: 'split', label: 'Split 50/50', description: 'Shipping costs split equally' },
]

// ---------------------------------------------------------------------------
// Default Policy
// ---------------------------------------------------------------------------

const DEFAULT_POLICY: Omit<ReturnPolicy, 'id' | 'createdAt' | 'updatedAt'> = {
  shopId: '',
  acceptsReturns: true,
  returnPeriodDays: 14,
  acceptsExchanges: true,
  refundMethods: ['original'],
  returnShippingPaidBy: 'buyer',
  restockingFee: 0,
  description: null,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReturnPolicyPage({ shopId }: ReturnPolicyPageProps) {
  const [policy, setPolicy] = useState<ReturnPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [acceptsReturns, setAcceptsReturns] = useState(true)
  const [returnPeriodDays, setReturnPeriodDays] = useState(14)
  const [acceptsExchanges, setAcceptsExchanges] = useState(true)
  const [refundMethods, setRefundMethods] = useState<RefundMethod[]>(['original'])
  const [returnShippingPaidBy, setReturnShippingPaidBy] = useState<ReturnShippingPaidBy>('buyer')
  const [restockingFee, setRestockingFee] = useState(0)
  const [description, setDescription] = useState('')

  // Fetch policy
  const fetchPolicy = useCallback(async () => {
    if (!shopId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/returns/policy?shopId=${shopId}`)
      const json = await res.json()
      if (json.success && json.data) {
        const p = json.data
        setPolicy(p)
        setAcceptsReturns(p.acceptsReturns)
        setReturnPeriodDays(p.returnPeriodDays)
        setAcceptsExchanges(p.acceptsExchanges)
        setRefundMethods(p.refundMethods || ['original'])
        setReturnShippingPaidBy(p.returnShippingPaidBy)
        setRestockingFee(p.restockingFee || 0)
        setDescription(p.description || '')
      }
    } catch {
      setError('Failed to load return policy')
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    fetchPolicy()
  }, [fetchPolicy])

  // Toggle refund method
  const toggleRefundMethod = (method: RefundMethod) => {
    setRefundMethods((prev) => {
      if (prev.includes(method)) {
        if (prev.length === 1) {
          toast.error('At least one refund method is required')
          return prev
        }
        return prev.filter((m) => m !== method)
      }
      return [...prev, method]
    })
  }

  // Save policy
  const handleSave = async () => {
    if (!shopId) {
      toast.error('Shop ID is required')
      return
    }
    if (refundMethods.length === 0) {
      toast.error('At least one refund method is required')
      return
    }
    if (restockingFee < 0 || restockingFee > 50) {
      toast.error('Restocking fee must be between 0% and 50%')
      return
    }
    if (returnPeriodDays < 1 || returnPeriodDays > 30) {
      toast.error('Return period must be between 1 and 30 days')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/returns/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          acceptsReturns,
          returnPeriodDays,
          acceptsExchanges,
          refundMethods,
          returnShippingPaidBy,
          restockingFee,
          description: description.trim() || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Return policy saved successfully!')
        fetchPolicy()
      } else {
        toast.error(json.error || 'Failed to save return policy')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-56" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
              Return Policy Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure how returns and refunds work for your shop
            </p>
          </div>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 w-fit"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save Policy
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          {/* Accept Returns */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                      <RotateCcw className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Accept Returns</p>
                      <p className="text-xs text-muted-foreground">Allow buyers to return items</p>
                    </div>
                  </div>
                  <Switch
                    checked={acceptsReturns}
                    onCheckedChange={setAcceptsReturns}
                  />
                </div>

                {acceptsReturns && (
                  <>
                    <Separator />

                    {/* Return Period */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <Label className="text-sm font-semibold">Return Period</Label>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[returnPeriodDays]}
                          onValueChange={(v) => setReturnPeriodDays(v[0])}
                          min={1}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">1 day</span>
                          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                            {returnPeriodDays} day{returnPeriodDays !== 1 ? 's' : ''}
                          </Badge>
                          <span className="text-xs text-muted-foreground">30 days</span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-amber-700">
                          Buyers have {returnPeriodDays} days from delivery to request a return.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Accept Exchanges */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Accept Exchanges</p>
                        <p className="text-xs text-muted-foreground">Allow buyers to request item exchanges</p>
                      </div>
                      <Switch
                        checked={acceptsExchanges}
                        onCheckedChange={setAcceptsExchanges}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Refund Methods */}
          {acceptsReturns && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                    <Label className="text-sm font-semibold">Refund Methods</Label>
                  </div>

                  <div className="space-y-2">
                    {REFUND_METHOD_OPTIONS.map((opt) => {
                      const Icon = opt.icon
                      const checked = refundMethods.includes(opt.value)
                      return (
                        <div
                          key={opt.value}
                          className={`flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                            checked
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-border hover:border-amber-300'
                          }`}
                          onClick={() => toggleRefundMethod(opt.value)}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleRefundMethod(opt.value)}
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{opt.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Shipping & Restocking */}
          {acceptsReturns && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6 space-y-5">
                  {/* Return Shipping Paid By */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-amber-600" />
                      <Label className="text-sm font-semibold">Return Shipping Paid By</Label>
                    </div>
                    <RadioGroup
                      value={returnShippingPaidBy}
                      onValueChange={(v) => setReturnShippingPaidBy(v as ReturnShippingPaidBy)}
                      className="space-y-2"
                    >
                      {SHIPPING_PAID_BY_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          className={`flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                            returnShippingPaidBy === opt.value
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-border hover:border-amber-300'
                          }`}
                          onClick={() => setReturnShippingPaidBy(opt.value)}
                        >
                          <RadioGroupItem
                            value={opt.value}
                            className="data-[state=checked]:text-amber-600 mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Restocking Fee */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-amber-600" />
                      <Label className="text-sm font-semibold">Restocking Fee</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        value={restockingFee}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setRestockingFee(Math.min(50, Math.max(0, val)))
                        }}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A fee deducted from the refund for returned items. Set to 0% for no fee.
                    </p>
                    {restockingFee > 0 && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-amber-700">
                          A {restockingFee}% restocking fee will be deducted from all refunds. Higher fees may discourage buyers.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Custom Description */}
          {acceptsReturns && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <Label className="text-sm font-semibold">Custom Policy Description</Label>
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any additional return policy details that buyers should know..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Optional: Add custom terms, conditions, or instructions for returns
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Returns disabled notice */}
          {!acceptsReturns && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-700">Returns Disabled</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Buyers will not be able to request returns or exchanges from your shop.
                        Enable returns to configure your return policy settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-0 shadow-sm sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-600" />
                  Buyer Preview
                </CardTitle>
                <CardDescription>
                  This is how your return policy appears to buyers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                    <h4 className="font-semibold">Return Policy</h4>
                  </div>

                  {acceptsReturns ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-sm">
                            Returns accepted within <strong>{returnPeriodDays} day{returnPeriodDays !== 1 ? 's' : ''}</strong> of delivery
                          </span>
                        </div>

                        {acceptsExchanges && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                            <span className="text-sm">Exchanges accepted</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-sm">
                            Refund via {refundMethods.map((m) => REFUND_METHOD_OPTIONS.find((o) => o.value === m)?.label).join(', ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">
                            Return shipping:{' '}
                            {returnShippingPaidBy === 'buyer' && 'Paid by buyer'}
                            {returnShippingPaidBy === 'seller' && 'Paid by seller'}
                            {returnShippingPaidBy === 'split' && 'Split 50/50'}
                          </span>
                        </div>

                        {restockingFee > 0 && (
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-amber-500 shrink-0" />
                            <span className="text-sm">
                              <strong>{restockingFee}%</strong> restocking fee applies
                            </span>
                          </div>
                        )}
                      </div>

                      {description && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Additional Terms</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{description}</p>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        This shop does not accept returns or exchanges. All sales are final.
                      </span>
                    </div>
                  )}
                </div>

                {/* Info notes */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-700">
                    {acceptsReturns
                      ? 'Your return policy is clearly displayed on your shop page and product listings.'
                      : 'Enabling returns can increase buyer confidence and improve sales.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Save button at bottom for mobile */}
      <div className="lg:hidden sticky bottom-4 z-10">
        <Button
          className="w-full bg-amber-600 hover:bg-amber-700 shadow-lg"
          onClick={handleSave}
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          Save Return Policy
        </Button>
      </div>
    </div>
  )
}


