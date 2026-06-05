'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Truck,
  X,
  MapPin,
  PackageCheck,
  Loader2,
  Lock,
  ShieldCheck,
  RotateCcw,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { OrderPaymentStatus } from '@/components/marketplace/payment/order-payment-status'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_DOT_COLORS,
} from '@/lib/constants'
import type { Order, OrderStatus, Payment, EscrowStatus } from '@/types'

// ----- Payment/Escrow Badge Configs -----
const PAYMENT_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Payment Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

const ESCROW_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  held: { label: 'Held in Escrow', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  released: { label: 'Released', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  refunded: { label: 'Refunded', color: 'bg-amber-100 text-amber-800 border-amber-200' },
}

const ORDER_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function BuyerOrders() {
  const { currentUser, setCurrentView } = useMarketplaceStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [confirmingDelivery, setConfirmingDelivery] = useState(false)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: currentUser.id,
        role: 'buyer',
        page: String(page),
        limit: '8',
      })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data.orders || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, page, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', userId: currentUser?.id }),
      })
      const data = await res.json()
      if (data.success) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  const handleConfirmDeliveryFromDialog = async () => {
    if (!selectedOrder?.payment?.id || !currentUser) return
    setConfirmingDelivery(true)
    try {
      const res = await fetch(`/api/payments/${selectedOrder.payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        fetchOrders()
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error('Failed to confirm delivery:', error)
    } finally {
      setConfirmingDelivery(false)
    }
  }

  // Helper to check if an order's payment allows confirming delivery
  const canConfirmDelivery = (order: Order) => {
    return (
      order.payment &&
      order.payment.escrowStatus === 'held' &&
      (order.status === 'delivered' || order.status === 'shipped')
    )
  }

  // Download invoice handler
  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingInvoiceId(orderId)
    try {
      const blob = await api.invoice.download(orderId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice-${orderId.slice(-8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded successfully')
    } catch (err) {
      console.error('Failed to download invoice:', err)
      toast.error('Failed to download invoice')
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

  // Check if invoice is available for an order
  const canDownloadInvoice = (order: Order) => {
    return order.paymentStatus === 'paid' || order.paymentStatus === 'completed' || order.status === 'delivered'
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-500">
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="h-32 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16"
        >
          <Package className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter !== 'all'
              ? `You don't have any ${statusFilter} orders`
              : 'Start shopping to see your orders here'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {orders.map((order, index) => {
              const paymentData = order.payment as (Payment & { escrowStatus: EscrowStatus }) | null
              const paymentBadge = paymentData
                ? PAYMENT_STATUS_BADGE[paymentData.status]
                : null
              const escrowBadge = paymentData
                ? ESCROW_STATUS_BADGE[paymentData.escrowStatus]
                : null

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Order #{order.id.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`${ORDER_STATUS_COLORS[order.status]} gap-1.5`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${ORDER_STATUS_DOT_COLORS[order.status]}`}
                            />
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                          {paymentBadge && (
                            <Badge
                              variant="outline"
                              className={`gap-1 ${paymentBadge.color}`}
                            >
                              {paymentBadge.label}
                            </Badge>
                          )}
                          {escrowBadge && paymentData?.escrowStatus === 'held' && (
                            <Badge
                              variant="outline"
                              className={`gap-1 ${escrowBadge.color}`}
                            >
                              <Lock className="h-3 w-3" />
                              {escrowBadge.label}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-4 space-y-2">
                        {order.items?.map((item) => {
                          let productImages: string[] = []
                          if (item.product) {
                            try {
                              const raw = (item.product as Record<string, unknown>).images
                              productImages = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
                            } catch { productImages = [] }
                          }
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                            >
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                                {productImages[0] ? (
                                  <img
                                    src={productImages[0]}
                                    alt={item.product?.name || 'Product'}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {item.product?.name || 'Product'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty: {item.quantity} × ${(item.price ?? 0).toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Total:{' '}
                            <span className="font-bold text-gray-900">
                              ${(order.totalAmount ?? 0).toFixed(2)}
                            </span>
                          </span>
                          {order.trackingNo && (
                            <span className="flex items-center gap-1">
                              <Truck className="h-3.5 w-3.5" />
                              {order.trackingNo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentView('order-tracking', { orderId: order.id })}
                            className="gap-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Track
                          </Button>
                          {canDownloadInvoice(order) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(order.id)}
                              disabled={downloadingInvoiceId === order.id}
                              className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0"
                            >
                              {downloadingInvoiceId === order.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FileText className="h-3.5 w-3.5" />
                              )}
                              Invoice
                            </Button>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <X className="mr-1.5 h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.id.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={ORDER_STATUS_COLORS[selectedOrder.status]}
                >
                  {ORDER_STATUS_LABELS[selectedOrder.status]}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                      <Package className="h-5 w-5 text-gray-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × ${(item.price ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping */}
              {selectedOrder.shippingAddr && (
                <div className="rounded-lg border p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingName}
                    <br />
                    {selectedOrder.shippingAddr}
                    {selectedOrder.shippingCity && `, ${selectedOrder.shippingCity}`}
                    {selectedOrder.shippingZip && ` ${selectedOrder.shippingZip}`}
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-1 rounded-lg bg-gray-50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${(selectedOrder.totalAmount ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform Fee</span>
                  <span>${(selectedOrder.platformFee ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ${((selectedOrder.totalAmount ?? 0) + (selectedOrder.platformFee ?? 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment & Escrow Status Section */}
              {selectedOrder.payment ? (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Payment Status</h4>
                  </div>

                  {/* Payment & Escrow Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const pBadge = PAYMENT_STATUS_BADGE[selectedOrder.payment!.status]
                      return pBadge ? (
                        <Badge variant="outline" className={`gap-1 ${pBadge.color}`}>
                          {pBadge.label}
                        </Badge>
                      ) : null
                    })()}
                    {(() => {
                      const eBadge = ESCROW_STATUS_BADGE[selectedOrder.payment!.escrowStatus]
                      return eBadge ? (
                        <Badge variant="outline" className={`gap-1 ${eBadge.color}`}>
                          {selectedOrder.payment!.escrowStatus === 'held' && (
                            <Lock className="h-3 w-3" />
                          )}
                          {eBadge.label}
                        </Badge>
                      ) : null
                    })()}
                  </div>

                  {/* Payment Amount Breakdown */}
                  <div className="rounded-lg bg-gray-50 p-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">${(selectedOrder.payment?.amount ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Platform Fee (10%)</span>
                      <span>-${(selectedOrder.payment?.platformFee ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Seller Payout (90%)</span>
                      <span>+${(selectedOrder.payment?.sellerPayout ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Escrow info */}
                  {selectedOrder.payment.escrowStatus === 'held' && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <Lock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Your payment is securely held in escrow. It will be released to the seller once you confirm delivery.
                      </p>
                    </div>
                  )}

                  {/* Confirm Delivery & Release Payment Button */}
                  {canConfirmDelivery(selectedOrder) && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                        <PackageCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-emerald-700">
                          Your order has been {selectedOrder.status}. Confirm delivery to release the payment from escrow to the seller.
                        </p>
                      </div>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={confirmingDelivery}
                        onClick={handleConfirmDeliveryFromDialog}
                      >
                        {confirmingDelivery ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PackageCheck className="mr-2 h-4 w-4" />
                        )}
                        Confirm Delivery & Release Payment
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span>No payment information available for this order</span>
                  </div>
                </div>
              )}

              {/* Track Order Button */}
              <Button
                variant="outline"
                className="w-full gap-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200"
                onClick={() => {
                  setSelectedOrder(null)
                  setCurrentView('order-tracking', { orderId: selectedOrder.id })
                }}
              >
                <Truck className="h-4 w-4" />
                Track Order
              </Button>

              {/* Request Return Button — available for delivered/shipped orders that aren't already refunded */}
              {(selectedOrder.status === 'delivered' || selectedOrder.status === 'shipped') && selectedOrder.status !== 'refunded' && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700 border-amber-200"
                  onClick={() => {
                    setSelectedOrder(null)
                    setCurrentView('returns', { orderId: selectedOrder.id, action: 'create' })
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Request Return / Refund
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
