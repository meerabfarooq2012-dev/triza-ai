'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  MoreHorizontal,
  Package,
  Download,
  Briefcase,
  Eye,
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
import { PRODUCT_TYPE_LABELS, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Product, ProductType } from '@/types'
import { Price } from '@/components/marketplace/shared/price'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function ProductTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'digital':
      return <Download size={14} />
    case 'physical':
      return <Package size={14} />
    case 'freelance':
      return <Briefcase size={14} />
    default:
      return <Package size={14} />
  }
}

export default function AdminProducts() {
  const { setCurrentView } = useMarketplaceStore()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('__all__')
  const [statusFilter, setStatusFilter] = useState<string>('__all__')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | undefined> = {
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
        sortBy: 'newest',
      }
      if (search) params.query = search
      if (typeFilter !== '__all__') params.type = typeFilter

      const res = await api.products.getProducts(params as any)
      if (res.data) {
        const data = res.data as any
        if (data.items) {
          setProducts(data.items)
          setTotalPages(data.totalPages)
          setTotalProducts(data.total)
        }
      }
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, typeFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleApproveProduct = async (productId: string) => {
    try {
      await api.admin.approveProduct(productId)
      fetchProducts()
    } catch {
      // silent fail
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    try {
      await api.products.deleteProduct(productId)
      fetchProducts()
    } catch {
      // silent fail
    }
  }

  const handleViewProduct = (productId: string) => {
    setCurrentView('product-detail', { productId })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Product Management</h2>
          <p className="text-sm text-muted-foreground">
            {totalProducts} total products
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 sm:w-64"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Shop</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const images = safeJsonParse<string[]>(product.images, [])
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {images[0] ? (
                              <img
                                src={images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ProductTypeIcon type={product.type} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-48">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.totalSales} sales
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs gap-1">
                          <ProductTypeIcon type={product.type} />
                          {PRODUCT_TYPE_LABELS[product.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Price amount={product.price ?? 0} size="sm" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {product.shop?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            product.isApproved
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {product.isApproved ? 'Approved' : product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                              <Eye size={14} className="mr-2" />
                              View
                            </DropdownMenuItem>
                            {!product.isApproved && (
                              <DropdownMenuItem onClick={() => handleApproveProduct(product.id)}>
                                <CheckCircle size={14} className="mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleRemoveProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
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
