'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListChecks,
  Plus,
  Share2,
  Lock,
  Globe,
  Trash2,
  X,
  ChevronLeft,
  ShoppingCart,
  Package,
  Link2,
  Copy,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Wishlist, WishlistItem, Product } from '@/types'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value as string) as T
  } catch {
    return fallback
  }
}

export function BuyerWishlists() {
  const { currentUser, setCurrentView, addToCart } = useMarketplaceStore()
  const { toast } = useToast()

  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIsPublic, setNewIsPublic] = useState(false)
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editWishlist, setEditWishlist] = useState<Wishlist | null>(null)
  const [editName, setEditName] = useState('')
  const [editIsPublic, setEditIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deleteWishlist, setDeleteWishlist] = useState<Wishlist | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Share
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Fetch wishlists
  const fetchWishlists = useCallback(async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/wishlists?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.success) {
        setWishlists(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error('Failed to fetch wishlists:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchWishlists()
  }, [fetchWishlists])

  // Fetch wishlist items
  const fetchWishlistItems = useCallback(async (wishlistId: string) => {
    if (!currentUser) return
    setLoadingItems(true)
    try {
      const res = await fetch(`/api/wishlists/${wishlistId}?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setSelectedWishlist(data.data)
        setWishlistItems(data.data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch wishlist items:', error)
    } finally {
      setLoadingItems(false)
    }
  }, [currentUser])

  // Create wishlist
  const handleCreate = async () => {
    if (!currentUser || !newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, name: newName.trim(), isPublic: newIsPublic }),
      })
      const data = await res.json()
      if (data.success) {
        setWishlists((prev) => [data.data, ...prev])
        setCreateOpen(false)
        setNewName('')
        setNewIsPublic(false)
        toast({ title: 'Wishlist created', description: `"${data.data.name}" is ready` })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create wishlist', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  // Update wishlist
  const handleUpdate = async () => {
    if (!currentUser || !editWishlist || !editName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/wishlists/${editWishlist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, name: editName.trim(), isPublic: editIsPublic }),
      })
      const data = await res.json()
      if (data.success) {
        setWishlists((prev) => prev.map((w) => (w.id === editWishlist.id ? { ...w, ...data.data } : w)))
        if (selectedWishlist?.id === editWishlist.id) {
          setSelectedWishlist((prev) => (prev ? { ...prev, ...data.data } : null))
        }
        setEditOpen(false)
        setEditWishlist(null)
        toast({ title: 'Wishlist updated' })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update wishlist', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Delete wishlist
  const handleDelete = async () => {
    if (!currentUser || !deleteWishlist) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/wishlists/${deleteWishlist.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setWishlists((prev) => prev.filter((w) => w.id !== deleteWishlist.id))
        if (selectedWishlist?.id === deleteWishlist.id) {
          setSelectedWishlist(null)
          setWishlistItems([])
        }
        setDeleteWishlist(null)
        toast({ title: 'Wishlist deleted' })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete wishlist', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  // Remove item from wishlist
  const handleRemoveItem = async (productId: string, productName: string) => {
    if (!currentUser || !selectedWishlist) return
    try {
      const res = await fetch(`/api/wishlists/${selectedWishlist.id}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        setWishlistItems((prev) => prev.filter((i) => i.productId !== productId))
        setWishlists((prev) =>
          prev.map((w) =>
            w.id === selectedWishlist.id
              ? { ...w, _count: { items: Math.max(0, (w._count?.items ?? 1) - 1) } }
              : w
          )
        )
        toast({ title: 'Removed', description: `"${productName}" removed from wishlist` })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' })
    }
  }

  // Share wishlist
  const handleShare = async (wishlist: Wishlist) => {
    if (!wishlist.isPublic) {
      // Prompt to make public first
      setEditWishlist(wishlist)
      setEditName(wishlist.name)
      setEditIsPublic(true) // Pre-set to public
      setEditOpen(true)
      toast({ title: 'Make it public first', description: 'Private wishlists cannot be shared. Make it public to get a shareable link.' })
      return
    }
    const url = `${window.location.origin}/?wishlist=${wishlist.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedSlug(wishlist.slug)
      toast({ title: 'Link copied!', description: 'Share this link with friends' })
      setTimeout(() => setCopiedSlug(null), 2000)
    } catch {
      // Fallback
      toast({ title: 'Share link', description: url })
    }
  }

  // Add to cart from wishlist
  const handleAddToCart = (item: WishlistItem) => {
    const product = item.product as Product | undefined
    if (!product) return
    const images = safeJsonParse<string[]>(product.images, [])
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: images[0] || null,
      type: product.type,
      stock: product.stock,
      shopName: product.shop?.name || 'Shop',
    })
    toast({ title: 'Added to cart', description: product.name })
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Detail view
  if (selectedWishlist) {
    return (
      <div className="space-y-6">
        {/* Back header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedWishlist(null); setWishlistItems([]) }}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{selectedWishlist.name}</h2>
                <Badge variant={selectedWishlist.isPublic ? 'default' : 'secondary'} className={cn('text-xs', selectedWishlist.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                  {selectedWishlist.isPublic ? <Globe className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                  {selectedWishlist.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare(selectedWishlist)}
            >
              {copiedSlug === selectedWishlist.slug ? <Check className="mr-1 h-4 w-4" /> : <Share2 className="mr-1 h-4 w-4" />}
              {copiedSlug === selectedWishlist.slug ? 'Copied!' : 'Share'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditWishlist(selectedWishlist)
                setEditName(selectedWishlist.name)
                setEditIsPublic(selectedWishlist.isPublic)
                setEditOpen(true)
              }}
            >
              Edit
            </Button>
          </div>
        </div>

        {/* Items */}
        {loadingItems ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square rounded-lg bg-muted" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16"
          >
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No items yet</h3>
            <p className="mt-1 text-sm text-gray-500">Add products to this wishlist from any product page</p>
            <Button className="mt-4" variant="outline" onClick={() => setCurrentView('search')}>
              Browse Products
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item, index) => {
                const product = item.product as Product | undefined
                if (!product) return null
                const images = safeJsonParse<string[]>(product.images, [])
                const inStock = product.type !== 'physical' || product.stock > 0

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Card className="group overflow-hidden border-0 shadow-sm transition-all hover:shadow-lg">
                      <div
                        className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                        onClick={() => setCurrentView('product-detail', { productId: product.id })}
                      >
                        {images[0] ? (
                          <img
                            src={images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <Package className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:bg-red-50 hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveItem(product.id, product.name)
                          }}
                        >
                          <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                        {!inStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Badge variant="destructive" className="text-xs font-semibold">
                              Out of Stock
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <h3
                          className="line-clamp-1 cursor-pointer text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors"
                          onClick={() => setCurrentView('product-detail', { productId: product.id })}
                        >
                          {product.name}
                        </h3>
                        {product.shop && (
                          <p className="text-xs text-gray-500 truncate">by {product.shop.name}</p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
                            ${(product.price ?? 0).toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              'h-8 gap-1.5 text-xs transition-all',
                              inStock
                                ? 'hover:bg-gradient-to-r hover:from-violet-600 hover:to-rose-500 hover:text-white hover:border-transparent'
                                : 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => handleAddToCart(item)}
                            disabled={!inStock}
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Wishlist</DialogTitle>
              <DialogDescription>Update your wishlist name and visibility settings.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Wishlist name"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="edit-public"
                  checked={editIsPublic}
                  onCheckedChange={setEditIsPublic}
                />
                <Label htmlFor="edit-public" className="flex items-center gap-2">
                  {editIsPublic ? <Globe className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-gray-400" />}
                  {editIsPublic ? 'Public — anyone with the link can view' : 'Private — only you can view'}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving || !editName.trim()}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 shadow-lg shadow-violet-200">
            <ListChecks className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Wishlists</h2>
            <p className="text-sm text-gray-500">
              {wishlists.length} list{wishlists.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-violet-600 to-purple-500 text-white border-0 ml-1">
            {wishlists.length}
          </Badge>
        </div>
        <Button
          className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white shadow-lg shadow-violet-200"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Wishlist
        </Button>
      </div>

      {/* Empty state */}
      {wishlists.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-b from-violet-50/50 to-transparent py-20"
        >
          <div className="rounded-full bg-violet-100 p-4 mb-4">
            <ListChecks className="h-10 w-10 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No wishlists yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
            Create wishlists to organize products you love. Share them with friends or keep them private.
          </p>
          <Button
            className="mt-6 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white shadow-lg shadow-violet-200"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Wishlist
          </Button>
        </motion.div>
      )}

      {/* Wishlists grid */}
      {wishlists.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {wishlists.map((wishlist, index) => (
              <motion.div
                key={wishlist.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group cursor-pointer border-0 shadow-sm transition-all hover:shadow-lg" onClick={() => fetchWishlistItems(wishlist.id)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold line-clamp-1">{wishlist.name}</CardTitle>
                      <Badge
                        variant={wishlist.isPublic ? 'default' : 'secondary'}
                        className={cn(
                          'text-[10px] ml-2 shrink-0',
                          wishlist.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {wishlist.isPublic ? <Globe className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                        {wishlist.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {wishlist._count?.items ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">items</p>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-violet-600"
                          onClick={() => handleShare(wishlist)}
                          title={wishlist.isPublic ? 'Copy share link' : 'Make public to share'}
                        >
                          {copiedSlug === wishlist.slug ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600"
                          onClick={() => setDeleteWishlist(wishlist)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400">
                      Created {new Date(wishlist.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Wishlist</DialogTitle>
            <DialogDescription>Organize products you love into shareable lists.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wishlist-name">Name</Label>
              <Input
                id="wishlist-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Birthday Gifts, Home Decor"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="wishlist-public"
                checked={newIsPublic}
                onCheckedChange={setNewIsPublic}
              />
              <Label htmlFor="wishlist-public" className="flex items-center gap-2">
                {newIsPublic ? <Globe className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-gray-400" />}
                {newIsPublic ? 'Public — anyone with the link can view' : 'Private — only you can view'}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteWishlist} onOpenChange={(open) => !open && setDeleteWishlist(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteWishlist?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this wishlist and remove all {deleteWishlist?._count?.items ?? 0} items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
