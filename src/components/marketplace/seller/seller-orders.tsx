'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Clock,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_DOT_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from '@/lib/constants'
import type { Order, OrderStatus } from '@/types'

const ORDER_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export function SellerOrders() {
  const { currentUser } = useMarketplaceStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: currentUser.id,
        role: 'seller',
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

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userId: currentUser?.id }),
      })
      const data = await res.json()
      if (data.success) {
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: status as OrderStatus } : null))
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
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
              : 'Orders will appear when customers buy your products'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {orders.map((order, index) => (
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
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={order.buyer?.avatar || undefined} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {order.buyer?.name?.slice(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Order #{order.id.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {order.buyer?.name || 'Customer'} •{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={ORDER_STATUS_COLORS[order.status]}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={PAYMENT_STATUS_COLORS[order.paymentStatus]}
                        >
                          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        </Badge>
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
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          Total:{' '}
                          <span className="font-bold text-gray-900">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            handleUpdateStatus(order.id, v)
                          }
                        >
                          <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${ORDER_STATUS_DOT_COLORS[status]}`}
                                  />
                                  {ORDER_STATUS_LABELS[status]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.id.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Buyer Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedOrder.buyer?.avatar || undefined} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {selectedOrder.buyer?.name?.slice(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {selectedOrder.buyer?.name || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={ORDER_STATUS_COLORS[selectedOrder.status]}
                >
                  {ORDER_STATUS_LABELS[selectedOrder.status]}
                </Badge>
                <Badge
                  variant="outline"
                  className={PAYMENT_STATUS_COLORS[selectedOrder.paymentStatus]}
                >
                  {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus]}
                </Badge>
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
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping */}
              {selectedOrder.shippingAddr && (
                <div className="rounded-lg border p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-sm font-medium">
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
                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform Fee</span>
                  <span>${selectedOrder.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Your Earnings</span>
                  <span className="text-emerald-600">
                    ${(selectedOrder.totalAmount - selectedOrder.platformFee).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Update Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Update Status:</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(v) => handleUpdateStatus(selectedOrder.id, v)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
