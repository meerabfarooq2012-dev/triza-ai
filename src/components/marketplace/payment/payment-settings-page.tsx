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
  ShieldCheck,
  Edit2,
  X,
  Save,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface PaymentSettingsPageProps {
  userId: string
  /** If the user is "both", show both tabs; otherwise show the relevant one */
  userRole: 'buyer' | 'seller' | 'both'
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
  borderColor: string
  description: string
  buyerAvailable: boolean
  sellerAvailable: boolean
}

const ALL_METHODS: MethodConfig[] = [
  { id: 'easypaisa', name: 'Easypaisa', icon: Wallet, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300', description: 'Mobile wallet payment', buyerAvailable: true, sellerAvailable: true },
  { id: 'jazzcash', name: 'JazzCash', icon: Wallet, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-300', description: 'Mobile wallet payment', buyerAvailable: true, sellerAvailable: true },
  { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-300', description: 'Visa, Mastercard, UnionPay', buyerAvailable: true, sellerAvailable: false },
  { id: 'payoneer', name: 'Payoneer', icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300', description: 'Global payment platform', buyerAvailable: true, sellerAvailable: true },
  { id: 'wise', name: 'Wise', icon: Mail, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-300', description: 'International transfer', buyerAvailable: true, sellerAvailable: true },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', description: 'Direct bank transfer', buyerAvailable: false, sellerAvailable: true },
]

function getMethodConfig(method: PaymentInfoMethod): MethodConfig {
  return ALL_METHODS.find((m) => m.id === method) ?? ALL_METHODS[0]
}

function getMethodsForType(type: PaymentInfoType): MethodConfig[] {
  return ALL_METHODS.filter((m) =>
    type === 'buyer' ? m.buyerAvailable : m.sellerAvailable
  )
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

function parseDetails(raw: string | Record<string, unknown>): PaymentInfoAccountDetails {
  if (typeof raw === 'object') return raw as PaymentInfoAccountDetails
  try {
    return JSON.parse(raw as string)
  } catch {
    return {}
  }
}

/** Build a masked display string for a saved payment method */
function maskedDetail(method: PaymentInfoMethod, details: PaymentInfoAccountDetails): string {
  switch (method) {
    case 'easypaisa':
    case 'jazzcash':
      return details.mobileNumber ? `0300 ****${details.mobileNumber?.slice(-3)}` : '****'
    case 'card':
      return details.cardLast4 ? `**** **** **** ${details.cardLast4}` : '****'
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

/** Build a detail summary for expanded view */
function detailSummary(method: PaymentInfoMethod, details: PaymentInfoAccountDetails): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = []
  switch (method) {
    case 'easypaisa':
    case 'jazzcash':
      if (details.accountName) items.push({ label: 'Account Name', value: details.accountName })
      if (details.mobileNumber) items.push({ label: 'Mobile Number', value: details.mobileNumber })
      break
    case 'card':
      if (details.cardHolder) items.push({ label: 'Card Holder', value: details.cardHolder })
      if (details.cardLast4) items.push({ label: 'Card Number', value: `**** **** **** ${details.cardLast4}` })
      if (details.expiryMonth && details.expiryYear) items.push({ label: 'Expires', value: `${details.expiryMonth}/${details.expiryYear}` })
      if (details.cardType) items.push({ label: 'Card Type', value: details.cardType.charAt(0).toUpperCase() + details.cardType.slice(1) })
      break
    case 'payoneer':
      if (details.email) items.push({ label: 'Email', value: details.email })
      if (details.accountName) items.push({ label: 'Account Name', value: details.accountName })
      break
    case 'wise':
      if (details.email) items.push({ label: 'Email', value: details.email })
      if (details.iban) items.push({ label: 'IBAN', value: details.iban })
      if (details.accountName) items.push({ label: 'Account Name', value: details.accountName })
      break
    case 'bank_transfer':
      if (details.accountName) items.push({ label: 'Account Name', value: details.accountName })
      if (details.accountNumber) items.push({ label: 'Account Number', value: `****${details.accountNumber.slice(-4)}` })
      if (details.bankName) items.push({ label: 'Bank Name', value: details.bankName })
      if (details.routingNumber) items.push({ label: 'Routing No.', value: details.routingNumber })
      if (details.swiftCode) items.push({ label: 'SWIFT Code', value: details.swiftCode })
      break
  }
  return items
}

// ---------------------------------------------------------------------------
// Add/Edit Form Component
// ---------------------------------------------------------------------------

function PaymentMethodForm({
  type,
  userId,
  editItem,
  onSaved,
  onCancel,
}: {
  type: PaymentInfoType
  userId: string
  editItem: PaymentInfo | null
  onSaved: () => void
  onCancel: () => void
}) {
  const methods = getMethodsForType(type)
  const [selectedMethod, setSelectedMethod] = useState<PaymentInfoMethod>(
    editItem?.method || methods[0].id
  )
  const [label, setLabel] = useState(editItem?.label || '')
  const [isDefault, setIsDefault] = useState(editItem?.isDefault || false)
  const [saving, setSaving] = useState(false)

  // Dynamic fields
  const existingDetails = editItem ? parseDetails(editItem.accountDetails) : {}
  const [accountName, setAccountName] = useState(existingDetails.accountName || '')
  const [mobileNumber, setMobileNumber] = useState(existingDetails.mobileNumber || '')
  const [cardHolder, setCardHolder] = useState(existingDetails.cardHolder || '')
  const [cardNumberRaw, setCardNumberRaw] = useState('')
  const [expiryMonth, setExpiryMonth] = useState(existingDetails.expiryMonth || '')
  const [expiryYear, setExpiryYear] = useState(existingDetails.expiryYear || '')
  const [cardType, setCardType] = useState<'visa' | 'master' | 'unionpay'>(existingDetails.cardType as 'visa' | 'master' | 'unionpay' || 'visa')
  const [email, setEmail] = useState(existingDetails.email || '')
  const [iban, setIban] = useState(existingDetails.iban || '')
  const [accountNumber, setAccountNumber] = useState(existingDetails.accountNumber || '')
  const [bankName, setBankName] = useState(existingDetails.bankName || '')
  const [routingNumber, setRoutingNumber] = useState(existingDetails.routingNumber || '')
  const [swiftCode, setSwiftCode] = useState(existingDetails.swiftCode || '')

  const isEditing = !!editItem

  const buildAccountDetails = (): PaymentInfoAccountDetails => {
    switch (selectedMethod) {
      case 'easypaisa':
      case 'jazzcash':
        return { accountName, mobileNumber }
      case 'card':
        return {
          cardHolder,
          cardLast4: cardNumberRaw.slice(-4) || existingDetails.cardLast4,
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
        if (!isEditing && cardNumberRaw.length < 4) return 'Please enter a valid card number'
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

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSaving(true)
    try {
      const url = isEditing ? `/api/payment-info/${editItem.id}` : '/api/payment-info'
      const method = isEditing ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        userId,
        type,
        method: selectedMethod,
        label: label.trim(),
        accountDetails: buildAccountDetails(),
        isDefault,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (json.success) {
        toast.success(isEditing ? 'Payment method updated!' : 'Payment method saved!')
        onSaved()
      } else {
        toast.error(json.error || 'Failed to save payment method')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-2 border-emerald-200 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {isEditing ? <Edit2 className="h-4 w-4 text-emerald-600" /> : <Plus className="h-4 w-4 text-emerald-600" />}
          {isEditing ? 'Edit' : 'Add'} {type === 'buyer' ? 'Payment' : 'Receiving'} Method
        </CardTitle>
        <CardDescription className="text-xs">
          {type === 'buyer'
            ? 'Add a method you use to pay for orders'
            : 'Add a method where you receive your earnings'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Method Selector */}
        {!isEditing && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Method</Label>
            <RadioGroup
              value={selectedMethod}
              onValueChange={(val) => {
                setSelectedMethod(val as PaymentInfoMethod)
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-2.5 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    selectedMethod === m.id
                      ? `border-emerald-400 bg-emerald-50/50 shadow-sm`
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
        )}

        {isEditing && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
            {(() => {
              const config = getMethodConfig(selectedMethod)
              return (
                <>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${config.bgColor}`}>
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <span className="text-sm font-medium">{config.name}</span>
                </>
              )
            })()}
          </div>
        )}

        <Separator />

        {/* Label */}
        <div className="space-y-1.5">
          <Label htmlFor="ps-label">Label</Label>
          <Input
            id="ps-label"
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
                <Label htmlFor="ps-account-name">Account Name *</Label>
                <Input
                  id="ps-account-name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name on account"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ps-mobile">Mobile Number *</Label>
                <Input
                  id="ps-mobile"
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
                <Label htmlFor="ps-card-holder">Card Holder Name *</Label>
                <Input
                  id="ps-card-holder"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Name on card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ps-card-number">
                  Card Number {isEditing ? '' : '*'}
                </Label>
                <Input
                  id="ps-card-number"
                  value={isEditing && !cardNumberRaw ? `**** **** **** ${existingDetails.cardLast4 || ''}` : cardNumberRaw.replace(/(.{4})/g, '$1 ').trim()}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setCardNumberRaw(digits)
                  }}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  disabled={isEditing && !cardNumberRaw}
                />
                {isEditing && (
                  <p className="text-[11px] text-muted-foreground">
                    Leave as-is to keep current card on file, or enter a new number to update.
                  </p>
                )}
                {!isEditing && (
                  <p className="text-[11px] text-muted-foreground">
                    Only the last 4 digits are stored for your security.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ps-expiry-month">Expiry Month *</Label>
                  <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                    <SelectTrigger id="ps-expiry-month">
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
                  <Label htmlFor="ps-expiry-year">Expiry Year *</Label>
                  <Select value={expiryYear} onValueChange={setExpiryYear}>
                    <SelectTrigger id="ps-expiry-year">
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
                    <RadioGroupItem value="visa" id="ps-visa" />
                    <Label htmlFor="ps-visa" className="text-sm cursor-pointer">Visa</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="master" id="ps-master" />
                    <Label htmlFor="ps-master" className="text-sm cursor-pointer">Mastercard</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="unionpay" id="ps-unionpay" />
                    <Label htmlFor="ps-unionpay" className="text-sm cursor-pointer">UnionPay</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Payoneer */}
          {selectedMethod === 'payoneer' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="ps-payoneer-email">Email *</Label>
                <Input
                  id="ps-payoneer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ps-payoneer-name">Account Name *</Label>
                <Input
                  id="ps-payoneer-name"
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
                <Label htmlFor="ps-wise-email">Email *</Label>
                <Input
                  id="ps-wise-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ps-wise-iban">IBAN *</Label>
                <Input
                  id="ps-wise-iban"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="IBAN number"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ps-wise-name">Account Name *</Label>
                <Input
                  id="ps-wise-name"
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
                <Label htmlFor="ps-bank-name-input">Account Name *</Label>
                <Input
                  id="ps-bank-name-input"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name on account"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ps-bank-acc-num">Account Number *</Label>
                <Input
                  id="ps-bank-acc-num"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ps-bank-name">Bank Name *</Label>
                <Input
                  id="ps-bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ps-routing">Routing No.</Label>
                  <Input
                    id="ps-routing"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="Routing #"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ps-swift">SWIFT Code</Label>
                  <Input
                    id="ps-swift"
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
            id="ps-default"
            checked={isDefault}
            onCheckedChange={(checked) => setIsDefault(checked === true)}
            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="ps-default" className="text-sm cursor-pointer">
            Set as default {type === 'buyer' ? 'payment' : 'receiving'} method
          </Label>
        </div>

        {/* Security note */}
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-700">
              Your payment details are securely stored. Card numbers are never saved in full — only the last 4 digits are kept.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-1.5" />
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
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Update Method' : 'Save Method'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Single Saved Method Card
// ---------------------------------------------------------------------------

function SavedMethodCard({
  pm,
  onSetDefault,
  onDelete,
  onEdit,
  settingDefaultId,
  deletingId,
}: {
  pm: PaymentInfo
  onSetDefault: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (pm: PaymentInfo) => void
  settingDefaultId: string | null
  deletingId: string | null
}) {
  const config = getMethodConfig(pm.method)
  const details = parseDetails(pm.accountDetails)
  const masked = maskedDetail(pm.method, details)
  const detailItems = detailSummary(pm.method, details)

  return (
    <motion.div
      variants={itemVariants}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
    >
      <Card className={`border-0 shadow-sm transition-shadow hover:shadow-md group ${pm.isDefault ? 'ring-2 ring-emerald-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}>
              <config.icon className={`h-6 w-6 ${config.color}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">{pm.label}</span>
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
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                {masked}
              </p>

              {/* Expandable details */}
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                {detailItems.map((item) => (
                  <div key={item.label} className="text-xs">
                    <span className="text-muted-foreground">{item.label}:</span>{' '}
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground mt-2">
                Added {new Date(pm.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Edit */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                onClick={() => onEdit(pm)}
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </Button>

              {/* Set Default */}
              {!pm.isDefault ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                  onClick={() => onSetDefault(pm.id)}
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
                      onClick={() => onDelete(pm.id)}
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
}

// ---------------------------------------------------------------------------
// Main Payment Settings Page
// ---------------------------------------------------------------------------

export function PaymentSettingsPage({ userId, userRole }: PaymentSettingsPageProps) {
  const [activeType, setActiveType] = useState<PaymentInfoType>(
    userRole === 'seller' ? 'seller' : 'buyer'
  )
  const [savedMethods, setSavedMethods] = useState<PaymentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<PaymentInfo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const fetchMethods = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/payment-info?userId=${userId}&type=${activeType}`)
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
  }, [userId, activeType])

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

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

  const handleEdit = (pm: PaymentInfo) => {
    setEditingItem(pm)
    setShowForm(true)
  }

  const handleFormSaved = () => {
    setShowForm(false)
    setEditingItem(null)
    fetchMethods()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const showBothTabs = userRole === 'both'

  // Loading skeletons
  if (loading && savedMethods.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <Skeleton className="h-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Payment Information
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your saved payment and receiving methods
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditingItem(null)
              setShowForm(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Method
          </Button>
        )}
      </motion.div>

      {/* Buyer/Seller Tabs (only for "both" role) */}
      {showBothTabs && (
        <motion.div variants={itemVariants}>
          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as PaymentInfoType)}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="buyer" className="gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Payment Methods
              </TabsTrigger>
              <TabsTrigger value="seller" className="gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                Receiving Methods
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Info className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-900">
              {activeType === 'buyer'
                ? 'Payment methods are used at checkout to pay for orders'
                : 'Receiving methods are used when you withdraw your earnings'}
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              {activeType === 'buyer'
                ? 'Save your card, mobile wallet, or international payment details for faster checkout.'
                : 'Add your bank, mobile wallet, or international account to receive payouts.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchMethods}>
            Retry
          </Button>
        </div>
      )}

      {/* Add/Edit Form */}
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
            <PaymentMethodForm
              type={activeType}
              userId={userId}
              editItem={editingItem}
              onSaved={handleFormSaved}
              onCancel={handleFormCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Methods List */}
      {savedMethods.length === 0 && !showForm ? (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                {activeType === 'buyer' ? (
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-base font-medium text-foreground">
                No {activeType === 'buyer' ? 'payment' : 'receiving'} methods saved
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {activeType === 'buyer'
                  ? 'Add a payment method like a debit/credit card, Easypaisa, or JazzCash to speed up checkout.'
                  : 'Add a receiving method like a bank account, Easypaisa, or Payoneer so you can withdraw your earnings.'}
              </p>
              <Button
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setEditingItem(null)
                  setShowForm(true)
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add {activeType === 'buyer' ? 'Payment' : 'Receiving'} Method
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {savedMethods.map((pm) => (
              <SavedMethodCard
                key={pm.id}
                pm={pm}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
                onEdit={handleEdit}
                settingDefaultId={settingDefaultId}
                deletingId={deletingId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Security Footer */}
      <motion.div variants={itemVariants}>
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Security & Privacy</span>
          </div>
          <ul className="text-xs text-gray-500 space-y-1 ml-6 list-disc">
            <li>Card numbers are never stored in full — only the last 4 digits are kept</li>
            <li>All payment information is securely stored and encrypted</li>
            <li>You can remove any payment method at any time</li>
            <li>Payment methods are only used for their intended purpose (buying or receiving)</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )
}
