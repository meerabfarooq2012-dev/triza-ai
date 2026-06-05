'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Trash2,
  FolderPlus,
  MoreHorizontal,
  Search,
  ShoppingCart,
  ArrowDown,
  ArrowUp,
  Bell,
  BellOff,
  Package,
  ExternalLink,
  Pencil,
  Folder,
  X,
  Download,
  Briefcase,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PRODUCT_TYPE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type {
  WishlistItem,
  WishlistCollection,
  ProductType,
  CartItem,
} from '@/types'

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type SortOption = 'recent' | 'price_low' | 'price_high' | 'name_az' | 'price_drop'
type FilterType = 'all' | 'product' | 'gig'

interface ParsedWishlistItem extends Omit<WishlistItem, 'product' | 'gig'> {
  product?: (WishlistItem['product'] & { images?: string[] }) | null
  gig?: (WishlistItem['gig'] & { images?: string[] }) | null
  priceDropPercent?: number | null
}

interface ParsedCollection extends Omit<WishlistCollection, '_count' | 'items'> {
  itemCount: number
}

const COLLECTION_ICONS = [
  { value: 'heart', label: 'Heart', Icon: Heart },
  { value: 'folder', label: 'Folder', Icon: Folder },
  { value: 'star', label: 'Star', Icon: Package },
  { value: 'shopping', label: 'Shopping', Icon: ShoppingCart },
]

const COLLECTION_COLORS = [
  '#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#84cc16',
]

