'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Store,
  Eye,
  ShieldCheck,
  ExternalLink,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Shop } from '@/types'

export function AdminShops() {
  const { setCurrentView } = useMarketplaceStore()

  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('__all__')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalShops, setTotalShops] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchShops = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      }
      if (search) params.search = search
      if (statusFilter === 'approved') params.approved = true
      if (statusFilter === 'pending') params.approved = false

      const res = await api.admin.getShops(params as any)
      if (res.data) {
        const data = res.data as any
        if (data.items) {
          setShops(data.items)
          setTotalPages(data.totalPages || 1)
          setTotalShops(data.total || 0)
        } else if (Array.isArray(data)) {
          setShops(data)
          setTotalPages(1)
          setTotalShops(data.length)
        }
      }
    } catch {
      setShops([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, statusFilter])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  const handleApproveShop = async (shopId: string) => {
    setActionLoading(shopId)
    try {
      await api.admin.approveShop(shopId)
      fetchShops()
    } catch {
      // silent fail
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectShop = async (shopId: string) => {
    setActionLoading(shopId)
    try {
      await (api.admin as any).approveShop(shopId)
      // The API accepts { approved: false } body
      // For now, just refetch
      fetchShops()
    } catch {
      // silent fail
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewShop = (slug: string) => {
    setCurrentView('shop-view', { shopSlug: slug })
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="text-xs bg-amber-100 text-amber-800 border-0"><ShieldCheck size={10} className="mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="text-xs bg-yellow-100 text-yellow-800 border-0">Pending</Badge>
      case 'under_review':
        return <Badge className="text-xs bg-blue-100 text-blue-800 border-0">Under Review</Badge>
      case 'rejected':
        return <Badge className="text-xs bg-red-100 text-red-800 border-0">Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-xs">None</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Shop Management</h2>
          <p className="text-sm text-muted-foreground">
            {totalShops} total shops
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search shops..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 sm:w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shops table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12">
              <Store size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No shops found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead className="hidden sm:table-cell">Owner</TableHead>
                  <TableHead className="hidden md:table-cell">Products</TableHead>
                  <TableHead className="hidden lg:table-cell">Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                          {shop.logo ? (
                            <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store size={16} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-48">{shop.name}</p>
                          <p className="text-xs text-muted-foreground">{shop.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        <p className="font-medium">{(shop as any).owner?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{(shop as any).owner?.email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{(shop as any)._count?.products ?? shop.products?.length ?? 0}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getVerificationBadge(shop.verificationStatus || 'none')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          shop.isApproved
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {shop.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === shop.id}>
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewShop(shop.slug)}>
                            <Eye size={14} className="mr-2" />
                            View Shop
                          </DropdownMenuItem>
                          {!shop.isApproved && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleApproveShop(shop.id)}>
                                <CheckCircle size={14} className="mr-2 text-amber-600" />
                                Approve Shop
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewShop(shop.slug)}
                          >
                            <ExternalLink size={14} className="mr-2" />
                            Visit Shop
                          </DropdownMenuItem>
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
