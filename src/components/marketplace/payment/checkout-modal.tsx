'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Loader2,
  Wallet,
  Globe,
  Info,
  ShoppingCart,
  Building2,
  Mail,
  Star,
  Ticket,
  X,
  Tag,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import { PLATFORM_FEE_PERCENT } from '@/lib/constants'
import type { PaymentMethod, PaymentInfo, PaymentInfoAccountDetails, Coupon, ApplyCouponResult } from '@/types'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAYMENT_METHODS: {
  id: PaymentMethod
  name: string
  region: string
  flag: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}[] = [
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    region: 'Local',
    flag: '🇵🇰',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200 data-[state=checked]:border-emerald-500',
    description: 'Mobile wallet payment',
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    region: 'Local',
    flag: '🇵🇰',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200 data-[state=checked]:border-red-500',
    description: 'Mobile wallet payment',
  },
  {
    id: 'card',
    name: 'Debit / Credit Card',
    region: 'International',
    flag: '💳',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200 data-[state=checked]:border-amber-500',
    description: 'Visa, Mastercard, UnionPay',
  },
  {
    id: 'payoneer',
    name: 'Payoneer',
    region: 'International',
    flag: '🌍',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 data-[state=checked]:border-blue-500',
    description: 'Global payment platform',
  },
  {
    id: 'wise',
    name: 'Wise',
    region: 'International',
    flag: '🌍',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200 data-[state=checked]:border-teal-500',
    description: 'International transfer',
  },
]

// Commission percent is now imported from constants

