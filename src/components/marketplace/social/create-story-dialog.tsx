'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Image as ImageIcon,
  Type,
  Tag,
  Star,
  Upload,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface CreateStoryDialogProps {
  shopId: string
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

const STORY_TYPES = [
  { value: 'image', label: 'Image', icon: ImageIcon, desc: 'Share a photo' },
  { value: 'text', label: 'Text', icon: Type, desc: 'Share an update' },
  { value: 'promotion', label: 'Promotion', icon: Tag, desc: 'Announce a deal' },
  { value: 'product_highlight', label: 'Product Highlight', icon: Star, desc: 'Feature a product' },
] as const

export function CreateStoryDialog({
  shopId,
  userId,
  open,
  onOpenChange,
  onCreated,
}: CreateStoryDialogProps) {
  const [storyType, setStoryType] = useState<string>('image')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; images: string }>>([])
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)

  // Fetch shop products when product_highlight is selected
  const fetchProducts = async () => {
    if (products.length > 0) return
    setProductsLoading(true)
    try {
      const res = await fetch(`/api/products?shopId=${shopId}&limit=20`)
      const data = await res.json()
      if (data.success && data.data?.products) {
        setProducts(data.data.products)
      }
    } catch {
      // silently fail
    } finally {
      setProductsLoading(false)
    }
  }

  const handleTypeChange = (type: string) => {
    setStoryType(type)
    setImageUrl('')
    setContent('')
    setProductId('')
    if (type === 'product_highlight') {
      fetchProducts()
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl.trim()) {
      toast.error('Please add content or an image for your story')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/social/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          userId,
          type: storyType,
          content: content.trim() || null,
          imageUrl: imageUrl.trim() || null,
          productId: storyType === 'product_highlight' ? productId || null : null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Story posted! It will expire in 24 hours.')
        onCreated?.()
        onOpenChange(false)
        // Reset form
        setContent('')
        setImageUrl('')
        setProductId('')
        setStoryType('image')
      } else {
        toast.error(data.error || 'Failed to create story')
      }
    } catch {
      toast.error('Failed to create story')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = STORY_TYPES.find((t) => t.value === storyType)

  const renderPreview = () => {
    if (!content && !imageUrl) return null

    return (
      <div className="border rounded-xl overflow-hidden">
        <div
          className={`relative w-full h-48 flex items-center justify-center ${
            storyType === 'promotion'
              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
              : storyType === 'product_highlight'
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : null}
          {content && (
            <div className={`${imageUrl ? 'absolute inset-0 bg-black/40 flex items-end p-4' : 'p-6 text-center'}`}>
              <p className="text-white font-semibold text-sm leading-relaxed">
                {content}
              </p>
            </div>
          )}
          {!content && !imageUrl && (
            <p className="text-white/60 text-sm">Preview will appear here</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Story Type Selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Story Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {STORY_TYPES.map((type) => (
                <motion.button
                  key={type.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTypeChange(type.value)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-all ${
                    storyType === type.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <type.icon className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{type.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {type.desc}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Image URL Input (for image type) */}
          {(storyType === 'image' || storyType === 'promotion') && (
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Image URL
              </Label>
              <div className="relative">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="pr-10"
                />
                {imageUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setImageUrl('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Paste a URL or <button className="text-emerald-600 underline" onClick={() => {
                  // Generate a placeholder image URL for demo
                  setImageUrl(`https://picsum.photos/seed/${Date.now()}/600/400`)
                }}>use a sample image</button>
              </p>
            </div>
          )}

          {/* Content/Caption */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              {storyType === 'promotion' ? 'Promotion Details' : 
               storyType === 'product_highlight' ? 'Highlight Caption' :
               'Caption'}
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                storyType === 'promotion'
                  ? '🏷️ 50% off all products this weekend!'
                  : storyType === 'product_highlight'
                    ? '⭐ Check out our bestseller!'
                    : storyType === 'text'
                      ? 'What\'s new in your shop?'
                      : 'Add a caption to your story...'
              }
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {content.length}/200
            </p>
          </div>

          {/* Product Selector (for product_highlight type) */}
          {storyType === 'product_highlight' && (
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Select Product
              </Label>
              {productsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No products found. Add products to your shop first.
                </p>
              ) : (
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => {
                      const images = (() => {
                        try { return JSON.parse(product.images) as string[] } catch { return [] }
                      })()
                      return (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            {images[0] && (
                              <img
                                src={images[0]}
                                alt={product.name}
                                className="h-6 w-6 rounded object-cover"
                              />
                            )}
                            <span className="truncate max-w-[180px]">
                              {product.name}
                            </span>
                            <span className="text-muted-foreground">
                              ${product.price}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Preview */}
          {(content || imageUrl) && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Preview</Label>
              {renderPreview()}
            </div>
          )}

          {/* Expiry notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Upload className="h-3.5 w-3.5" />
            Stories automatically expire after 24 hours
          </div>

          {/* Submit */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && !imageUrl.trim())}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Story'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
