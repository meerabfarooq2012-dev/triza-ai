'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Order, OrderStatus } from '@/types'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('__all__')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      }
      if (statusFilter !== '__all__') params.status = statusFilter

      const res = await api.orders.getOrders(params as any)
      if (res.data) {
        const data = res.data as any
        if (data.items) {
          setOrders(data.items)
          setTotalPages(data.totalPages)
          setTotalOrders(data.total)
        }
      }
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.orders.updateOrderStatus(orderId, status)
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: status as OrderStatus } : null))
      }
    } catch {
      // silent fail
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Order Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            {totalOrders} total orders
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Buyer</TableHead>
                  <TableHead className="hidden md:table-cell">Seller</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px]">
                            {order.buyer?.name?.[0] || 'B'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {order.buyer?.name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {order.seller?.name || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm">
                        ${(order.totalAmount ?? 0).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setSelectedOrder(order)
                                }}
                              >
                                <Eye size={14} className="mr-2" />
                                View Detail
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Order #{selectedOrder?.id.slice(0, 8) || order.id.slice(0, 8)}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Buyer</p>
                                      <p className="text-sm font-medium">{selectedOrder.buyer?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Seller</p>
                                      <p className="text-sm font-medium">{selectedOrder.seller?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Amount</p>
                                      <p className="text-sm font-medium">${(selectedOrder.totalAmount ?? 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Status</p>
                                      <Badge variant="outline" className={`text-xs ${ORDER_STATUS_COLORS[selectedOrder.status]}`}>
                                        {ORDER_STATUS_LABELS[selectedOrder.status]}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Payment</p>
                                      <p className="text-sm font-medium">{selectedOrder.paymentStatus}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Tracking</p>
                                      <p className="text-sm font-medium">{selectedOrder.trackingNo || 'Not available'}</p>
                                    </div>
                                  </div>
                                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-2">Items</p>
                                      {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-1 border-b last:border-0">
                                          <span className="text-sm">{item.product?.name || `Product ${item.productId.slice(0, 8)}`}</span>
                                          <span className="text-sm font-medium">x{item.quantity} ${(item.price ?? 0).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {order.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>
                              <RefreshCcw size={14} className="mr-2" />
                              Mark Processing
                            </DropdownMenuItem>
                          )}
                          {order.status === 'processing' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                              <Truck size={14} className="mr-2" />
                              Mark Shipped
                            </DropdownMenuItem>
                          )}
                          {order.status === 'shipped' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                              <CheckCircle size={14} className="mr-2" />
                              Mark Delivered
                            </DropdownMenuItem>
                          )}
                          {['pending', 'processing'].includes(order.status) && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              className="text-red-600"
                            >
                              <XCircle size={14} className="mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