const typeBadgeStyles: Record<string, string> = {
  digital: 'bg-violet-100 text-violet-700',
  physical: 'bg-orange-100 text-orange-700',
  freelance: 'bg-emerald-100 text-emerald-700',
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function getItemName(item: ParsedWishlistItem): string {
  return item.product?.name || item.gig?.title || 'Untitled'
}

function getItemImage(item: ParsedWishlistItem): string | null {
  const productImages = (item.product as { images?: string[] })?.images
  const gigImages = (item.gig as { images?: string[] })?.images
  if (productImages && Array.isArray(productImages) && productImages.length > 0) return productImages[0]
  if (gigImages && Array.isArray(gigImages) && gigImages.length > 0) return gigImages[0]
  return null
}

function getItemType(item: ParsedWishlistItem): string {
  if (item.product) return (item.product as { type?: string }).type || 'physical'
  if (item.gig) return 'freelance'
  return 'physical'
}

function getShopName(item: ParsedWishlistItem): string {
  const shop = (item.product as { shop?: { name?: string } })?.shop ||
    (item.gig as { shop?: { name?: string } })?.shop
  return shop?.name || 'Shop'
}

// ---------------------------------------------------------------------------
// CollectionFormDialog — used for both Create and Edit
// ---------------------------------------------------------------------------

function CollectionFormDialog({
  open,
  onOpenChange,
  title,
  description,
  name,
  onNameChange,
  icon,
  onIconChange,
  color,
  onColorChange,
  onConfirm,
  confirmLabel,
  confirmDisabled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  name: string
  onNameChange: (v: string) => void
  icon: string
  onIconChange: (v: string) => void
  color: string
  onColorChange: (v: string) => void
  onConfirm: () => void
  confirmLabel: string
  confirmDisabled: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name</label>
            <Input
              placeholder="Collection name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onConfirm() }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Icon</label>
            <div className="flex gap-2">
              {COLLECTION_ICONS.map((ic) => (
                <button
                  key={ic.value}
                  onClick={() => onIconChange(ic.value)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all',
                    icon === ic.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <ic.Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onColorChange(c)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    color === c
                      ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                      : 'border-transparent hover:border-gray-300'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// WishlistItemCard
// ---------------------------------------------------------------------------

function WishlistItemCard({
  item,
  collections,
  onRemove,
  onToggleNotify,
  onMoveToCollection,
  onAddToCart,
  onItemClick,
}: {
  item: ParsedWishlistItem
  collections: ParsedCollection[]
  onRemove: (id: string) => void
  onToggleNotify: (item: ParsedWishlistItem, field: 'notifyPriceDrop' | 'notifyRestock') => void
  onMoveToCollection: (item: ParsedWishlistItem, collectionId: string | null) => void
  onAddToCart: (item: ParsedWishlistItem) => void
  onItemClick: (item: ParsedWishlistItem) => void
}) {
  const name = getItemName(item)
  const image = getItemImage(item)
  const itemType = getItemType(item)
  const shopName = getShopName(item)
  const isProduct = !!item.product
  const priceDrop = item.priceDropPercent
  const priceIncrease = item.priceWhenSaved > 0 && item.currentPrice > item.priceWhenSaved
    ? Math.round(((item.currentPrice - item.priceWhenSaved) / item.priceWhenSaved) * 10000) / 100
    : null

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="group overflow-hidden border-0 shadow-sm transition-all hover:shadow-lg">
        {/* Image */}
        <div
          className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
          onClick={() => onItemClick(item)}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              {isProduct ? (
                <Package className="h-12 w-12 text-muted-foreground/30" />
              ) : (
                <Briefcase className="h-12 w-12 text-muted-foreground/30" />
              )}
            </div>
          )}

          {/* Type badge */}
          <Badge
            className={cn(
              'absolute left-2 top-2 gap-1 text-[10px] font-medium border-0',
              typeBadgeStyles[itemType] || 'bg-gray-100 text-gray-700'
            )}
          >
            {itemType === 'digital' && <Download className="h-3 w-3" />}
            {itemType === 'physical' && <Package className="h-3 w-3" />}
            {itemType === 'freelance' && <Briefcase className="h-3 w-3" />}
            {PRODUCT_TYPE_LABELS[itemType as ProductType] || (isProduct ? 'Product' : 'Gig')}
          </Badge>

          {/* Price drop badge */}
          {priceDrop && priceDrop > 0 && (
            <Badge className="absolute right-2 top-2 gap-1 text-[10px] font-medium bg-emerald-100 text-emerald-700 border-0">
              <ArrowDown className="h-3 w-3" />
              {priceDrop}% ↓
            </Badge>
          )}

          {/* Price increase badge */}
          {priceIncrease && priceIncrease > 0 && (
            <Badge className="absolute right-2 top-2 gap-1 text-[10px] font-medium bg-amber-100 text-amber-700 border-0">
              <ArrowUp className="h-3 w-3" />
              {priceIncrease}% ↑
            </Badge>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-4 space-y-2.5">
          {/* Name */}
          <h3
            className="line-clamp-1 cursor-pointer text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
            onClick={() => onItemClick(item)}
          >
            {name}
          </h3>

          {/* Shop name */}
          <p className="text-xs text-gray-500 truncate">by {shopName}</p>

          {/* Price info */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${item.currentPrice.toFixed(2)}
            </span>
            {item.priceWhenSaved !== item.currentPrice && item.priceWhenSaved > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ${item.priceWhenSaved.toFixed(2)}
              </span>
            )}
          </div>

          {/* Price drop indicator */}
          {priceDrop && priceDrop > 0 && (
            <div className="flex items-center gap-1.5">
              <Badge className="gap-1 text-[10px] bg-emerald-100 text-emerald-700 border-0 font-medium">
                <ArrowDown className="h-3 w-3" />
                Price dropped {priceDrop}%!
              </Badge>
            </div>
          )}

          {/* Price increase indicator */}
          {priceIncrease && priceIncrease > 0 && (
            <div className="flex items-center gap-1.5">
              <Badge className="gap-1 text-[10px] bg-amber-100 text-amber-700 border-0 font-medium">
                <ArrowUp className="h-3 w-3" />
                Price up {priceIncrease}%
              </Badge>
            </div>
          )}

          {/* Notes preview */}
          {item.notes && (
            <p className="text-xs text-muted-foreground line-clamp-1 italic">
              &ldquo;{item.notes}&rdquo;
            </p>
          )}

          {/* Notification toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleNotify(item, 'notifyPriceDrop')}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                item.notifyPriceDrop ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              )}
              title={item.notifyPriceDrop ? 'Price drop alerts on' : 'Price drop alerts off'}
            >
              {item.notifyPriceDrop ? (
                <Bell className="h-3.5 w-3.5" />
              ) : (
                <BellOff className="h-3.5 w-3.5" />
              )}
              Price
            </button>
            {isProduct && (
              <button
                onClick={() => onToggleNotify(item, 'notifyRestock')}
                className={cn(
                  'flex items-center gap-1 text-xs transition-colors',
                  item.notifyRestock ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                )}
                title={item.notifyRestock ? 'Restock alerts on' : 'Restock alerts off'}
              >
                <Package className="h-3.5 w-3.5" />
                Restock
              </button>
            )}
          </div>

          {/* Date saved */}
          <p className="text-[10px] text-gray-400">
            Saved {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>

          {/* Actions row */}
          <div className="flex items-center gap-2 pt-1">
            {isProduct ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs flex-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                onClick={() => onAddToCart(item)}
              >
                <ShoppingCart className="h-3 w-3" />
                Add to Cart
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs flex-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                onClick={() => onItemClick(item)}
              >
                <ExternalLink className="h-3 w-3" />
                View Gig
              </Button>
            )}

            {/* Move to collection */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Move to collection">
                  <FolderPlus className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onMoveToCollection(item, null)}>
                  <Folder className="mr-2 h-3.5 w-3.5" />
                  Uncategorized
                </DropdownMenuItem>
                {collections
                  .filter((c) => !c.isDefault)
                  .map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onClick={() => onMoveToCollection(item, col.id)}
                      className={cn(item.collectionId === col.id && 'font-semibold')}
                    >
                      <span
                        className="mr-2 h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: col.color || '#10b981' }}
                      />
                      {col.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Remove */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove from Wishlist?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove &quot;{name}&quot; from your wishlist. You can always add it back later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// CollectionsSidebarContent
// ---------------------------------------------------------------------------

function CollectionsSidebarContent({
  mobile,
  collections,
  activeCollectionId,
  totalItemCount,
  uncategorizedCount,
  onSetActiveCollection,
  onEditCollection,
  onDeleteCollection,
  createCollectionOpen,
  onCreateCollectionOpenChange,
  newCollectionName,
  onNewCollectionNameChange,
  newCollectionIcon,
  onNewCollectionIconChange,
  newCollectionColor,
  onNewCollectionColorChange,
  onCreateCollection,
}: {
  mobile: boolean
  collections: ParsedCollection[]
  activeCollectionId: string | null
  totalItemCount: number
  uncategorizedCount: number
  onSetActiveCollection: (id: string | null) => void
  onEditCollection: (col: ParsedCollection) => void
  onDeleteCollection: (id: string) => void
  createCollectionOpen: boolean
  onCreateCollectionOpenChange: (open: boolean) => void
  newCollectionName: string
  onNewCollectionNameChange: (v: string) => void
  newCollectionIcon: string
  onNewCollectionIconChange: (v: string) => void
  newCollectionColor: string
  onNewCollectionColorChange: (v: string) => void
  onCreateCollection: () => void
}) {
  return (
    <div className={cn('space-y-1', mobile && 'p-3')}>
      {/* All Items */}
      <button
        onClick={() => onSetActiveCollection(null)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          !activeCollectionId
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-gray-600 hover:bg-gray-50'
        )}
      >
        <Heart className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">All Items</span>
        <span className="text-xs text-muted-foreground">{totalItemCount}</span>
      </button>

      {/* User collections */}
      {collections.map((col) => (
        <div key={col.id} className="group relative">
          <button
            onClick={() => onSetActiveCollection(col.id)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
              activeCollectionId === col.id
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: col.color || '#10b981' }}
            />
            <span className="flex-1 text-left truncate">{col.name}</span>
            <span className="text-xs text-muted-foreground">{col.itemCount}</span>
          </button>
          {/* Edit/delete menu for non-default collections */}
          {!col.isDefault && !mobile && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => onEditCollection(col)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{col.name}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the collection. Items will be moved to Uncategorized. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => onDeleteCollection(col.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      ))}

      {/* Uncategorized */}
      <button
        onClick={() => onSetActiveCollection('__uncategorized__')}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
          activeCollectionId === '__uncategorized__'
            ? 'bg-emerald-50 text-emerald-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50'
        )}
      >
        <Folder className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="flex-1 text-left">Uncategorized</span>
        <span className="text-xs text-muted-foreground">{uncategorizedCount}</span>
      </button>

      <Separator className="my-2" />

      {/* Create collection button */}
      <Dialog open={createCollectionOpen} onOpenChange={onCreateCollectionOpenChange}>
        <DialogTrigger asChild>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-all">
            <FolderPlus className="h-4 w-4" />
            <span>New Collection</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Organize your wishlist items into collections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => onNewCollectionNameChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onCreateCollection() }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Icon</label>
              <div className="flex gap-2">
                {COLLECTION_ICONS.map((ic) => (
                  <button
                    key={ic.value}
                    onClick={() => onNewCollectionIconChange(ic.value)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all',
                      newCollectionIcon === ic.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <ic.Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onNewCollectionColorChange(c)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all',
                      newCollectionColor === c
                        ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                        : 'border-transparent hover:border-gray-300'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onCreateCollectionOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={onCreateCollection}
              disabled={!newCollectionName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// WishlistPage (main component)
// ---------------------------------------------------------------------------

export function WishlistPage() {
  const { currentUser, setCurrentView, addToCart } = useMarketplaceStore()

  // Data state
  const [items, setItems] = useState<ParsedWishlistItem[]>([])
  const [collections, setCollections] = useState<ParsedCollection[]>([])

  // Filter / sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)

  // Dialog state
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false)
  const [editCollectionOpen, setEditCollectionOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<ParsedCollection | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionIcon, setNewCollectionIcon] = useState('heart')
  const [newCollectionColor, setNewCollectionColor] = useState('#10b981')

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  // Data state
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const params = new URLSearchParams({ userId: currentUser.id })
    if (activeCollectionId && activeCollectionId !== '__uncategorized__') {
      params.set('collectionId', activeCollectionId)
    }
    if (filterType !== 'all') params.set('type', filterType)
    if (searchQuery.trim()) params.set('search', searchQuery.trim())

    let cancelled = false
    Promise.all([
      fetch(`/api/wishlist?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setItems(d.success && d.data?.items ? d.data.items : []) })
        .catch(() => { if (!cancelled) setItems([]) }),
      fetch(`/api/wishlist/collections?userId=${currentUser.id}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setCollections(d.success && d.data?.collections ? d.data.collections : []) })
        .catch(() => { if (!cancelled) setCollections([]) }),
    ]).then(() => { if (!cancelled) setDataLoaded(true) })
    return () => { cancelled = true }
  }, [currentUser, activeCollectionId, filterType, searchQuery])

  const refreshItems = async () => {
    if (!currentUser) return
    try {
      const params = new URLSearchParams({ userId: currentUser.id })
      if (activeCollectionId && activeCollectionId !== '__uncategorized__') {
        params.set('collectionId', activeCollectionId)
      }
      if (filterType !== 'all') params.set('type', filterType)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      const res = await fetch(`/api/wishlist?${params.toString()}`)
      const data = await res.json()
      setItems(data.success && data.data?.items ? data.data.items : [])
    } catch { setItems([]) }
  }

  const refreshCollections = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/wishlist/collections?userId=${currentUser.id}`)
      const data = await res.json()
      setCollections(data.success && data.data?.collections ? data.data.collections : [])
    } catch { setCollections([]) }
  }

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------

  const uncategorizedCount = useMemo(() => items.filter((i) => !i.collectionId).length, [items])

  const sortedItems = useMemo(() => {
    let filtered = [...items]
    if (activeCollectionId === '__uncategorized__') {
      filtered = filtered.filter((i) => !i.collectionId)
    }
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price_low':
        filtered.sort((a, b) => a.currentPrice - b.currentPrice)
        break
      case 'price_high':
        filtered.sort((a, b) => b.currentPrice - a.currentPrice)
        break
      case 'name_az':
        filtered.sort((a, b) => {
          const nA = a.product?.name || a.gig?.title || ''
          const nB = b.product?.name || b.gig?.title || ''
          return nA.localeCompare(nB)
        })
        break
      case 'price_drop':
        filtered.sort((a, b) => (b.priceDropPercent ?? 0) - (a.priceDropPercent ?? 0))
        break
    }
    return filtered
  }, [items, sortBy, activeCollectionId])

  const totalItemCount = items.length

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleRemoveItem = async (itemId: string) => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/wishlist/${itemId}?userId=${currentUser.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId))
        toast.success('Removed from wishlist')
        refreshCollections()
      } else { toast.error(data.error || 'Failed to remove item') }
    } catch { toast.error('Failed to remove item') }
  }

  const handleToggleNotify = async (item: ParsedWishlistItem, field: 'notifyPriceDrop' | 'notifyRestock') => {
    if (!currentUser) return
    const newValue = !item[field]
    try {
      const res = await fetch(`/api/wishlist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, [field]: newValue }),
      })
      const data = await res.json()
      if (data.success) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, [field]: newValue } : i)))
        toast.success(newValue ? 'Notification enabled' : 'Notification disabled')
      }
    } catch { toast.error('Failed to update notification') }
  }

  const handleMoveToCollection = async (item: ParsedWishlistItem, collectionId: string | null) => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/wishlist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, collectionId }),
      })
      const data = await res.json()
      if (data.success) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, collectionId } : i)))
        toast.success('Item moved')
        refreshCollections()
      } else { toast.error(data.error || 'Failed to move item') }
    } catch { toast.error('Failed to move item') }
  }

  const handleAddToCart = (item: ParsedWishlistItem) => {
    if (!item.product) return
    const images = item.product.images || []
    addToCart({
      productId: item.product.id,
      shopId: item.product.shopId,
      name: item.product.name,
      price: item.currentPrice,
      quantity: 1,
      image: images[0] || null,
      type: (item.product as { type?: ProductType }).type || 'physical',
      stock: (item.product as { stock?: number }).stock ?? 1,
      shopName: (item.product as { shop?: { name?: string } }).shop?.name || 'Shop',
    } as CartItem)
    toast.success('Added to cart')
  }

  const handleItemClick = (item: ParsedWishlistItem) => {
    if (item.product) setCurrentView('product-detail', { productId: item.product.id })
    else if (item.gig) setCurrentView('gig-detail', { gigId: item.gig.id })
  }

  const resetCollectionForm = () => {
    setNewCollectionName('')
    setNewCollectionIcon('heart')
    setNewCollectionColor('#10b981')
  }

  const handleCreateCollection = async () => {
    if (!currentUser || !newCollectionName.trim()) return
    try {
      const res = await fetch('/api/wishlist/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, name: newCollectionName.trim(), icon: newCollectionIcon, color: newCollectionColor }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Collection created')
        setCreateCollectionOpen(false)
        resetCollectionForm()
        refreshCollections()
      } else { toast.error(data.error || 'Failed to create collection') }
    } catch { toast.error('Failed to create collection') }
  }

  const handleUpdateCollection = async () => {
    if (!currentUser || !editingCollection || !newCollectionName.trim()) return
    try {
      const res = await fetch(`/api/wishlist/collections/${editingCollection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, name: newCollectionName.trim(), icon: newCollectionIcon, color: newCollectionColor }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Collection updated')
        setEditCollectionOpen(false)
        setEditingCollection(null)
        resetCollectionForm()
        refreshCollections()
      } else { toast.error(data.error || 'Failed to update collection') }
    } catch { toast.error('Failed to update collection') }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/wishlist/collections/${collectionId}?userId=${currentUser.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Collection deleted')
        if (activeCollectionId === collectionId) setActiveCollectionId(null)
        refreshCollections()
        refreshItems()
      } else { toast.error(data.error || 'Failed to delete collection') }
    } catch { toast.error('Failed to delete collection') }
  }

  const openEditCollection = (col: ParsedCollection) => {
    setEditingCollection(col)
    setNewCollectionName(col.name)
    setNewCollectionIcon(col.icon || 'heart')
    setNewCollectionColor(col.color || '#10b981')
    setEditCollectionOpen(true)
  }

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  // Loading: show skeleton if we have a user but haven't loaded data yet
  // If there's no user, the auth guard in page.tsx handles redirect, so we show loading
  if (!dataLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <Skeleton className="aspect-square rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (items.length === 0 && !searchQuery && filterType === 'all' && !activeCollectionId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-transparent py-20">
          <div className="rounded-full bg-emerald-100 p-5 mb-4">
            <Heart className="h-12 w-12 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Your Wishlist is Empty</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
            Start adding products and gigs you love by tapping the heart icon. They&apos;ll appear here so you can track prices and find them easily.
          </p>
          <Button
            className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
            onClick={() => setCurrentView('search')}
          >
            <Search className="mr-2 h-4 w-4" />
            Start Browsing
          </Button>
        </div>
      </motion.div>
    )
  }

  // ---------------------------------------------------------------------------
  // Shared props for sidebar
  // ---------------------------------------------------------------------------

  const sidebarProps = {
    mobile: false,
    collections,
    activeCollectionId,
    totalItemCount,
    uncategorizedCount,
    onSetActiveCollection: setActiveCollectionId,
    onEditCollection: openEditCollection,
    onDeleteCollection: handleDeleteCollection,
    createCollectionOpen,
    onCreateCollectionOpenChange: setCreateCollectionOpen,
    newCollectionName,
    onNewCollectionNameChange: setNewCollectionName,
    newCollectionIcon,
    onNewCollectionIconChange: setNewCollectionIcon,
    newCollectionColor,
    onNewCollectionColorChange: setNewCollectionColor,
    onCreateCollection: handleCreateCollection,
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg shadow-emerald-200">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500">
              {totalItemCount} item{totalItemCount !== 1 ? 's' : ''}
              {activeCollectionId && activeCollectionId !== '__uncategorized__' && (
                <> in {collections.find((c) => c.id === activeCollectionId)?.name || 'Collection'}</>
              )}
              {activeCollectionId === '__uncategorized__' && ' in Uncategorized'}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
            {totalItemCount}
          </Badge>
        </div>

        {/* Mobile collection selector */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span className="flex items-center gap-2">
                  {activeCollectionId === '__uncategorized__' ? (
                    <>
                      <Folder className="h-4 w-4 text-gray-400" />
                      Uncategorized
                    </>
                  ) : activeCollectionId ? (
                    <>
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: collections.find((c) => c.id === activeCollectionId)?.color || '#10b981' }}
                      />
                      {collections.find((c) => c.id === activeCollectionId)?.name || 'Collection'}
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      All Items
                    </>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
              <CollectionsSidebarContent {...sidebarProps} mobile />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search + Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wishlist..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {([
            { key: 'all' as const, label: 'All' },
            { key: 'product' as const, label: 'Products' },
            { key: 'gig' as const, label: 'Gigs' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap',
                filterType === key
                  ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px] h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="name_az">Name A-Z</SelectItem>
            <SelectItem value="price_drop">Price Drop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <Card className="border shadow-sm h-fit sticky top-24">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Collections</h3>
              <CollectionsSidebarContent {...sidebarProps} mobile={false} />
            </CardContent>
          </Card>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {sortedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16"
            >
              <Search className="mb-3 h-10 w-10 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? 'Try a different search term'
                  : filterType !== 'all'
                  ? `No ${filterType === 'product' ? 'products' : 'gigs'} in this collection`
                  : 'This collection is empty'}
              </p>
              {(searchQuery || filterType !== 'all' || activeCollectionId) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => { setSearchQuery(''); setFilterType('all'); setActiveCollectionId(null) }}
                >
                  Show All Items
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {sortedItems.map((item) => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    collections={collections}
                    onRemove={handleRemoveItem}
                    onToggleNotify={handleToggleNotify}
                    onMoveToCollection={handleMoveToCollection}
                    onAddToCart={handleAddToCart}
                    onItemClick={handleItemClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Collection Dialog */}
      <CollectionFormDialog
        open={editCollectionOpen}
        onOpenChange={(open) => { setEditCollectionOpen(open); if (!open) { setEditingCollection(null); resetCollectionForm() } }}
        title="Edit Collection"
        description="Update your collection details."
        name={newCollectionName}
        onNameChange={setNewCollectionName}
        icon={newCollectionIcon}
        onIconChange={setNewCollectionIcon}
        color={newCollectionColor}
        onColorChange={setNewCollectionColor}
        onConfirm={handleUpdateCollection}
        confirmLabel="Save Changes"
        confirmDisabled={!newCollectionName.trim()}
      />
    </div>
  )
}
