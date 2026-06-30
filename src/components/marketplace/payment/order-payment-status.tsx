'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Package,
  Lock,
  Unlock,
  Loader2,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Price } from '@/components/marketplace/shared/price'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { Payment, EscrowStatus } from '@/types'

interface OrderPaymentStatusProps {
  payment: Payment | null
  orderStatus: string
  orderId: string
  sellerId: string
  buyerId: string
  totalAmount: number
  onConfirmDelivery?: () => void
}

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <CreditCard className="h-3.5 w-3.5" />,
  },
  escrow: {
    label: 'In Escrow',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <Lock className="h-3.5 w-3.5" />,
  },
}

const ESCROW_STATUS_CONFIG: Record<
  EscrowStatus,
  { label: string; color: string; icon: React.ReactNode; description: string }
> = {
  held: {
    label: 'Held in Escrow',
    color: 'bg-amber-100 text-amber-800',
    icon: <Lock className="h-4 w-4" />,
    description: 'Payment is securely held until delivery is confirmed',
  },
  released: {
    label: 'Released to Seller',
    color: 'bg-amber-100 text-amber-800',
    icon: <Unlock className="h-4 w-4" />,
    description: 'Payment has been released to the seller',
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-amber-100 text-amber-800',
    icon: <CreditCard className="h-4 w-4" />,
    description: 'Payment has been refunded to the buyer',
  },
}

export function OrderPaymentStatus({
  payment,
  orderStatus,
  orderId,
  sellerId,
  buyerId,
  totalAmount,
  onConfirmDelivery,
}: OrderPaymentStatusProps) {
  const { currentUser } = useMarketplaceStore()
  const [confirmingDelivery, setConfirmingDelivery] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const isBuyer = currentUser?.id === buyerId
  const isSeller = currentUser?.id === sellerId
  const paymentStatus = payment?.status || 'pending'
  const escrowStatus = payment?.escrowStatus || 'held'

  const paymentConfig =
    PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.pending
  const escrowConfig = ESCROW_STATUS_CONFIG[escrowStatus] || ESCROW_STATUS_CONFIG.held

  const platformFee = totalAmount * 0.1
  const sellerPayout = totalAmount * 0.9

  const canConfirmDelivery =
    isBuyer && (orderStatus === 'delivered' || orderStatus === 'shipped') && escrowStatus === 'held'

  const handleConfirmDelivery = async () => {
    if (!payment?.id) return
    setConfirmingDelivery(true)
    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', userId: currentUser?.id }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Delivery confirmed! Payment released to seller.')
        setShowConfirmDialog(false)
        setConfirmText('')
        onConfirmDelivery?.()
      } else {
        toast.error(json.error || 'Failed to confirm delivery')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setConfirmingDelivery(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment Status</span>
            <Badge variant="outline" className={`gap-1 px-2 py-1 ${paymentConfig.color}`}>
              {paymentConfig.icon}
              {paymentConfig.label}
            </Badge>
          </div>

          {/* Escrow Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Escrow Status</span>
            <Badge variant="outline" className={`gap-1 px-2 py-1 ${escrowConfig.color}`}>
              {escrowConfig.icon}
              {escrowConfig.label}
            </Badge>
          </div>

          {/* Payment Method */}
          {payment?.paymentMethod && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="text-sm font-medium capitalize">
                {payment.paymentMethod.replace('_', ' ')}
              </span>
            </div>
          )}

          <Separator />

          {/* Amount Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Amount Breakdown</h4>
            <div className="rounded-lg bg-muted/30 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Paid</span>
                <span className="font-semibold"><Price amount={totalAmount ?? 0} size="sm" /></span>
              </div>
              <div className="flex justify-between text-sm text-amber-600">
                <span>Platform Fee (10%)</span>
                <span>-<Price amount={platformFee ?? 0} size="sm" /></span>
              </div>
              <div className="flex justify-between text-sm text-amber-600">
                <span>Seller Payout (90%)</span>
                <span>+<Price amount={sellerPayout ?? 0} size="sm" /></span>
              </div>
            </div>
          </div>

          {/* Escrow info box */}
          {escrowStatus === 'held' && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <Lock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-medium">Payment secured in escrow</p>
                {isBuyer && (
                  <p>
                    Your payment is safely held. It will be released to the seller once you confirm
                    delivery.
                  </p>
                )}
                {isSeller && (
                  <p>
                    Payment will be released to your wallet once the buyer confirms delivery.
                  </p>
                )}
              </div>
            </div>
          )}

          {escrowStatus === 'released' && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-medium">Payment released</p>
                {isSeller && (
                  <p>The payment has been added to your available wallet balance.</p>
                )}
              </div>
            </div>
          )}

          {/* Confirm Delivery Button */}
          {canConfirmDelivery && (
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Your order has been {orderStatus}. Confirm delivery to release the payment to the
                  seller.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => setShowConfirmDialog(true)}
                disabled={confirmingDelivery}
              >
                {confirmingDelivery ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                Confirm Delivery & Release Payment
              </Button>
            </div>
          )}

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirmDialog} onOpenChange={(open) => {
            if (!open) {
              setConfirmText('')
            }
            setShowConfirmDialog(open)
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirm Delivery
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3 text-left">
                  <p>
                    By confirming delivery, you authorize TRIZA to release the payment of{' '}
                    <span className="font-semibold text-foreground"><Price amount={totalAmount ?? 0} size="sm" /></span>{' '}
                    to the seller. This action <span className="font-semibold text-foreground">cannot be undone</span>.
                  </p>
                  <p>
                    The seller will receive{' '}
                    <span className="font-semibold text-amber-600"><Price amount={sellerPayout ?? 0} size="sm" /></span>{' '}
                    (after 10% platform fee).
                  </p>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs font-bold">CONFIRM</span> to proceed:
                    </p>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type CONFIRM here..."
                      className="font-mono"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={confirmingDelivery}>Cancel</AlertDialogCancel>
                <Button
                  onClick={handleConfirmDelivery}
                  disabled={confirmingDelivery || confirmText !== 'CONFIRM'}
                  className="bg-amber-600 hover:bg-amber-700 text-gray-900"
                >
                  {confirmingDelivery ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Yes, Confirm Delivery'
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Seller: see when payment will be released */}
          {isSeller && escrowStatus === 'held' && orderStatus !== 'delivered' && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 border p-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {orderStatus === 'pending' || orderStatus === 'processing'
                  ? 'Payment will be released after the order is delivered and the buyer confirms receipt.'
                  : orderStatus === 'shipped'
                    ? 'Your order is on the way. Payment will be released once the buyer confirms delivery.'
                    : 'Waiting for order progress. Payment is held in escrow.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
