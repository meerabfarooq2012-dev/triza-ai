'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Package,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
  Tag,
  X,
  Globe,
  Check,
  ChevronDown,
  Upload,
  Cloud,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import {
  PRODUCT_TYPE_LABELS,
  DEFAULT_CATEGORIES,
  PHYSICAL_CATEGORIES,
  DIGITAL_CATEGORIES,
} from '@/lib/constants'
import { countryCodeData } from '@/lib/country-codes'
import type { Product, ProductType, Category } from '@/types'

interface ProductFormData {
  name: string
  description: string
  shortDesc: string
  price: string
  comparePrice: string
  type: ProductType
  categoryId: string
  subcategoryId: string
  stock: string
  tags: string
  deliveryInfo: string
  deliveryCountries: string[] // array of country codes
  requirements: string
  isFeatured: boolean
  images: string[] // base64 encoded images
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  shortDesc: '',
  price: '',
  comparePrice: '',
  type: 'digital',
  categoryId: '',
  subcategoryId: '',
  stock: '-1',
  tags: '',
  deliveryInfo: '',
  deliveryCountries: [],
  requirements: '',
  isFeatured: false,
  images: [],
}

const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: 'digital', label: 'Digital Product' },
  { value: 'physical', label: 'Physical Product' },
]

// ---- Image Uploader Component ----
function ImageUploader({ images, onImagesChange, maxImages = 5, label = 'Images', folder = 'products' }: {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
  folder?: string
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processFiles = async (filesToProcess: File[]) => {
    const remaining = maxImages - images.length
    if (remaining <= 0) return
    const files = filesToProcess.slice(0, remaining)

    setUploading(true)
    const newImages: string[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) continue // Skip > 5MB

      try {
        // Try cloud upload first
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (data.success && data.url) {
          // Cloud upload succeeded - use the cloud URL
          newImages.push(data.url)
        } else {
          // Cloud upload not available - fall back to base64
          const base64 = await fileToBase64(file)
          newImages.push(base64)
        }
      } catch {
        // Error - fall back to base64
        const base64 = await fileToBase64(file)
        newImages.push(base64)
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
    }
    setUploading(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    await processFiles(Array.from(files))
    e.target.value = '' // Reset input
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const isCloudImage = (img: string) => img.startsWith('http')

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <ImageIcon className="h-4 w-4 text-gray-500" />
        {label}
        <span className="text-xs text-gray-400">
          ({images.length}/{maxImages})
        </span>
      </Label>

      {/* Drop zone */}
      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 ${uploading ? 'pointer-events-none' : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (uploading) return
          const files = e.dataTransfer.files
          if (!files) return
          processFiles(Array.from(files))
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium text-emerald-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">
              Drag & drop or click to upload
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Max {maxImages} images, 5MB each (jpg, png, gif, webp)
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {/* Preview thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div key={index} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Cloud badge */}
              {isCloudImage(img) && (
                <span className="absolute bottom-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Cloud className="h-2.5 w-2.5" />
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Country Multi-Select Component ----
function CountryMultiSelect({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (codes: string[]) => void
}) {
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = countryCodeData.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  const toggleCountry = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code))
    } else {
      onChange([...selected, code])
    }
  }

  const selectAll = () => {
    onChange(countryCodeData.map((c) => c.code))
  }

  const clearAll = () => {
    onChange([])
  }

  const getCountryName = (code: string) => {
    const country = countryCodeData.find((c) => c.code === code)
    return country ? `${country.flag} ${country.name}` : code
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected countries display + trigger */}
      <div
        className="min-h-[42px] flex flex-wrap gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 cursor-text"
        onClick={() => {
          setDropdownOpen(!dropdownOpen)
          setSearch('')
        }}
      >
        {selected.length === 0 ? (
          <span className="text-sm text-gray-400 select-none">
            Select countries you can deliver to...
          </span>
        ) : (
          selected.slice(0, 5).map((code) => (
            <Badge
              key={code}
              variant="outline"
              className="gap-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              {getCountryName(code)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCountry(code)
                }}
                className="ml-0.5 rounded-full hover:bg-emerald-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
        {selected.length > 5 && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
            +{selected.length - 5} more
          </Badge>
        )}
        <ChevronDown className="ml-auto h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-hidden">
          {/* Search + Actions */}
          <div className="border-b border-gray-100 p-2">
            <Input
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-1.5 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-emerald-600 hover:text-emerald-700"
                onClick={(e) => {
                  e.stopPropagation()
                  selectAll()
                }}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-red-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Country list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400">
                No country found
              </div>
            ) : (
              filtered.map((country) => {
                const isSelected = selected.includes(country.code)
                return (
                  <button
                    key={country.code}
                    type="button"
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-emerald-50' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCountry(country.code)
                    }}
                  >
                    <span className="flex-shrink-0">
                      {isSelected ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <span className="inline-block h-4 w-4 rounded border border-gray-300" />
                      )}
                    </span>
                    <span className="text-base">{country.flag}</span>
                    <span className={isSelected ? 'font-medium text-emerald-700' : 'text-gray-700'}>
                      {country.name}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">{country.code}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function SellerProducts() {
  const { currentUser } = useMarketplaceStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    if (!currentUser?.shop) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        shopId: currentUser.shop.id,
        page: String(page),
        limit: '10',
        showAll: 'true',
      })
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (searchQuery) params.set('query', searchQuery)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      if (data.success) {
        const items = data.data?.items || data.data?.products || []
        setProducts(items)
        setTotalPages(data.data?.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, page, typeFilter, searchQuery])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    let tags: string[] = []
    try {
      const raw = (product as Record<string, unknown>).tags
      tags = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
    } catch { tags = [] }
    let deliveryCountries: string[] = []
    try {
      const raw = (product as Record<string, unknown>).deliveryCountries
      const parsed = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
      deliveryCountries = Array.isArray(parsed) ? parsed : []
    } catch { deliveryCountries = [] }
    // Determine subcategoryId from category parent chain
    let subcategoryId = ''
    const catId = product.categoryId || ''
    // Check if the product's category is a subcategory (has parentId)
    const productCategory = categories.find(c => c.id === catId)
    if (productCategory?.parentId) {
      subcategoryId = catId
    }
    let images: string[] = []
    try {
      const raw = (product as Record<string, unknown>).images
      images = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
    } catch { images = [] }
    setFormData({
      name: product.name,
      description: product.description,
      shortDesc: product.shortDesc || '',
      price: String(product.price),
      comparePrice: String(product.comparePrice || ''),
      type: product.type,
      categoryId: productCategory?.parentId || catId,
      subcategoryId,
      stock: String(product.stock),
      tags: tags.join(', '),
      deliveryInfo: product.deliveryInfo || '',
      deliveryCountries,
      requirements: product.requirements || '',
      isFeatured: product.isFeatured,
      images,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!currentUser?.shop) return
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0')
      return
    }
    setSubmitting(true)
    try {
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        shopId: currentUser.shop.id,
        userId: currentUser.id,
        name: formData.name,
        description: formData.description,
        shortDesc: formData.shortDesc || undefined,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice
          ? parseFloat(formData.comparePrice)
          : undefined,
        type: formData.type,
        categoryId: formData.subcategoryId || formData.categoryId || undefined,
        stock: parseInt(formData.stock, 10),
        tags,
        deliveryInfo: formData.deliveryInfo || undefined,
        deliveryCountries: formData.deliveryCountries,
        requirements: formData.requirements || undefined,
        isFeatured: formData.isFeatured,
        images: formData.images,
      }

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) {
          toast.error(data.error || 'Failed to update product')
        } else {
          toast.success('Product updated successfully!')
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) {
          toast.error(data.error || 'Failed to create product')
        } else {
          toast.success('Product created successfully!')
        }
      }

      setDialogOpen(false)
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (product: Product) => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive, userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(product.isActive ? 'Product deactivated' : 'Product activated')
        fetchProducts()
      } else {
        toast.error(data.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Failed to toggle product:', error)
      toast.error('Failed to update product')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !currentUser) return
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Product deleted')
        fetchProducts()
      } else {
        toast.error(data.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product')
    } finally {
      setDeleteTarget(null)
    }
  }

  const filteredProducts = products.filter((p) => {
    if (statusFilter === 'active' && !p.isActive) return false
    if (statusFilter === 'inactive' && p.isActive) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PRODUCT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="h-12 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16"
        >
          <Package className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">No products yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first product to start selling
          </p>
          <Button
            className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleOpenAdd}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredProducts.map((product) => {
                    let images: string[] = []
                    try {
                      const raw = (product as Record<string, unknown>).images
                      images = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
                    } catch { images = [] }
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {images[0] ? (
                                <img
                                  src={images[0]}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900 max-w-[200px]">
                                {product.name}
                              </p>
                              {product.isFeatured && (
                                <Badge variant="outline" className="mt-0.5 text-[10px] text-amber-600 border-amber-200">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {PRODUCT_TYPE_LABELS[product.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              ${(product.price ?? 0).toFixed(2)}
                            </span>
                            {product.comparePrice && (
                              <span className="ml-1 text-xs text-gray-400 line-through">
                                ${(product.comparePrice ?? 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {product.stock === -1 ? '∞' : product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {product.totalSales}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              product.isActive
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(product)}
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleActive(product)}
                            >
                              {product.isActive ? (
                                <PowerOff className="h-4 w-4 text-amber-500" />
                              ) : (
                                <Power className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteTarget(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            <AnimatePresence>
              {filteredProducts.map((product) => {
                let images: string[] = []
                try {
                  const raw = (product as Record<string, unknown>).images
                  images = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
                } catch { images = [] }
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {images[0] ? (
                              <img
                                src={images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {product.name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">
                                {PRODUCT_TYPE_LABELS[product.type]}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  product.isActive
                                    ? 'text-[10px] bg-green-50 text-green-700'
                                    : 'text-[10px] bg-gray-50 text-gray-500'
                                }
                              >
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-bold text-emerald-600">
                                ${(product.price ?? 0).toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenEdit(product)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleToggleActive(product)}
                                >
                                  {product.isActive ? (
                                    <PowerOff className="h-3.5 w-3.5 text-amber-500" />
                                  ) : (
                                    <Power className="h-3.5 w-3.5 text-green-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setDeleteTarget(product)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

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
        </>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter product name"
              />
            </div>

            {/* Product Images */}
            <ImageUploader
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={5}
              label="Product Images"
            />

            {/* Short Description */}
            <div className="grid gap-2">
              <Label htmlFor="shortDesc">Short Description</Label>
              <Input
                id="shortDesc"
                value={formData.shortDesc}
                onChange={(e) =>
                  setFormData({ ...formData, shortDesc: e.target.value })
                }
                placeholder="Brief product description"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed product description"
                rows={4}
              />
            </div>

            {/* Price & Compare Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comparePrice">Compare Price ($)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.comparePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, comparePrice: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Product Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      type: v as ProductType,
                      categoryId: '',
                      subcategoryId: '',
                      stock: v === 'digital' ? '-1' : (formData.stock === '-1' ? '0' : formData.stock),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, categoryId: v, subcategoryId: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => {
                        if (!cat.children || cat.children.length > 0) return true
                        // Filter top-level categories based on product type
                        const physicalSlugs = PHYSICAL_CATEGORIES.map(c => c.slug)
                        const digitalSlugs = DIGITAL_CATEGORIES.map(c => c.slug)
                        if (formData.type === 'physical') return physicalSlugs.includes(cat.slug)
                        if (formData.type === 'digital') return digitalSlugs.includes(cat.slug)
                        return true
                      })
                      .filter((cat) => {
                        // Only show top-level categories that match the product type
                        const physicalSlugs = PHYSICAL_CATEGORIES.map(c => c.slug)
                        const digitalSlugs = DIGITAL_CATEGORIES.map(c => c.slug)
                        if (formData.type === 'physical') return physicalSlugs.includes(cat.slug)
                        if (formData.type === 'digital') return digitalSlugs.includes(cat.slug)
                        return true
                      })
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    }
                    {categories.length === 0 &&
                      DEFAULT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subcategory (shown when selected category has children) */}
            {formData.categoryId && (() => {
              const selectedCat = categories.find(c => c.id === formData.categoryId)
              return selectedCat?.children && selectedCat.children.length > 0
            })() && (
              <div className="grid gap-2">
                <Label>Subcategory</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, subcategoryId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .find(c => c.id === formData.categoryId)
                      ?.children?.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Stock */}
            <div className="grid gap-2">
              <Label htmlFor="stock">
                Stock Quantity{' '}
                {formData.type === 'digital' && (
                  <span className="text-xs text-gray-400">
                    (-1 for unlimited)
                  </span>
                )}
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                disabled={formData.type === 'digital'}
                placeholder={formData.type === 'digital' ? 'Unlimited' : '0'}
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">
                Tags{' '}
                <span className="text-xs text-gray-400">
                  (comma separated)
                </span>
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="design, template, modern"
              />
            </div>

            {/* Delivery Information (for physical) */}
            {formData.type === 'physical' && (
              <div className="grid gap-2">
                <Label htmlFor="deliveryInfo">Delivery Information</Label>
                <Textarea
                  id="deliveryInfo"
                  value={formData.deliveryInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryInfo: e.target.value })
                  }
                  placeholder="Delivery timeline and details"
                  rows={2}
                />
              </div>
            )}

            {/* Delivery Countries */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-gray-500" />
                Delivery Countries
                <span className="text-xs text-gray-400">
                  ({(formData.deliveryCountries || []).length} selected)
                </span>
              </Label>
              <CountryMultiSelect
                selected={formData.deliveryCountries || []}
                onChange={(countries) =>
                  setFormData({ ...formData, deliveryCountries: countries })
                }
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-medium">Featured Product</Label>
                <p className="text-xs text-gray-500">
                  Featured products appear prominently in your shop
                </p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !formData.name ||
                !formData.description ||
                !formData.price
              }
            >
              {submitting
                ? 'Saving...'
                : editingProduct
                ? 'Update Product'
                : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
