'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
  Store,
  Zap,
  Gift,
  Clock,
  Bitcoin,
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
import { Price, formatPriceUtil } from '@/components/marketplace/shared/price'
import { toast } from 'sonner'
import { PLATFORM_FEE_PERCENT } from '@/lib/constants'
import type { PaymentMethod, PaymentInfo, PaymentInfoAccountDetails, Coupon, ApplyCouponResult, ShippingRate } from '@/types'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Checkout payment method display config
// Build display config from the central payment-methods registry
import { PAYMENT_METHODS as PM_CONFIG, getActivePaymentMethodIds, getComingSoonPaymentMethodIds, type PaymentMethodId } from '@/lib/payment-methods'

const CHECKOUT_PAYMENT_METHODS: {
  id: PaymentMethod
  name: string
  region: string
  flag: string
  color: string
  bgColor: string
  borderColor: string
  description: string
  accentColor: string
}[] = (() => {
  const regionMap: Record<string, string> = {
    'Mobile Wallet — Pakistan': '🇵🇰 Local',
    'Mobile Wallet — Bangladesh': '🇧🇩 Local',
    'Mobile Wallet — India': '🇮🇳 Local',
    'International': '🌍 International',
    'Bank Transfer': '🏦 Bank',
    'Cryptocurrency': '🌐 Crypto',
    'Card / Digital': '💳 Card',
    'Cash': '💵 Cash',
    'Remittance': '📬 Remittance',
  }
  const colorMap: Record<string, { color: string; bgColor: string; borderColor: string; accentColor: string }> = {
    'Mobile Wallet — Pakistan': { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200 data-[state=checked]:border-amber-500', accentColor: 'bg-amber-500' },
    'Mobile Wallet — Bangladesh': { color: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200 data-[state=checked]:border-pink-500', accentColor: 'bg-pink-500' },
    'Mobile Wallet — India': { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200 data-[state=checked]:border-orange-500', accentColor: 'bg-orange-500' },
    'International': { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200 data-[state=checked]:border-blue-500', accentColor: 'bg-blue-500' },
    'Bank Transfer': { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200 data-[state=checked]:border-emerald-500', accentColor: 'bg-emerald-500' },
    'Cryptocurrency': { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200 data-[state=checked]:border-orange-500', accentColor: 'bg-yellow-500' },
    'Card / Digital': { color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200 data-[state=checked]:border-violet-500', accentColor: 'bg-violet-500' },
    'Cash': { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200 data-[state=checked]:border-green-500', accentColor: 'bg-green-500' },
    'Remittance': { color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200 data-[state=checked]:border-cyan-500', accentColor: 'bg-cyan-500' },
  }
  return getActivePaymentMethodIds().map((id: PaymentMethodId) => {
    const config = PM_CONFIG[id]
    const colors = colorMap[config.category] || colorMap['International']
    const region = regionMap[config.category] || '🌍 International'
    return {
      id: id as PaymentMethod,
      name: config.name,
      region,
      flag: config.icon,
      color: colors.color,
      bgColor: colors.bgColor,
      borderColor: colors.borderColor,
      description: config.description,
      accentColor: colors.accentColor,
    }
  })
})()

const CHECKOUT_COMING_SOON_METHODS: {
  id: string
  name: string
  region: string
  flag: string
  color: string
  bgColor: string
  borderColor: string
  description: string
  accentColor: string
  reason?: string
}[] = (() => {
  const regionMap: Record<string, string> = {
    'Mobile Wallet — Pakistan': '🇵🇰 Local',
    'Mobile Wallet — Bangladesh': '🇧🇩 Local',
    'Mobile Wallet — India': '🇮🇳 Local',
    'International': '🌍 International',
    'Bank Transfer': '🏦 Bank',
    'Cryptocurrency': '🌐 Crypto',
    'Card / Digital': '💳 Card',
    'Cash': '💵 Cash',
    'Remittance': '📬 Remittance',
  }
  const colorMap: Record<string, { color: string; bgColor: string; borderColor: string; accentColor: string }> = {
    'Mobile Wallet — Pakistan': { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', accentColor: 'bg-amber-500' },
    'Mobile Wallet — Bangladesh': { color: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', accentColor: 'bg-pink-500' },
    'Mobile Wallet — India': { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', accentColor: 'bg-orange-500' },
    'International': { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', accentColor: 'bg-blue-500' },
    'Bank Transfer': { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', accentColor: 'bg-emerald-500' },
    'Cryptocurrency': { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', accentColor: 'bg-yellow-500' },
    'Card / Digital': { color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', accentColor: 'bg-violet-500' },
    'Cash': { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200', accentColor: 'bg-green-500' },
    'Remittance': { color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', accentColor: 'bg-cyan-500' },
  }
  return getComingSoonPaymentMethodIds().map((id: PaymentMethodId) => {
    const config = PM_CONFIG[id]
    const colors = colorMap[config.category] || colorMap['International']
    const region = regionMap[config.category] || '🌍 International'
    return {
      id: id as string,
      name: config.name,
      region,
      flag: config.icon,
      color: colors.color,
      bgColor: colors.bgColor,
      borderColor: colors.borderColor,
      description: config.description,
      accentColor: colors.accentColor,
      reason: config.reason,
    }
  })
})()

// Commission percent is now imported from constants

type CheckoutStep = 'summary' | 'payment' | 'payment_details' | 'shipping' | 'processing' | 'gateway_redirect' | 'crypto_invoice' | 'success'

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { cart, cartTotal, currentUser, clearCart } = useMarketplaceStore()
  const [step, setStep] = useState<CheckoutStep>('summary')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(CHECKOUT_PAYMENT_METHODS[0]?.id || 'easypaisa')
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
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('')
  const [shippingRates, setShippingRates] = useState<(ShippingRate & { estimatedDate: string })[]>([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [taxInfo, setTaxInfo] = useState<{ taxRate: number; taxAmount: number; taxLabel: string; taxInclusive: boolean }>({ taxRate: 0, taxAmount: 0, taxLabel: 'Tax', taxInclusive: false })
  const [orderId, setOrderId] = useState<string>('')
  const [paymentId, setPaymentId] = useState<string>('')
  const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([])
  const [paymentAuthConfirmed, setPaymentAuthConfirmed] = useState(false)

  // Gateway redirect state
  const [gatewayRedirectUrl, setGatewayRedirectUrl] = useState<string>('')
  const [gatewayMode, setGatewayMode] = useState<string>('')
  const [paymentToken, setPaymentToken] = useState<string>('')
  const [pollingPayment, setPollingPayment] = useState(false)

  // Payment details state
  const [accountName, setAccountName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [payEmail, setPayEmail] = useState('')
  const [wiseIban, setWiseIban] = useState('')
  const [payCurrency, setPayCurrency] = useState('btc')
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
    setPayEmail(details.email || '')
    setWiseIban(details.iban || '')
    setPayCurrency(details.preferredCrypto || 'btc')
  }

  const handleUseNewMethod = () => {
    setSelectedSavedMethodId(null)
    setUseSavedMethod(false)
    setAccountName('')
    setMobileNumber('')
    setPayEmail('')
    setWiseIban('')
  }

  const hasPhysicalItems = cart.some((item) => item.type === 'physical')

  // Group cart items by shop for multi-shop splitting display
  const shopGroups = useMemo(() => {
    const groups = new Map<string, { shopName: string; items: typeof cart }>()
    for (const item of cart) {
      const key = item.shopId
      if (!groups.has(key)) {
        groups.set(key, { shopName: item.shopName, items: [] })
      }
      groups.get(key)!.items.push(item)
    }
    return Array.from(groups.entries()).map(([shopId, data]) => ({
      shopId,
      shopName: data.shopName,
      items: data.items,
      subtotal: data.items.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0),
    }))
  }, [cart])

  const isMultiShop = shopGroups.length > 1
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const effectiveCartTotal = Math.max(0, (cartTotal ?? 0) - couponDiscount)
  const platformFee = effectiveCartTotal * (PLATFORM_FEE_PERCENT / 100)
  const sellerPayout = effectiveCartTotal - platformFee

  // Fetch tax calculation when cart changes
  useEffect(() => {
    if (!open || (cartTotal ?? 0) <= 0) return
    const fetchTax = async () => {
      try {
        const res = await fetch('/api/tax/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
            shippingCountry: shippingInfo.country || undefined,
            shippingCost: hasPhysicalItems ? shippingCost : 0,
          }),
        })
        const data = await res.json()
        if (data.subtotal !== undefined) {
          setTaxInfo({
            taxRate: data.taxRate ?? 0,
            taxAmount: data.taxAmount ?? 0,
            taxLabel: data.taxLabel ?? 'Tax',
            taxInclusive: data.taxInclusive ?? false,
          })
        }
      } catch {
        // Tax calculation is non-critical
      }
    }
    fetchTax()
  }, [open, cartTotal, shippingInfo.country, shippingCost, hasPhysicalItems, cart])

  // Fetch shipping rates when country changes and cart has physical items
  useEffect(() => {
    if (!open || !hasPhysicalItems || !shippingInfo.country || cart.length === 0) return
    const fetchShippingRates = async () => {
      setShippingLoading(true)
      try {
        // For multi-shop carts, fetch rates per shop and combine
        const allRates: (ShippingRate & { estimatedDate: string })[] = []
        for (const group of shopGroups) {
          const res = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shopId: group.shopId,
              country: shippingInfo.country,
              orderTotal: group.subtotal,
            }),
          })
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            for (const item of data.data) {
              const rate = item.rate
              const price = item.price
              const estDelivery = item.estimatedDelivery
              const minDate = new Date(estDelivery.min)
              const maxDate = new Date(estDelivery.max)
              const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const estimatedDate = rate.minDays === rate.maxDays ? fmt(minDate) : `${fmt(minDate)} — ${fmt(maxDate)}`
              allRates.push({
                ...rate,
                price,
                estimatedDate,
              })
            }
          }
        }
        // Apply free shipping coupon if applicable
        const finalRates = appliedCoupon?.freeShipping
          ? allRates.map(r => ({ ...r, price: 0 }))
          : allRates
        setShippingRates(finalRates)
        // Auto-select the cheapest option
        if (finalRates.length > 0) {
          const cheapest = finalRates[0]
          setSelectedRateId(cheapest.id)
          setShippingCost(cheapest.price)
          setShippingMethod(cheapest.method)
          setEstimatedDelivery(cheapest.estimatedDate)
        }
      } catch {
        // Non-critical — default to 0 shipping
      } finally {
        setShippingLoading(false)
      }
    }
    fetchShippingRates()
  }, [open, hasPhysicalItems, shippingInfo.country, cart, shopGroups, appliedCoupon?.freeShipping])

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
        toast.success(`Coupon applied! You save ${formatPriceUtil(data.data.discountAmount)}${data.data.freeShipping ? ' + Free Shipping' : ''}`)
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
    setPaymentMethod(CHECKOUT_PAYMENT_METHODS[0]?.id || 'easypaisa')
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
    setEstimatedDelivery('')
    setShippingRates([])
    setShippingLoading(false)
    setSelectedRateId(null)
    setOrderId('')
    setPaymentId('')
    setCreatedOrderIds([])
    setPaymentAuthConfirmed(false)
    setGatewayRedirectUrl('')
    setGatewayMode('')
    setPaymentToken('')
    setPollingPayment(false)
    setAccountName('')
    setMobileNumber('')
    setPayEmail('')
    setWiseIban('')
    setPayCurrency('btc')
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
          } else if (paymentMethod === 'payfast') {
            details.email = payEmail
            details.iban = wiseIban
            details.accountName = accountName
          } else if (paymentMethod === 'crypto') {
            details.walletAddress = '' // Crypto uses gateway-provided address
            details.preferredCrypto = payCurrency
          }

          await fetch('/api/payment-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              type: 'buyer',
              method: paymentMethod,
              label: `My ${CHECKOUT_PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod}`,
              accountDetails: details,
              isDefault: false,
            }),
          })
        } catch {
          // Non-critical — don't block checkout if saving fails
        }
      }

      // Step 1: Create orders (split by shop on the backend)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser?.id,
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
          estimatedDelivery: hasPhysicalItems && estimatedDelivery ? estimatedDelivery : undefined,
          couponCode: appliedCoupon?.coupon.code || undefined,
          discountAmount: appliedCoupon?.discountAmount || undefined,
          taxRate: taxInfo.taxRate || undefined,
          taxAmount: taxInfo.taxAmount || undefined,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Support both old single-order and new multi-order response formats
      const ordersArray: Array<{ id: string; sellerId: string; totalAmount: number }> =
        orderData.data?.orders || (orderData.data?.id ? [orderData.data] : [])

      if (ordersArray.length === 0) {
        throw new Error('No orders were created')
      }

      const firstOrderId = ordersArray[0].id
      setOrderId(firstOrderId)
      setCreatedOrderIds(ordersArray.map((o: { id: string }) => o.id))

      // Redeem coupon after first order is created
      if (appliedCoupon && firstOrderId) {
        try {
          await fetch('/api/coupons/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couponId: appliedCoupon.coupon.id,
              userId: currentUser.id,
              orderId: firstOrderId,
              discountAmount: appliedCoupon.discountAmount,
            }),
          })
        } catch {
          // Non-critical - coupon redemption failure shouldn't block checkout
        }
      }

      // Step 2: Create payment records for each order
      const paymentPromises = ordersArray.map((order: { id: string; sellerId: string; totalAmount: number }) =>
        fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            buyerId: currentUser.id,
            sellerId: order.sellerId,
            paymentMethod,
            amount: order.totalAmount,
          }),
        }).then((r) => r.json())
      )

      const paymentResults = await Promise.all(paymentPromises)
      const failedPayment = paymentResults.find((r: { success?: boolean }) => !r.success)
      if (failedPayment) {
        throw new Error(failedPayment.error || 'Failed to process payment')
      }

      const firstPaymentId = paymentResults[0]?.data?.id || ''
      setPaymentId(firstPaymentId)

      // Step 3: For Crypto, show wallet address invoice instead of redirecting
      if (paymentMethod === 'crypto') {
        try {
          const cryptoRes = await fetch('/api/payments/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: firstOrderId,
              paymentMethod: 'crypto',
              buyerId: currentUser.id,
              amount: cartTotal,
              payCurrency,
            }),
          })

          const cryptoData = await cryptoRes.json()

          if (cryptoData.success && cryptoData.data?.redirectUrl) {
            // Set crypto invoice state instead of redirecting
            setGatewayRedirectUrl(cryptoData.data.redirectUrl)
            setPaymentToken(cryptoData.data.paymentToken || '')
            setGatewayMode(cryptoData.data.gatewayMode || 'sandbox')
            setStep('crypto_invoice')
            return
          }

          // If crypto not configured, fall back to sandbox/verification flow
          if (cryptoData.error?.includes('wallet address not configured')) {
            toast.warning('Crypto wallet address not configured. Using sandbox mode.')
          } else {
            throw new Error(cryptoData.error || 'Crypto checkout failed')
          }
        } catch (err) {
          console.warn('Crypto checkout error, falling back to verification flow:', err)
          // Fall through to verify flow below
        }
      }

      // Step 3b: For PayFast, redirect to PayFast Checkout
      if (paymentMethod === 'payfast') {
        try {
          const payfastRes = await fetch('/api/payments/payfast/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: firstOrderId,
              buyerId: currentUser.id,
              amount: cartTotal,
              successUrl: `${window.location.origin}?payfast_success=1&order=${firstOrderId}`,
              cancelUrl: `${window.location.origin}?payfast_cancel=1`,
            }),
          })

          const payfastData = await payfastRes.json()

          if (payfastData.success && payfastData.data?.redirectUrl) {
            // Redirect to PayFast Checkout
            window.location.href = payfastData.data.redirectUrl
            return
          }

          // If PayFast not configured, fall back to sandbox/verification flow
          if (payfastData.error?.includes('not configured')) {
            toast.warning('PayFast payments require configuration. Using sandbox mode.')
          } else {
            throw new Error(payfastData.error || 'PayFast checkout failed')
          }
        } catch (err) {
          console.warn('PayFast checkout error, falling back to verification flow:', err)
          // Fall through to verify flow below
        }
      }

      // Step 4: For Easypaisa/JazzCash, redirect to payment gateway (use first order)
      if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
        try {
          const initiateRes = await fetch('/api/payments/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: firstOrderId,
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
            pollPaymentStatus(firstPaymentId)
            return
          }
          // If gateway initiation fails, fall through to verify flow
          console.warn('Gateway initiation failed, using direct verification')
        } catch (err) {
          console.warn('Gateway initiation error, using direct verification:', err)
        }
      }

      // Step 4: For payfast, verify payments with tokens
      for (const paymentResult of paymentResults) {
        const metadata = paymentResult.data?.metadata
        let verificationToken = ''
        try {
          const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
          verificationToken = parsed?.verificationToken || ''
        } catch {
          verificationToken = ''
        }

        if (verificationToken && paymentResult.data?.id) {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: paymentResult.data.id,
              verificationToken,
              buyerId: currentUser.id,
            }),
          })

          const verifyData = await verifyRes.json()
          if (!verifyData.success) {
            console.warn('Payment verification failed:', verifyData.error)
          }
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
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      i < currentStepIndex
                        ? 'bg-amber-500 text-gray-900'
                        : i === currentStepIndex
                          ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
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
                      i < currentStepIndex ? 'bg-amber-400' : 'bg-muted'
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

              {/* Multi-shop notice */}
              {isMultiShop && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Your cart contains items from <strong>{shopGroups.length} shops</strong>. Each shop will receive a separate order so they can manage shipping independently.
                  </p>
                </div>
              )}

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {shopGroups.map((group) => (
                  <div key={group.shopId} className="space-y-2">
                    {/* Shop header */}
                    <div className="flex items-center gap-2 px-1">
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.shopName}</span>
                      <span className="text-xs text-muted-foreground">({group.items.length} {group.items.length === 1 ? 'item' : 'items'})</span>
                    </div>
                    {/* Shop items */}
                    {group.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId ?? 'default'}`}
                        className="flex items-center gap-3 rounded-lg border p-3 ml-5"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                            {item.variantLabel && (
                              <span className="text-amber-600 ml-1">&middot; {item.variantLabel}</span>
                            )}
                          </p>
                        </div>
                        <span className="text-sm font-semibold">
                          <Price amount={(item.price ?? 0) * (item.quantity ?? 1)} size="sm" />
                        </span>
                      </div>
                    ))}
                    {/* Shop subtotal (only show in multi-shop) */}
                    {isMultiShop && (
                      <div className="flex justify-between text-xs text-muted-foreground px-1 ml-5">
                        <span>Subtotal for {group.shopName}</span>
                        <span className="font-medium"><Price amount={group.subtotal} size="sm" /></span>
                      </div>
                    )}
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
                  <div className="flex items-center gap-2 rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
                    <Tag className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-amber-800 font-mono">
                        {appliedCoupon.coupon.code}
                      </p>
                      <p className="text-xs text-amber-600">
                        {appliedCoupon.coupon.type === 'percentage'
                          ? `${appliedCoupon.coupon.value}% off`
                          : appliedCoupon.coupon.type === 'fixed'
                            ? `${formatPriceUtil(appliedCoupon.coupon.value)} off`
                            : 'Free Shipping'}
                        {appliedCoupon.freeShipping && appliedCoupon.coupon.type !== 'free_shipping' ? ' + Free Shipping' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-700">-<Price amount={appliedCoupon.discountAmount} size="sm" /></p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="h-7 w-7 p-0 text-amber-600 hover:text-red-600 hover:bg-red-50"
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
                  <Price amount={cartTotal ?? 0} size="sm" />
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Coupon ({appliedCoupon.coupon.code})
                    </span>
                    <span>-<Price amount={appliedCoupon.discountAmount} size="sm" /></span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (10%)</span>
                  <Price amount={platformFee ?? 0} size="sm" />
                </div>
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Seller Receives (90%)</span>
                  <Price amount={sellerPayout ?? 0} size="sm" />
                </div>
                {taxInfo.taxRate > 0 && taxInfo.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {taxInfo.taxLabel} ({taxInfo.taxRate}%{taxInfo.taxInclusive ? ' incl.' : ''})
                    </span>
                    <Price amount={taxInfo.taxAmount} size="sm" />
                  </div>
                )}
                {hasPhysicalItems && shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Shipping
                    </span>
                    <Price amount={shippingCost} size="sm" />
                  </div>
                )}
                {hasPhysicalItems && shippingCost === 0 && shippingRates.length > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Shipping
                    </span>
                    <span>Free</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <Price amount={effectiveCartTotal + (taxInfo.taxInclusive ? 0 : taxInfo.taxAmount) + (hasPhysicalItems ? shippingCost : 0)} size="lg" />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
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
                {CHECKOUT_PAYMENT_METHODS.map((method) => (
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
                                  ? 'border-amber-200 text-amber-700'
                                  : 'border-green-200 text-green-700'
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
                          className={`absolute bottom-0 left-0 h-0.5 w-full ${method.accentColor}`}
                        />
                      )}
                    </Card>
                  </label>
                ))}
              </RadioGroup>

              {/* Coming Soon Payment Methods */}
              {CHECKOUT_COMING_SOON_METHODS.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        Coming Soon
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {CHECKOUT_COMING_SOON_METHODS.map((method) => (
                        <div
                          key={method.id}
                          className="opacity-60 cursor-not-allowed"
                          title="This payment method will be available soon"
                        >
                          <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                            <div className="flex items-center gap-3 p-4">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${method.bgColor} opacity-50`}
                              >
                                {method.region === 'Local' ? (
                                  <Wallet className={`h-5 w-5 ${method.color}`} />
                                ) : (
                                  <Globe className={`h-5 w-5 ${method.color}`} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-muted-foreground">
                                    {method.flag} {method.name}
                                  </span>
                                  <Badge
                                    className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700"
                                  >
                                    Coming Soon
                                  </Badge>
                                </div>
                                {method.reason ? (
                                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                                    {method.reason}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                                    {method.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground/60 italic text-center">
                      More payment methods coming soon! We&apos;re working on integrating these for you.
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-950/30 dark:border-amber-800">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Your payment is held in escrow until you confirm delivery. This protects both
                  buyers and sellers.
                </p>
              </div>

              {/* Security verification checkbox */}
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <Checkbox
                  id="payment-auth"
                  checked={paymentAuthConfirmed}
                  onCheckedChange={(checked) => setPaymentAuthConfirmed(checked === true)}
                  className="mt-0.5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <label htmlFor="payment-auth" className="text-xs text-amber-800 cursor-pointer leading-relaxed">
                  I confirm this payment is authentic and I authorize Thiora to hold funds in escrow
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
                      const methodConfig = CHECKOUT_PAYMENT_METHODS.find(m => m.id === pm.method)
                      const isMethodMatch = pm.method === paymentMethod
                      const isSelected = selectedSavedMethodId === pm.id
                      return (
                        <label
                          key={pm.id}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                              : isMethodMatch
                                ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                                : 'border-transparent bg-muted/30 hover:border-muted-foreground/20'
                          }`}
                          onClick={() => handleSelectSavedMethod(pm)}
                        >
                          <RadioGroupItem
                            value={pm.id}
                            className={isSelected ? 'text-amber-600' : ''}
                          />
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                            pm.method === 'easypaisa' ? 'bg-amber-50' :
                            pm.method === 'jazzcash' ? 'bg-red-50' :
                            pm.method === 'payfast' ? 'bg-[#E8F7FD]' :
                            pm.method === 'crypto' ? 'bg-[#FFF3E0]' :
                            'bg-yellow-50'
                          }`}>
                            {pm.method === 'easypaisa' || pm.method === 'jazzcash' ? (
                              <Wallet className={`h-4 w-4 ${pm.method === 'easypaisa' ? 'text-amber-600' : 'text-red-600'}`} />
                            ) : pm.method === 'crypto' ? (
                              <Bitcoin className="h-4 w-4 text-[#F7931A]" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-[#00A3E0]" />
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
                              {pm.method === 'easypaisa' || pm.method === 'jazzcash'
                                  ? details.mobileNumber
                                    ? `0300 ****${details.mobileNumber?.slice(-3)}`
                                    : '****'
                                  : pm.method === 'crypto'
                                    ? details.walletAddress
                                      ? `${details.walletAddress.slice(0, 6)}...${details.walletAddress.slice(-4)}`
                                      : details.preferredCrypto?.toUpperCase() || 'Crypto'
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
                          ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                          : 'border-transparent bg-muted/30 hover:border-muted-foreground/20'
                      }`}
                      onClick={handleUseNewMethod}
                    >
                      <RadioGroupItem value="new-method" />
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100">
                        <Globe className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium">Enter new payment details</span>
                    </label>
                  </div>
                  <Separator />
                </div>
              )}

              {/* Current method indicator */}
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                {paymentMethod === 'payfast' ? (
                  <ShieldCheck className="h-4 w-4 text-[#00A3E0]" />
                ) : paymentMethod === 'easypaisa' ? (
                  <Wallet className="h-4 w-4 text-amber-600" />
                ) : paymentMethod === 'jazzcash' ? (
                  <Wallet className="h-4 w-4 text-red-600" />
                ) : paymentMethod === 'crypto' ? (
                  <Bitcoin className="h-4 w-4 text-[#F7931A]" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-[#00A3E0]" />
                )}
                <span className="text-sm font-medium capitalize">
                  {CHECKOUT_PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod}
                </span>
                {useSavedMethod && selectedSavedMethodId && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px] px-1.5 py-0">
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

                  {/* PayFast */}
                  {paymentMethod === 'payfast' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-payfast-email">PayFast Email *</Label>
                        <Input
                          id="pd-payfast-email"
                          type="email"
                          value={payEmail}
                          onChange={(e) => setPayEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-payfast-iban">IBAN *</Label>
                        <Input
                      id="pd-payfast-iban"
                      value={wiseIban}
                      onChange={(e) => setWiseIban(e.target.value)}
                      placeholder="IBAN number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pd-payfast-name">Account Name *</Label>
                    <Input
                      id="pd-payfast-name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Full name on account"
                    />
                  </div>
                </div>
              )}

                  {/* Crypto */}
                  {paymentMethod === 'crypto' && (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#FFF3E0] border border-[#F7931A]/30 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Bitcoin className="h-5 w-5 text-[#F7931A]" />
                          <span className="text-sm font-semibold text-orange-700">Pay with Cryptocurrency</span>
                        </div>
                        <p className="text-xs text-orange-700/80">Send crypto directly to our escrow wallet. No KYC required! Supports Bitcoin, Ethereum, and Solana.</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pd-crypto-currency">Select Cryptocurrency *</Label>
                        <Select value={payCurrency} onValueChange={setPayCurrency}>
                          <SelectTrigger id="pd-crypto-currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="btc">₿ BTC - Bitcoin</SelectItem>
                            <SelectItem value="eth">Ξ ETH - Ethereum</SelectItem>
                            <SelectItem value="sol">◎ SOL - Solana</SelectItem>
                          </SelectContent>
                        </Select>
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
                    className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
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
                  {hasPhysicalItems ? 'Continue to Shipping' : <>Pay <Price amount={cartTotal ?? 0} size="sm" /></>}
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ship-state">State / Province</Label>
                    <Input
                      id="ship-state"
                      value={shippingInfo.state}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, state: e.target.value })
                      }
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ship-country">Country *</Label>
                    <Select
                      value={shippingInfo.country}
                      onValueChange={(val) =>
                        setShippingInfo({ ...shippingInfo, country: val })
                      }
                    >
                      <SelectTrigger id="ship-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PK">Pakistan</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="AE">UAE</SelectItem>
                        <SelectItem value="SA">Saudi Arabia</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="CN">China</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="TR">Turkey</SelectItem>
                        <SelectItem value="MY">Malaysia</SelectItem>
                        <SelectItem value="BD">Bangladesh</SelectItem>
                      </SelectContent>
                    </Select>
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

              <Separator />

              {/* Shipping Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" />
                  Shipping Method
                </Label>
                {shippingLoading ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/30">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span className="text-sm text-muted-foreground">Loading shipping options...</span>
                  </div>
                ) : shippingRates.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      No shipping options available for your destination. You can still proceed — shipping will be calculated later.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Show notice when using default shipping rates */}
                    {shippingRates.some(r => r.zoneId === 'default-zone' || r.zone?.name === 'Default Zone') && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                        <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">
                          The seller hasn&apos;t configured custom shipping zones. Default rates are shown below.
                        </p>
                      </div>
                    )}
                    <RadioGroup
                      value={selectedRateId ?? undefined}
                      onValueChange={(rateId) => {
                        setSelectedRateId(rateId)
                        const selected = shippingRates.find(r => r.id === rateId)
                        if (selected) {
                          setShippingCost(selected.price)
                          setShippingMethod(selected.method)
                          setEstimatedDelivery(selected.estimatedDate)
                        }
                      }}
                      className="space-y-2"
                    >
                      {shippingRates.map((rate) => {
                        const isSelected = selectedRateId === rate.id
                        const isFree = rate.price === 0
                        const isExpress = rate.method === 'express'
                        // Pick icon based on method
                        const MethodIcon = isFree ? Gift : isExpress ? Zap : Truck
                        const iconColor = isFree
                          ? 'text-amber-600'
                          : isExpress
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                        const iconBg = isFree
                          ? 'bg-amber-50'
                          : isExpress
                            ? 'bg-amber-50'
                            : 'bg-muted/50'

                        return (
                          <label
                            key={rate.id}
                            className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-amber-400 bg-amber-50/50'
                                : 'border-transparent bg-card shadow-sm hover:border-muted-foreground/20'
                            }`}
                          >
                            <RadioGroupItem value={rate.id} className="mt-1" />
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${iconBg}`}>
                              <MethodIcon className={`h-4 w-4 ${iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{rate.name}</span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 capitalize ${
                                    isExpress
                                      ? 'border-amber-300 text-amber-700'
                                      : isFree
                                        ? 'border-amber-300 text-amber-700'
                                        : ''
                                  }`}
                                >
                                  {rate.method}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  Est. delivery: {rate.estimatedDate}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 mt-0.5">
                              {isFree ? (
                                <Badge className="bg-amber-600 text-gray-900 text-[10px] px-2 py-0.5">FREE</Badge>
                              ) : (
                                <Price amount={rate.price} size="sm" />
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </RadioGroup>
                  </>
                )}
                {estimatedDelivery && selectedRateId && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Estimated delivery: <span className="font-semibold">{estimatedDelivery}</span>
                    </p>
                  </div>
                )}
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
                  <Globe className="h-4 w-4 mr-2" />
                  <>Pay <Price amount={effectiveCartTotal + (taxInfo.taxInclusive ? 0 : taxInfo.taxAmount) + (hasPhysicalItems ? shippingCost : 0)} size="sm" /></>
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
                <div className="h-16 w-16 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                <Globe className="absolute inset-0 m-auto h-6 w-6 text-green-600" />
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  {paymentMethod === 'easypaisa' ? (
                    <Wallet className="h-8 w-8 text-amber-600" />
                  ) : (
                    <Wallet className="h-8 w-8 text-red-600" />
                  )}
                </div>
                {pollingPayment && (
                  <div className="absolute -top-1 -right-1 h-6 w-6">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
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
                  <p className="text-3xl font-bold text-amber-600"><Price amount={cartTotal ?? 0} size="2xl" /></p>
                  <p className="text-xs text-muted-foreground">
                    via {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}
                  </p>
                </div>
              </Card>

              {/* Action button to open gateway / simulate payment */}
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
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

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 w-full">
                <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Your payment is protected by escrow. Funds will only be released to the seller after you confirm delivery.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step: Crypto Invoice - Show wallet address for direct payment */}
          {step === 'crypto_invoice' && (
            <motion.div
              key="crypto_invoice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 flex flex-col items-center py-8 space-y-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3E0]">
                <Bitcoin className="h-8 w-8 text-[#F7931A]" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-bold text-lg">Send Cryptocurrency</h3>
                <p className="text-sm text-muted-foreground">
                  Send the exact amount to the wallet address below
                </p>
              </div>

              {gatewayMode === 'sandbox' && (
                <div className="w-full rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-800">Sandbox Mode (Testing)</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        This is a test payment. In production, buyers will send real crypto to your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount to send */}
              <Card className="w-full p-4 bg-[#FFF3E0]/50 border-[#F7931A]/30">
                <div className="text-center space-y-1">
                  <p className="text-xs text-orange-600 uppercase tracking-wider font-medium">Amount to Send</p>
                  <p className="text-3xl font-bold text-[#F7931A]"><Price amount={cartTotal ?? 0} size="2xl" /></p>
                  <p className="text-xs text-muted-foreground">in {payCurrency.toUpperCase()}</p>
                </div>
              </Card>

              {/* Wallet Address */}
              <div className="w-full space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Escrow Wallet Address ({payCurrency.toUpperCase()})</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border bg-muted/50 p-3 font-mono text-xs break-all">
                    {gatewayRedirectUrl
                      ? decodeURIComponent(new URL(gatewayRedirectUrl).searchParams.get('wallet') || 'Not configured')
                      : 'Loading...'
                    }
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => {
                      const walletAddr = gatewayRedirectUrl
                        ? decodeURIComponent(new URL(gatewayRedirectUrl).searchParams.get('wallet') || '')
                        : ''
                      navigator.clipboard.writeText(walletAddr)
                      toast.success('Wallet address copied!')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* QR Code placeholder - using a simple text-based QR */}
              <div className="w-full rounded-lg bg-white border p-4 flex flex-col items-center space-y-2">
                <div className="w-40 h-40 bg-muted/30 rounded flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  <div className="text-center space-y-1">
                    <Bitcoin className="h-8 w-8 text-[#F7931A] mx-auto" />
                    <p className="text-[10px] text-muted-foreground">Scan with your<br />crypto wallet</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Open your wallet app (Exodus, Trust Wallet, etc.) and scan or paste the address above
                </p>
              </div>

              {/* Important notes */}
              <div className="w-full rounded-lg bg-orange-50 border border-orange-200 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-orange-800">⚠️ Important:</p>
                <ul className="text-[11px] text-orange-700 space-y-1 list-disc ml-4">
                  <li>Send only <strong>{payCurrency.toUpperCase()}</strong> to this address</li>
                  <li>Send the exact amount shown above</li>
                  <li>Payment will be confirmed after blockchain verification (usually 5-30 minutes)</li>
                  <li>Your funds are protected by escrow until delivery</li>
                </ul>
              </div>

              {/* Fee breakdown */}
              <div className="w-full rounded-lg bg-muted/30 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-medium"><Price amount={cartTotal ?? 0} size="sm" /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (10%)</span>
                  <span className="font-medium"><Price amount={(cartTotal ?? 0) * 0.1} size="sm" /></span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-muted-foreground">Seller Receives</span>
                  <span className="font-medium text-green-600"><Price amount={(cartTotal ?? 0) * 0.9} size="sm" /></span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full space-y-2">
                <Button
                  className="w-full bg-[#F7931A] hover:bg-[#E8850F] text-white"
                  size="lg"
                  onClick={() => {
                    if (gatewayMode === 'sandbox') {
                      // In sandbox, simulate payment confirmation
                      setPollingPayment(true)
                      setTimeout(() => {
                        setPollingPayment(false)
                        setStep('success')
                        clearCart()
                      }, 3000)
                    } else {
                      // In live mode, start polling for blockchain confirmation
                      setPollingPayment(true)
                      toast.info('Waiting for blockchain confirmation... This may take 5-30 minutes.')
                    }
                  }}
                  disabled={pollingPayment}
                >
                  {pollingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Waiting for Confirmation...
                    </>
                  ) : gatewayMode === 'sandbox' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Simulate Crypto Payment
                    </>
                  ) : (
                    <>
                      <Bitcoin className="h-4 w-4 mr-2" />
                      I've Sent the Payment
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('payment_details')
                    setPollingPayment(false)
                  }}
                  disabled={pollingPayment}
                >
                  Back to Payment Details
                </Button>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 w-full">
                <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
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
                className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100"
              >
                <CheckCircle2 className="h-10 w-10 text-amber-600" />
              </motion.div>

              <div className="text-center space-y-1">
                <h3 className="font-bold text-xl">
                  {createdOrderIds.length > 1
                    ? `${createdOrderIds.length} Orders Placed!`
                    : 'Payment Successful!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {createdOrderIds.length > 1
                    ? 'Your items have been split into separate orders for each shop'
                    : 'Your order has been placed and payment is held in escrow'}
                </p>
              </div>

              <Card className="w-full p-4 space-y-2 bg-muted/30">
                {createdOrderIds.length > 1 ? (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Order IDs
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {createdOrderIds.map((oid, idx) => (
                        <div key={oid} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order {idx + 1}</span>
                          <span className="font-mono text-xs">#{oid.slice(-8)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono text-xs">
                      {orderId ? `#${orderId.slice(-8)}` : 'N/A'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">
                    {paymentId ? `#${paymentId.slice(-8)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold"><Price amount={cartTotal ?? 0} size="sm" /></span>
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

              {createdOrderIds.length > 1 && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 w-full">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Each seller will manage their own order independently. You can track each order separately from your orders page.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 w-full">
                <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
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