type CheckoutStep = 'summary' | 'payment' | 'payment_details' | 'shipping' | 'processing' | 'gateway_redirect' | 'success'

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { cart, cartTotal, currentUser, clearCart } = useMarketplaceStore()
  const [step, setStep] = useState<CheckoutStep>('summary')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easypaisa')
  const [shippingInfo, setShippingInfo] = useState({
    name: currentUser?.name || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'PK',
    phone: currentUser?.phone || '',
  })
  const [shippingMethod, setShippingMethod] = useState<string>('standard')
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [orderId, setOrderId] = useState<string>('')
  const [paymentId, setPaymentId] = useState<string>('')
  const [paymentAuthConfirmed, setPaymentAuthConfirmed] = useState(false)

  // Gateway redirect state
  const [gatewayRedirectUrl, setGatewayRedirectUrl] = useState<string>('')
  const [gatewayMode, setGatewayMode] = useState<string>('')
  const [paymentToken, setPaymentToken] = useState<string>('')
  const [pollingPayment, setPollingPayment] = useState(false)

  // Payment details state
  const [accountName, setAccountName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cardType, setCardType] = useState<'visa' | 'master' | 'unionpay'>('visa')
  const [payEmail, setPayEmail] = useState('')
  const [wiseIban, setWiseIban] = useState('')
  const [savePaymentInfo, setSavePaymentInfo] = useState(true)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discountAmount: number; freeShipping: boolean } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Saved payment methods
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentInfo[]>([])
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState<string | null>(null)
  const [useSavedMethod, setUseSavedMethod] = useState(false)

  // Fetch saved buyer payment methods
  const fetchSavedMethods = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/payment-info?userId=${currentUser.id}&type=buyer`)
      const json = await res.json()
      if (json.success) {
        setSavedPaymentMethods(json.data ?? [])
      }
    } catch {
      // Non-critical
    }
  }, [currentUser])

  useEffect(() => {
    fetchSavedMethods()
  }, [fetchSavedMethods])

  // When a saved method is selected, populate the fields
  const handleSelectSavedMethod = (pm: PaymentInfo) => {
    setSelectedSavedMethodId(pm.id)
    setUseSavedMethod(true)
    setPaymentMethod(pm.method as PaymentMethod)
    const details = typeof pm.accountDetails === 'string'
      ? JSON.parse(pm.accountDetails)
      : pm.accountDetails
    // Pre-fill fields from saved method
    setAccountName(details.accountName || '')
    setMobileNumber(details.mobileNumber || '')
    setCardHolder(details.cardHolder || '')
    setCardNumber('') // Never pre-fill card number for security
    setExpiryMonth(details.expiryMonth || '')
    setExpiryYear(details.expiryYear || '')
    setCardType(details.cardType || 'visa')
    setPayEmail(details.email || '')
    setWiseIban(details.iban || '')
  }

  const handleUseNewMethod = () => {
    setSelectedSavedMethodId(null)
    setUseSavedMethod(false)
    setAccountName('')
    setMobileNumber('')
    setCardHolder('')
    setCardNumber('')
    setExpiryMonth('')
    setExpiryYear('')
    setCardType('visa')
    setPayEmail('')
    setWiseIban('')
  }

  const hasPhysicalItems = cart.some((item) => item.type === 'physical')
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const effectiveCartTotal = Math.max(0, (cartTotal ?? 0) - couponDiscount)
  const platformFee = effectiveCartTotal * (PLATFORM_FEE_PERCENT / 100)
  const sellerPayout = effectiveCartTotal - platformFee

  // Apply coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      // Get the shopId from cart items
      const shopId = cart[0]?.shopId
      if (!shopId) {
        setCouponError('No shop found in cart')
        return
      }
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          shopId,
          userId: currentUser?.id,
          cartTotal: cartTotal ?? 0,
          items: cart.map(item => ({
            productId: item.productId,
            type: item.type,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (data.success && data.data?.valid) {
        setAppliedCoupon({
          coupon: data.data.coupon,
          discountAmount: data.data.discountAmount,
          freeShipping: data.data.freeShipping || false,
        })
        toast.success(`Coupon applied! You save $${data.data.discountAmount.toFixed(2)}${data.data.freeShipping ? ' + Free Shipping' : ''}`)
      } else {
        setCouponError(data.data?.message || data.error || 'Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch {
      setCouponError('Failed to validate coupon')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    toast.info('Coupon removed')
  }

  const resetState = () => {
    setStep('summary')
    setPaymentMethod('easypaisa')
    setShippingInfo({
      name: currentUser?.name || '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'PK',
      phone: currentUser?.phone || '',
    })
    setShippingMethod('standard')
    setShippingCost(0)
    setOrderId('')
    setPaymentId('')
    setPaymentAuthConfirmed(false)
    setGatewayRedirectUrl('')
    setGatewayMode('')
    setPaymentToken('')
    setPollingPayment(false)
    setAccountName('')
    setMobileNumber('')
    setCardHolder('')
    setCardNumber('')
    setExpiryMonth('')
    setExpiryYear('')
    setCardType('visa')
    setPayEmail('')
    setWiseIban('')
    setSavePaymentInfo(true)
    setSelectedSavedMethodId(null)
    setUseSavedMethod(false)
    setCouponCode('')
    setAppliedCoupon(null)
    setCouponError('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState()
    }
    onOpenChange(newOpen)
  }

  const handlePayNow = async () => {
    if (!currentUser) {
      toast.error('Please log in to checkout')
      return
    }

    // Validate shipping for physical products
    if (hasPhysicalItems) {
      if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
        toast.error('Please fill in all shipping details')
        return
      }
    }

    setStep('processing')

    try {
      // Save payment info if checkbox is checked
      if (savePaymentInfo && currentUser) {
        try {
          const details: Record<string, string> = {}
          if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
            details.accountName = accountName
            details.mobileNumber = mobileNumber
          } else if (paymentMethod === 'card') {
            details.cardHolder = cardHolder
            details.cardLast4 = cardNumber.replace(/\s/g, '').slice(-4)
            details.expiryMonth = expiryMonth
            details.expiryYear = expiryYear
            details.cardType = cardType
          } else if (paymentMethod === 'payoneer') {
            details.email = payEmail
            details.accountName = accountName
          } else if (paymentMethod === 'wise') {
            details.email = payEmail
            details.iban = wiseIban
            details.accountName = accountName
          }

          await fetch('/api/payment-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              type: 'buyer',
              method: paymentMethod,
              label: `My ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod}`,
              accountDetails: details,
              isDefault: false,
            }),
          })
        } catch {
          // Non-critical — don't block checkout if saving fails
        }
      }

      // Step 1: Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || undefined,
            variantLabel: item.variantLabel || undefined,
            variantSku: item.variantSku || undefined,
          })),
          paymentMethod,
          shippingName: shippingInfo.name || undefined,
          shippingAddr: shippingInfo.address || undefined,
          shippingCity: shippingInfo.city || undefined,
          shippingState: shippingInfo.state || undefined,
          shippingZip: shippingInfo.zip || undefined,
          shippingCountry: shippingInfo.country || undefined,
          shippingPhone: shippingInfo.phone || undefined,
          shippingMethod: hasPhysicalItems ? shippingMethod : undefined,
          shippingCost: hasPhysicalItems ? shippingCost : undefined,
          couponCode: appliedCoupon?.coupon.code || undefined,
          discountAmount: appliedCoupon?.discountAmount || undefined,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      const createdOrderId = orderData.data?.id || orderData.data?.order?.id || ''
      setOrderId(createdOrderId)

      // Redeem coupon after order is created
      if (appliedCoupon && createdOrderId) {
        try {
          await fetch('/api/coupons/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couponId: appliedCoupon.coupon.id,
              userId: currentUser.id,
              orderId: createdOrderId,
              discountAmount: appliedCoupon.discountAmount,
            }),
          })
        } catch {
          // Non-critical - coupon redemption failure shouldn't block checkout
        }
      }

      // Find the sellerId from the cart items
      const sellerId = cart[0]?.shopId || ''

      // Step 2: Create payment record (escrow hold)
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrderId,
          buyerId: currentUser.id,
          sellerId,
          paymentMethod,
          amount: effectiveCartTotal,
        }),
      })

      const paymentData = await paymentRes.json()
      if (!paymentData.success) {
        throw new Error(paymentData.error || 'Failed to process payment')
      }

      const createdPaymentId = paymentData.data?.id || ''
      setPaymentId(createdPaymentId)

      // Step 3: For Easypaisa/JazzCash, redirect to payment gateway
      if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
        try {
          const initiateRes = await fetch('/api/payments/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: createdOrderId,
              paymentMethod,
              buyerId: currentUser.id,
              amount: cartTotal,
            }),
          })

          const initiateData = await initiateRes.json()

          if (initiateData.success && initiateData.data?.redirectUrl) {
            setGatewayRedirectUrl(initiateData.data.redirectUrl)
            setGatewayMode(initiateData.data.gatewayMode || 'sandbox')
            setPaymentToken(initiateData.data.paymentToken || '')
            setStep('gateway_redirect')

            // Start polling for payment status
            pollPaymentStatus(createdPaymentId)
            return
          }
          // If gateway initiation fails, fall through to verify flow
          console.warn('Gateway initiation failed, using direct verification')
        } catch (err) {
          console.warn('Gateway initiation error, using direct verification:', err)
        }
      }

      // Step 4: For card/payoneer/wise, verify payment with token
      const metadata = paymentData.data?.metadata
      let verificationToken = ''
      try {
        const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
        verificationToken = parsed?.verificationToken || ''
      } catch {
        verificationToken = ''
      }

      if (verificationToken && createdPaymentId) {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: createdPaymentId,
            verificationToken,
            buyerId: currentUser.id,
          }),
        })

        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
          console.warn('Payment verification failed:', verifyData.error)
        }
      }

      clearCart()
      setStep('success')
      toast.success('Payment successful!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      toast.error(message)
      setStep('payment')
    }
  }

  // Poll payment status for gateway redirect flow
  const pollPaymentStatus = (pid: string) => {
    setPollingPayment(true)
    let attempts = 0
    const maxAttempts = 60 // 5 minutes (5s * 60)

    const interval = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(interval)
        setPollingPayment(false)
        toast.error('Payment verification timed out. Please check your orders.')
        setStep('payment')
        return
      }

      try {
        const res = await fetch(`/api/payments/status?paymentId=${pid}&checkGateway=true`)
        const data = await res.json()

        if (data.success) {
          const status = data.data?.status
          if (status === 'completed') {
            clearInterval(interval)
            setPollingPayment(false)
            clearCart()
            setStep('success')
            toast.success('Payment confirmed!')
          } else if (status === 'failed') {
            clearInterval(interval)
            setPollingPayment(false)
            toast.error(data.data?.failureReason || 'Payment failed')
            setStep('payment')
          }
        }
      } catch {
        // Continue polling
      }
    }, 5000) // Poll every 5 seconds
  }

  const steps: { id: CheckoutStep; label: string; number: number }[] = [
    { id: 'summary', label: 'Summary', number: 1 },
    { id: 'payment', label: 'Method', number: 2 },
    { id: 'payment_details', label: 'Details', number: 3 },
    { id: 'shipping', label: 'Shipping', number: 4 },
    { id: 'processing', label: 'Processing', number: 5 },
    { id: 'success', label: 'Complete', number: 6 },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            {steps.slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    i <= currentStepIndex
                      ? 'text-emerald-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      i < currentStepIndex
                        ? 'bg-emerald-500 text-white'
                        : i === currentStepIndex
                          ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i < currentStepIndex ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 4 && (
                  <div
                    className={`mx-2 h-px w-6 sm:w-12 ${
                      i < currentStepIndex ? 'bg-emerald-400' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Order Summary */}
          {step === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-4"
            >
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Order Summary
              </h3>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId ?? 'default'}`}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.shopName} &middot; Qty: {item.quantity}
                        {item.variantLabel && (
                          <span className="text-emerald-600 ml-1">&middot; {item.variantLabel}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Coupon Code Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5" />
                  Promo Code
                </Label>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-3">
                    <Tag className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-emerald-800 font-mono">
                        {appliedCoupon.coupon.code}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {appliedCoupon.coupon.type === 'percentage'
                          ? `${appliedCoupon.coupon.value}% off`
                          : appliedCoupon.coupon.type === 'fixed'
                            ? `$${appliedCoupon.coupon.value.toFixed(2)} off`
                            : 'Free Shipping'}
                        {appliedCoupon.freeShipping && appliedCoupon.coupon.type !== 'free_shipping' ? ' + Free Shipping' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-700">-${appliedCoupon.discountAmount.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="h-7 w-7 p-0 text-emerald-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyCoupon()
                      }}
                      className="flex-1 font-mono uppercase"
                      disabled={couponLoading}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="shrink-0"
                    >
                      {couponLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {couponError}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(cartTotal ?? 0).toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Coupon ({appliedCoupon.coupon.code})
                    </span>
                    <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (10%)</span>
                  <span>${(platformFee ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Seller Receives (90%)</span>
                  <span>${(sellerPayout ?? 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${effectiveCartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <Info className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-700">
                  90% of your payment goes directly to the seller. The 10% platform fee helps us
                  maintain the marketplace and provide buyer protection.
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </Button>
            </motion.div>
          )}

          {/* Step 2: Payment Method */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-4"
            >
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Select Payment Method
              </h3>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                className="space-y-3"
              >
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.id} className="block cursor-pointer">
                    <Card
                      className={`relative overflow-hidden border-2 transition-all ${
                        paymentMethod === method.id
                          ? method.borderColor + ' shadow-sm'
                          : 'border-transparent hover:border-muted-foreground/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <RadioGroupItem value={method.id} />
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${method.bgColor}`}
                        >
                          {method.region === 'Local' ? (
                            <Wallet className={`h-5 w-5 ${method.color}`} />
                          ) : (
                            <Globe className={`h-5 w-5 ${method.color}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {method.flag} {method.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                method.region === 'Local'
                                  ? 'border-emerald-200 text-emerald-700'
                                  : 'border-blue-200 text-blue-700'
                              }`}
                            >
                              {method.region}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {method.description}
                          </p>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle2 className={`h-5 w-5 ${method.color}`} />
                        )}
                      </div>
                      {paymentMethod === method.id && (
                        <div
                          className={`absolute bottom-0 left-0 h-0.5 w-full ${
                            method.id === 'easypaisa'
                              ? 'bg-emerald-500'
                              : method.id === 'jazzcash'
                                ? 'bg-red-500'
                                : method.id === 'payoneer'
                                  ? 'bg-blue-500'
                                  : 'bg-teal-500'
                          }`}
                        />
                      )}
                    </Card>
                  </label>
                ))}
              </RadioGroup>

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Your payment is held in escrow until you confirm delivery. This protects both
                  buyers and sellers.
                </p>
              </div>

              {/* Security verification checkbox */}
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <Checkbox
                  id="payment-auth"
                  checked={paymentAuthConfirmed}
                  onCheckedChange={(checked) => setPaymentAuthConfirmed(checked === true)}
                  className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <label htmlFor="payment-auth" className="text-xs text-emerald-800 cursor-pointer leading-relaxed">
                  I confirm this payment is authentic and I authorize Marketo to hold funds in escrow
                  until delivery is confirmed.
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('summary')}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!paymentAuthConfirmed}
                  onClick={() => setStep('payment_details')}
                >
                  Continue to Payment Details
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Details */}
          {step === 'payment_details' && (
            <motion.div
              key="payment_details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-4"
            >
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Payment Details
              </h3>

              {/* Saved Payment Methods */}
              {savedPaymentMethods.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Saved Payment Methods</Label>
                  <div className="space-y-2">
                    {savedPaymentMethods.map((pm) => {
                      const details = typeof pm.accountDetails === 'string'
                        ? JSON.parse(pm.accountDetails)
                        : pm.accountDetails as PaymentInfoAccountDetails
                      const methodConfig = PAYMENT_METHODS.find(m => m.id === pm.method)
                      const isMethodMatch = pm.method === paymentMethod
                      const isSelected = selectedSavedMethodId === pm.id
                      return (
                        <label
                          key={pm.id}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                              : isMethodMatch
                                ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                                : 'border-transparent bg-muted/30 hover:border-muted-foreground/20'
                          }`}
                          onClick={() => handleSelectSavedMethod(pm)}
                        >
                          <RadioGroupItem
                            checked={isSelected}
                            className={isSelected ? 'text-emerald-600' : ''}
                          />
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                            pm.method === 'easypaisa' ? 'bg-emerald-50' :
                            pm.method === 'jazzcash' ? 'bg-red-50' :
                            pm.method === 'card' ? 'bg-amber-50' :
                            pm.method === 'payoneer' ? 'bg-blue-50' :
                            'bg-teal-50'
                          }`}>
                            {pm.method === 'easypaisa' || pm.method === 'jazzcash' ? (
                              <Wallet className={`h-4 w-4 ${pm.method === 'easypaisa' ? 'text-emerald-600' : 'text-red-600'}`} />
                            ) : pm.method === 'card' ? (
                              <CreditCard className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Globe className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium truncate">{pm.label}</span>
                              {pm.isDefault && (
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {pm.method === 'card' && details.cardLast4
                                ? `**** **** **** ${details.cardLast4}`
                                : pm.method === 'easypaisa' || pm.method === 'jazzcash'
                                  ? details.mobileNumber
                                    ? `0300 ****${details.mobileNumber?.slice(-3)}`
                                    : '****'
                                  : details.email
                                    ? details.email.replace(/^(..)(.*)(@.*)$/, '$1***$3')
                                    : '****'
                              }
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize shrink-0">
                            {pm.method.replace('_', ' ')}
                          </Badge>
                        </label>
                      )
                    })}
                    {/* "Use new method" option */}
                    <label
                      className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                        !useSavedMethod && !selectedSavedMethodId
                          ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                          : 'border-transparent bg-muted/30 hover:border-muted-foreground/20'
                      }`}
                      onClick={handleUseNewMethod}
                    >
                      <RadioGroupItem checked={!useSavedMethod && !selectedSavedMethodId} />
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium">Enter new payment details</span>
                    </label>
                  </div>
                  <Separator />
                </div>
              )}

              {/* Current method indicator */}
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                {paymentMethod === 'card' ? (
                  <CreditCard className="h-4 w-4 text-amber-600" />
                ) : paymentMethod === 'easypaisa' ? (
                  <Wallet className="h-4 w-4 text-emerald-600" />
                ) : paymentMethod === 'jazzcash' ? (
                  <Wallet className="h-4 w-4 text-red-600" />
                ) : (
                  <Globe className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm font-medium capitalize">
                  {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod}
                </span>
                {useSavedMethod && selectedSavedMethodId && (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] px-1.5 py-0">
                    Saved
                  </Badge>
                )}
              </div>

              {/* Show form fields only if NOT using a saved method */}
              {(!useSavedMethod || !selectedSavedMethodId) && (
                <>
                  {/* Easypaisa / JazzCash */}
                  {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-account-name">Account Name *</Label>
                        <Input
                          id="pd-account-name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Full name on account"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-mobile">Mobile Number *</Label>
                        <Input
                          id="pd-mobile"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="0300 1234567"
                        />
                      </div>
                    </div>
                  )}

                  {/* Debit / Credit Card */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-card-holder">Card Holder Name *</Label>
                        <Input
                          id="pd-card-holder"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name on card"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-card-number">Card Number *</Label>
                        <Input
                          id="pd-card-number"
                          value={cardNumber}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
                            const masked = raw.replace(/(.{4})/g, '$1 ').trim()
                            setCardNumber(masked)
                          }}
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="pd-exp-month">Month *</Label>
                          <Input
                            id="pd-exp-month"
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                            placeholder="MM"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="pd-exp-year">Year *</Label>
                          <Input
                            id="pd-exp-year"
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                            placeholder="YY"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Card Type *</Label>
                          <Select value={cardType} onValueChange={(v) => setCardType(v as 'visa' | 'master' | 'unionpay')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visa">Visa</SelectItem>
                              <SelectItem value="master">Mastercard</SelectItem>
                              <SelectItem value="unionpay">UnionPay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-amber-700">
                          Only the last 4 digits of your card are stored. Full card numbers are never saved on our servers.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payoneer */}
                  {paymentMethod === 'payoneer' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-pay-email">Payoneer Email *</Label>
                        <Input
                          id="pd-pay-email"
                          type="email"
                          value={payEmail}
                          onChange={(e) => setPayEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-pay-name">Account Name *</Label>
                        <Input
                          id="pd-pay-name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Full name on account"
                        />
                      </div>
                    </div>
                  )}

                  {/* Wise */}
                  {paymentMethod === 'wise' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-wise-email">Wise Email *</Label>
                        <Input
                          id="pd-wise-email"
                          type="email"
                          value={payEmail}
                          onChange={(e) => setPayEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-wise-iban">IBAN *</Label>
                        <Input
                      id="pd-wise-iban"
                      value={wiseIban}
                      onChange={(e) => setWiseIban(e.target.value)}
                      placeholder="IBAN number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pd-wise-name">Account Name *</Label>
                    <Input
                      id="pd-wise-name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Full name on account"
                    />
                  </div>
                </div>
              )}
              </>
              )}

              {/* Save for next time checkbox - only when entering new */}
              {(!useSavedMethod || !selectedSavedMethodId) && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="save-payment"
                    checked={savePaymentInfo}
                    onCheckedChange={(checked) => setSavePaymentInfo(checked === true)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <label htmlFor="save-payment" className="text-xs text-muted-foreground cursor-pointer">
                    Save payment details for faster checkout next time
                  </label>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('payment')}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (hasPhysicalItems) {
                      setStep('shipping')
                    } else {
                      handlePayNow()
                    }
                  }}
                >
                  {hasPhysicalItems ? 'Continue to Shipping' : `Pay $${(cartTotal ?? 0).toFixed(2)}`}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Shipping Info (only for physical products) */}
          {step === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Shipping Information
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ship-name">Full Name *</Label>
                  <Input
                    id="ship-name"
                    value={shippingInfo.name}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ship-address">Address *</Label>
                  <Input
                    id="ship-address"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ship-city">City *</Label>
                    <Input
                      id="ship-city"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ship-zip">ZIP Code</Label>
                    <Input
                      id="ship-zip"
                      value={shippingInfo.zip}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, zip: e.target.value })
                      }
                      placeholder="ZIP"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ship-phone">Phone Number *</Label>
                  <Input
                    id="ship-phone"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, phone: e.target.value })
                    }
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('payment_details')}
                >
                  Back
                </Button>
                <Button className="flex-1" onClick={handlePayNow}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${(cartTotal ?? 0).toFixed(2)}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 flex flex-col items-center justify-center py-16 space-y-4"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
                <CreditCard className="absolute inset-0 m-auto h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Processing Payment</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we process your payment...
                </p>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </motion.div>
          )}

          {/* Step 4.5: Gateway Redirect — waiting for Easypaisa/JazzCash payment */}
          {step === 'gateway_redirect' && (
            <motion.div
              key="gateway_redirect"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 flex flex-col items-center py-10 space-y-5"
            >
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  {paymentMethod === 'easypaisa' ? (
                    <Wallet className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <Wallet className="h-8 w-8 text-red-600" />
                  )}
                </div>
                {pollingPayment && (
                  <div className="absolute -top-1 -right-1 h-6 w-6">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg">
                  {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete your payment using {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}
                </p>
              </div>

              {/* Sandbox mode notice */}
              {gatewayMode === 'sandbox' && (
                <div className="w-full rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-800">Sandbox Mode (Testing)</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Click the button below to simulate a payment. In production, this will redirect to the real {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} payment page.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount display */}
              <Card className="w-full p-4 bg-muted/30">
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount to Pay</p>
                  <p className="text-3xl font-bold text-emerald-600">${(cartTotal ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    via {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}
                  </p>
                </div>
              </Card>

              {/* Action button to open gateway / simulate payment */}
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
                onClick={async () => {
                  if (gatewayRedirectUrl) {
                    // For sandbox: open the sandbox confirm URL which auto-completes
                    // For live: open the real gateway redirect URL in a new tab
                    window.open(gatewayRedirectUrl, '_blank')
                  }
                }}
              >
                {gatewayMode === 'sandbox' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Simulate Payment
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Open {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}
                  </>
                )}
              </Button>

              {/* Polling status */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {pollingPayment ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Waiting for payment confirmation...</span>
                  </>
                ) : (
                  <span>Checking payment status...</span>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 w-full">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-700">
                  Your payment is protected by escrow. Funds will only be released to the seller after you confirm delivery.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 flex flex-col items-center py-10 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </motion.div>

              <div className="text-center space-y-1">
                <h3 className="font-bold text-xl">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your order has been placed and payment is held in escrow
                </p>
              </div>

              <Card className="w-full p-4 space-y-2 bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-xs">
                    {orderId ? `#${orderId.slice(-8)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">
                    {paymentId ? `#${paymentId.slice(-8)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">${(cartTotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Escrow Status</span>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Held
                  </Badge>
                </div>
              </Card>

              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 w-full">
                <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  Payment verified & secured with token authentication
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 w-full">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Your payment is safely held in escrow. It will be released to the seller once you
                  confirm delivery of your order.
                </p>
              </div>

              <Button className="w-full" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
