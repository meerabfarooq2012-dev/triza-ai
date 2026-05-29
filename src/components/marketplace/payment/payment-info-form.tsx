'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Wallet,
  Building2,
  Mail,
  Globe,
  Plus,
  Trash2,
  Star,
  StarOff,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type {
  PaymentInfo,
  PaymentInfoType,
  PaymentInfoMethod,
  PaymentInfoAccountDetails,
} from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PaymentInfoFormProps {
  type: 'buyer' | 'seller' // buyer = paying methods, seller = receiving methods
  userId: string
}

// ---------------------------------------------------------------------------
// Method configuration
// ---------------------------------------------------------------------------

interface MethodConfig {
  id: PaymentInfoMethod
  name: string
  icon: React.ElementType
  color: string
  bgColor: string
  description: string
}

const BUYER_METHODS: MethodConfig[] = [
  { id: 'easypaisa', name: 'Easypaisa', icon: Wallet, color: 'text-emerald-600', bgColor: 'bg-emerald-50', description: 'Mobile wallet payment' },
  { id: 'jazzcash', name: 'JazzCash', icon: Wallet, color: 'text-red-600', bgColor: 'bg-red-50', description: 'Mobile wallet payment' },
  { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, color: 'text-violet-600', bgColor: 'bg-violet-50', description: 'Visa, Mastercard, UnionPay' },
  { id: 'payoneer', name: 'Payoneer', icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Global payment platform' },
  { id: 'wise', name: 'Wise', icon: Mail, color: 'text-teal-600', bgColor: 'bg-teal-50', description: 'International transfer' },
]

const SELLER_METHODS: MethodConfig[] = [
  { id: 'easypaisa', name: 'Easypaisa', icon: Wallet, color: 'text-emerald-600', bgColor: 'bg-emerald-50', description: 'Mobile wallet' },
  { id: 'jazzcash', name: 'JazzCash', icon: Wallet, color: 'text-red-600', bgColor: 'bg-red-50', description: 'Mobile wallet' },
  { id: 'payoneer', name: 'Payoneer', icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Global payment platform' },
  { id: 'wise', name: 'Wise', icon: Mail, color: 'text-teal-600', bgColor: 'bg-teal-50', description: 'International transfer' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, color: 'text-amber-600', bgColor: 'bg-amber-50', description: 'Direct bank transfer' },
]

const ALL_METHODS: MethodConfig[] = [...BUYER_METHODS, { id: 'bank_transfer' as PaymentInfoMethod, name: 'Bank Transfer', icon: Building2, color: 'text-amber-600', bgColor: 'bg-amber-50', description: 'Direct bank transfer' }]

function getMethodConfig(method: PaymentInfoMethod): MethodConfig {
  return ALL_METHODS.find((m) => m.id === method) ?? ALL_METHODS[0]
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// ---------------------------------------------------------------------------
// Helper: parse accountDetails JSON
// ---------------------------------------------------------------------------

function parseDetails(raw: string): PaymentInfoAccountDetails {
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/** Build a masked display string for a saved payment method */
function maskedDetail(method: PaymentInfoMethod, details: PaymentInfoAccountDetails): string {
  switch (method) {
    case 'easypaisa':
    case 'jazzcash':
      return details.mobileNumber ? `0300 ****${details.mobileNumber.slice(-3)}` : '****'
    case 'card':
      return details.cardLast4 ? `**** ${details.cardLast4}` : '****'
    case 'payoneer':
      return details.email ? details.email.replace(/^(..)(.*)(@.*)$/, '$1***$3') : '****'
    case 'wise':
      return details.iban ? `IBAN ****${details.iban.slice(-4)}` : details.email ? details.email.replace(/^(..)(.*)(@.*)$/, '$1***$3') : '****'
    case 'bank_transfer':
      return details.accountNumber ? `**** ${details.accountNumber.slice(-4)}` : '****'
    default:
      return '****'
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentInfoForm({ type, userId }: PaymentInfoFormProps) {
  // --- Saved list state ---
  const [savedMethods, setSavedMethods] = useState<PaymentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Add form state ---
  const [showForm, setShowForm] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentInfoMethod>(
    type === 'buyer' ? 'easypaisa' : 'easypaisa'
  )
  const [label, setLabel] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  // Dynamic fields
  const [accountName, setAccountName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumberRaw, setCardNumberRaw] = useState('') // raw input for masking display
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cardType, setCardType] = useState<'visa' | 'master' | 'unionpay'>('visa')
  const [email, setEmail] = useState('')
  const [iban, setIban] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [swiftCode, setSwiftCode] = useState('')

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const methods = type === 'buyer' ? BUYER_METHODS : SELLER_METHODS

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------

  const fetchMethods = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/payment-info?userId=${userId}&type=${type}`)
      const json = await res.json()
      if (json.success) {
        setSavedMethods(json.data ?? [])
      } else {
        setError(json.error || 'Failed to load payment methods')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [userId, type])

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

  // -----------------------------------------------------------------------
  // Reset form
  // -----------------------------------------------------------------------

  const resetForm = () => {
    setLabel('')
    setAccountName('')
    setMobileNumber('')
    setCardHolder('')
    setCardNumberRaw('')
    setExpiryMonth('')
    setExpiryYear('')
    setCardType('visa')
    setEmail('')
    setIban('')
    setAccountNumber('')
    setBankName('')
    setRoutingNumber('')
    setSwiftCode('')
    setIsDefault(false)
  }

  // -----------------------------------------------------------------------
  // Card number input handler – mask all but last 4 digits
  // -----------------------------------------------------------------------

  const handleCardNumberChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '')
    // Limit to 16 digits
    const limited = digits.slice(0, 16)
    setCardNumberRaw(limited)
  }

  const displayCardNumber = (raw: string) => {
    if (raw.length <= 4) return raw
    const last4 = raw.slice(-4)
    const maskedLength = raw.length - 4
    const masked = '•'.repeat(maskedLength)
    // Format in groups of 4
    const combined = masked + last4
    return combined.replace(/(.{4})/g, '$1 ').trim()
  }

  // -----------------------------------------------------------------------
  // Build accountDetails from form
  // -----------------------------------------------------------------------

  const buildAccountDetails = (): PaymentInfoAccountDetails => {
    switch (selectedMethod) {
      case 'easypaisa':
      case 'jazzcash':
        return { accountName, mobileNumber }
      case 'card':
        return {
          cardHolder,
          cardLast4: cardNumberRaw.slice(-4),
          expiryMonth,
          expiryYear,
          cardType,
        }
      case 'payoneer':
        return { email, accountName }
      case 'wise':
        return { email, iban, accountName }
      case 'bank_transfer':
        return {
          accountName,
          accountNumber,
          bankName,
          routingNumber: routingNumber || undefined,
          swiftCode: swiftCode || undefined,
        }
      default:
        return {}
    }
  }

  // -----------------------------------------------------------------------
  // Validate
  // -----------------------------------------------------------------------

  const validate = (): string | null => {
    if (!label.trim()) return 'Please provide a label for this payment method'

    switch (selectedMethod) {
      case 'easypaisa':
      case 'jazzcash':
        if (!accountName.trim()) return 'Please enter the account name'
        if (!mobileNumber.trim()) return 'Please enter the mobile number'
        break
      case 'card':
        if (!cardHolder.trim()) return 'Please enter the card holder name'
        if (cardNumberRaw.length < 4) return 'Please enter a valid card number'
        if (!expiryMonth || !expiryYear) return 'Please enter the card expiry date'
        break
      case 'payoneer':
        if (!email.trim()) return 'Please enter your Payoneer email'
        if (!accountName.trim()) return 'Please enter the account name'
        break
      case 'wise':
        if (!email.trim()) return 'Please enter your Wise email'
        if (!iban.trim()) return 'Please enter your IBAN'
        if (!accountName.trim()) return 'Please enter the account name'
        break
      case 'bank_transfer':
        if (!accountName.trim()) return 'Please enter the account name'
        if (!accountNumber.trim()) return 'Please enter the account number'
        if (!bankName.trim()) return 'Please enter the bank name'
        break
    }
    return null
  }

  // -----------------------------------------------------------------------
  // Save
  // -----------------------------------------------------------------------

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/payment-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          method: selectedMethod,
          label: label.trim(),
          accountDetails: buildAccountDetails(),
          isDefault,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Payment method saved!')
        resetForm()
        setShowForm(false)
        fetchMethods()
      } else {
        toast.error(json.error || 'Failed to save payment method')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/payment-info/${id}?userId=${userId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Payment method removed')
        fetchMethods()
      } else {
        toast.error(json.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // -----------------------------------------------------------------------
  // Set default
  // -----------------------------------------------------------------------

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id)
    try {
      const res = await fetch(`/api/payment-info/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isDefault: true }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Default payment method updated')
        fetchMethods()
      } else {
        toast.error(json.error || 'Failed to update default')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSettingDefaultId(null)
    }
  }

  // -----------------------------------------------------------------------
  // Loading skeletons
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <Skeleton className="h-20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={fetchMethods}>
          Retry
        </Button>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {type === 'buyer' ? (
            <>
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Payment Methods
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5 text-emerald-600" />
              Receiving Methods
            </>
          )}
        </h3>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            setShowForm((prev) => !prev)
            if (!showForm) {
              setSelectedMethod(methods[0].id)
              resetForm()
            }
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Method
        </Button>
      </motion.div>

      {/* Saved Methods List */}
      {savedMethods.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mb-4">
                {type === 'buyer' ? (
                  <CreditCard className="h-7 w-7 text-muted-foreground" />
                ) : (
                  <Wallet className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium text-foreground">
                No {type === 'buyer' ? 'payment' : 'receiving'} methods saved
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {type === 'buyer'
                  ? 'Add a payment method to speed up checkout.'
                  : 'Add a receiving method so buyers can pay you.'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {savedMethods.map((pm) => {
              const config = getMethodConfig(pm.method)
              const details = parseDetails(pm.accountDetails)
              const masked = maskedDetail(pm.method, details)

              return (
                <motion.div
                  key={pm.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                >
                  <Card className="border-0 shadow-sm transition-shadow hover:shadow-md group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
                          <config.icon className={`h-5 w-5 ${config.color}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm truncate">{pm.label}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize shrink-0">
                              {pm.method.replace('_', ' ')}
                            </Badge>
                            {pm.isDefault && (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] px-1.5 py-0 shrink-0">
                                <Star className="h-2.5 w-2.5 mr-0.5 fill-emerald-600 text-emerald-600" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                            {masked}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Set Default */}
                          {!pm.isDefault ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                              onClick={() => handleSetDefault(pm.id)}
                              disabled={settingDefaultId === pm.id}
                              title="Set as default"
                            >
                              {settingDefaultId === pm.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          ) : (
                            <div className="h-8 w-8 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </div>
                          )}

                          {/* Delete */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                disabled={deletingId === pm.id}
                                title="Remove"
                              >
                                {deletingId === pm.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove &quot;{pm.label}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(pm.id)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add New Method Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-600" />
                  Add {type === 'buyer' ? 'Payment' : 'Receiving'} Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Method Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Method</Label>
                  <RadioGroup
                    value={selectedMethod}
                    onValueChange={(val) => {
                      setSelectedMethod(val as PaymentInfoMethod)
                      resetForm()
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    {methods.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2.5 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                          selectedMethod === m.id
                            ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                            : 'border-transparent bg-muted/30 hover:border-muted-foreground/20'
                        }`}
                      >
                        <RadioGroupItem value={m.id} />
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${m.bgColor}`}>
                          <m.icon className={`h-4 w-4 ${m.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{m.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                {/* Label */}
                <div className="space-y-1.5">
                  <Label htmlFor="pi-label">Label</Label>
                  <Input
                    id="pi-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={type === 'buyer' ? 'e.g., My Easypaisa' : 'e.g., HBL Account'}
                  />
                </div>

                {/* Dynamic Fields */}
                <div className="space-y-3">
                  {/* Easypaisa / JazzCash */}
                  {(selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash') && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-account-name">Account Name *</Label>
                        <Input
                          id="pi-account-name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Full name on account"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-mobile">Mobile Number *</Label>
                        <Input
                          id="pi-mobile"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="0300 1234567"
                        />
                      </div>
                    </>
                  )}

                  {/* Card */}
                  {selectedMethod === 'card' && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-card-holder">Card Holder Name *</Label>
                        <Input
                          id="pi-card-holder"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name on card"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-card-number">Card Number *</Label>
                        <Input
                          id="pi-card-number"
                          value={displayCardNumber(cardNumberRaw)}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="•••• •••• •••• 4242"
                          inputMode="numeric"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Only the last 4 digits are stored for your security.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="pi-expiry-month">Expiry Month *</Label>
                          <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                            <SelectTrigger id="pi-expiry-month">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const val = String(i + 1).padStart(2, '0')
                                return (
                                  <SelectItem key={val} value={val}>
                                    {val}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="pi-expiry-year">Expiry Year *</Label>
                          <Select value={expiryYear} onValueChange={setExpiryYear}>
                            <SelectTrigger id="pi-expiry-year">
                              <SelectValue placeholder="YY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i
                                const val = String(year).slice(-2)
                                return (
                                  <SelectItem key={val} value={val}>
                                    {year}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Card Type *</Label>
                        <RadioGroup
                          value={cardType}
                          onValueChange={(val) => setCardType(val as 'visa' | 'master' | 'unionpay')}
                          className="flex gap-4"
                        >
                          <div className="flex items-center gap-1.5">
                            <RadioGroupItem value="visa" id="visa" />
                            <Label htmlFor="visa" className="text-sm cursor-pointer">Visa</Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RadioGroupItem value="master" id="master" />
                            <Label htmlFor="master" className="text-sm cursor-pointer">Mastercard</Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RadioGroupItem value="unionpay" id="unionpay" />
                            <Label htmlFor="unionpay" className="text-sm cursor-pointer">UnionPay</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </>
                  )}

                  {/* Payoneer */}
                  {selectedMethod === 'payoneer' && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-payoneer-email">Email *</Label>
                        <Input
                          id="pi-payoneer-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-payoneer-name">Account Name *</Label>
                        <Input
                          id="pi-payoneer-name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Full name on account"
                        />
                      </div>
                    </>
                  )}

                  {/* Wise */}
                  {selectedMethod === 'wise' && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-wise-email">Email *</Label>
                        <Input
                          id="pi-wise-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-wise-iban">IBAN *</Label>
                        <Input
                          id="pi-wise-iban"
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                          placeholder="IBAN number"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-wise-name">Account Name *</Label>
                        <Input
                          id="pi-wise-name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Full name on account"
                        />
                      </div>
                    </>
                  )}

                  {/* Bank Transfer */}
                  {selectedMethod === 'bank_transfer' && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-bank-name-input">Account Name *</Label>
                        <Input
                          id="pi-bank-name-input"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Full name on account"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-bank-acc-num">Account Number *</Label>
                        <Input
                          id="pi-bank-acc-num"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Account number"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pi-bank-name">Bank Name *</Label>
                        <Input
                          id="pi-bank-name"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Bank name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="pi-routing">Routing No.</Label>
                          <Input
                            id="pi-routing"
                            value={routingNumber}
                            onChange={(e) => setRoutingNumber(e.target.value)}
                            placeholder="Routing #"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="pi-swift">SWIFT Code</Label>
                          <Input
                            id="pi-swift"
                            value={swiftCode}
                            onChange={(e) => setSwiftCode(e.target.value)}
                            placeholder="SWIFT"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* Set as default checkbox */}
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="pi-default"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(checked === true)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label htmlFor="pi-default" className="text-sm cursor-pointer">
                    Set as default {type === 'buyer' ? 'payment' : 'receiving'} method
                  </Label>
                </div>

                {/* Security note */}
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-xs text-emerald-700">
                    🔒 Your payment details are securely stored. Card numbers are never saved in full — only the last 4 digits are kept.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Save Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
