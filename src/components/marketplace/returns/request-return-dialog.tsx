'use client'

import { useState, useEffect, useRef } from 'react'
import {
  RotateCcw,
  Loader2,
  ImagePlus,
  X,
  Package,
  AlertCircle,
  Cloud,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { ReturnReason, ReturnType } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RequestReturnDialogProps {
  orderId: string
  userId: string
  shopId: string
  orderStatus: string
  onSubmitted?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REASON_OPTIONS: { value: ReturnReason; label: string; icon: string }[] = [
  { value: 'damaged', label: 'Damaged', icon: '📦' },
  { value: 'defective', label: 'Defective', icon: '⚠️' },
  { value: 'wrong_item', label: 'Wrong Item', icon: '🔄' },
  { value: 'not_as_described', label: 'Not as Described', icon: '📋' },
  { value: 'changed_mind', label: 'Changed Mind', icon: '💭' },
  { value: 'other', label: 'Other', icon: '❓' },
]

const TYPE_OPTIONS: { value: ReturnType; label: string; description: string }[] = [
  { value: 'return', label: 'Return & Refund', description: 'Ship item back and receive a refund' },
  { value: 'exchange', label: 'Exchange', description: 'Ship item back and receive a replacement' },
  { value: 'refund_only', label: 'Refund Only', description: 'Keep the item and receive a partial/full refund' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RequestReturnDialog({
  orderId,
  userId,
  shopId,
  orderStatus,
  onSubmitted,
  open,
  onOpenChange,
}: RequestReturnDialogProps) {
  const [reason, setReason] = useState<ReturnReason | ''>('')
  const [type, setType] = useState<ReturnType>('return')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Auto-select type based on order status
  useEffect(() => {
    if (open) {
      if (orderStatus === 'shipped') {
        setType('refund_only')
      } else if (orderStatus === 'delivered') {
        setType('return')
      }
    }
  }, [open, orderStatus])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setReason('')
      setDescription('')
      setImages([])
    }
  }, [open])

  const handleImageAdd = () => {
    // Open file picker instead of using placeholder
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remaining = 5 - images.length
    if (remaining <= 0) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)
    setUploadingEvidence(true)

    for (const file of filesToUpload) {
      // Validate client-side
      if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
        toast.error(`${file.name}: Invalid file type. Allowed: JPG, PNG, WebP, GIF`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 5MB)`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'evidence')

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (data.success && data.url) {
          setImages((prev) => [...prev, data.url])
          toast.success(`${file.name} uploaded ✓`)
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`)
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setUploadingEvidence(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason for your return')
      return
    }
    if (!description.trim()) {
      toast.error('Please describe the issue')
      return
    }
    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userId,
          shopId,
          reason,
          description: description.trim(),
          images: images.length > 0 ? images : undefined,
          type,
        }),
      })
      const json = await res.json()

      if (json.success) {
        toast.success('Return request submitted successfully!')
        onOpenChange(false)
        onSubmitted?.()
      } else {
        toast.error(json.error || 'Failed to submit return request')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-emerald-600" />
            Request Return / Refund
          </DialogTitle>
          <DialogDescription>
            Submit a return or refund request for this order
          </DialogDescription>
        </DialogHeader>

        {/* Order Info */}
        <div className="rounded-lg bg-muted/50 border p-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              Order #{orderId.slice(-8)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                {orderStatus}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Reason */}
        <div className="space-y-1.5">
          <Label htmlFor="return-reason">Reason *</Label>
          <Select
            value={reason}
            onValueChange={(v) => setReason(v as ReturnReason)}
          >
            <SelectTrigger id="return-reason">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REASON_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <span>{opt.icon}</span>
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>Return Type *</Label>
          <div className="grid grid-cols-1 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                  type === opt.value
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/30'
                }`}
              >
                <div
                  className={`flex h-5 w-5 mt-0.5 shrink-0 items-center justify-center rounded-full border-2 ${
                    type === opt.value
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-muted-foreground/40'
                  }`}
                >
                  {type === opt.value && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${type === opt.value ? 'text-emerald-700' : ''}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="return-description">Description *</Label>
          <Textarea
            id="return-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail..."
            rows={4}
            className="resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            {description.length}/500 characters (minimum 10)
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Evidence (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative h-16 w-16 rounded-lg border bg-muted overflow-hidden group"
              >
                <img
                  src={img}
                  alt={`Evidence ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {img.startsWith('http') && (
                  <span className="absolute bottom-0.5 left-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Cloud className="h-2 w-2" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleImageRemove(idx)}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {uploadingEvidence && (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </div>
            )}
            {images.length < 5 && !uploadingEvidence && (
              <button
                type="button"
                onClick={handleImageAdd}
                className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploadingEvidence}
          />
          <p className="text-[11px] text-muted-foreground">
            Upload up to 5 images as evidence ({images.length}/5) — JPG, PNG, WebP, GIF, max 5MB each
          </p>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Your request will be reviewed by the seller. You&apos;ll receive a notification once they respond.
            {type === 'return' && ' You may need to ship the item back to the seller.'}
            {type === 'exchange' && ' The seller will arrange a replacement item for you.'}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={submitting || !reason || !description.trim()}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
