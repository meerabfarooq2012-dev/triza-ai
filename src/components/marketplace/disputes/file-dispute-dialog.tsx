'use client'

import { useState, useEffect } from 'react'
import {
  Scale,
  Loader2,
  Paperclip,
  Upload,
  X,
  Package,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Camera,
  Receipt,
  File,
  Flag,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Price, formatPriceUtil } from '@/components/marketplace/shared/price'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import type { DisputeCategory, DisputePriority } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FileDisputeDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (disputeId: string) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REASON_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'item_not_received', label: 'Item Not Received', icon: '📦' },
  { value: 'item_not_as_described', label: 'Item Not as Described', icon: '📋' },
  { value: 'damaged_item', label: 'Damaged Item', icon: '💔' },
  { value: 'defective_item', label: 'Defective Item', icon: '⚠️' },
  { value: 'wrong_item_received', label: 'Wrong Item Received', icon: '🔄' },
  { value: 'unauthorized_charge', label: 'Unauthorized Charge', icon: '💳' },
  { value: 'other', label: 'Other', icon: '❓' },
]

const CATEGORY_OPTIONS: { value: DisputeCategory; label: string }[] = [
  { value: 'product_issue', label: 'Product Issue' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'shipping_issue', label: 'Shipping Issue' },
  { value: 'communication_issue', label: 'Communication Issue' },
  { value: 'other', label: 'Other' },
]

const PRIORITY_OPTIONS: { value: DisputePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'normal', label: 'Normal', color: 'text-sky-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
]

const EVIDENCE_TYPE_OPTIONS: { value: string; label: string; icon: typeof ImageIcon }[] = [
  { value: 'image', label: 'Image', icon: ImageIcon },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'screenshot', label: 'Screenshot', icon: Camera },
  { value: 'receipt', label: 'Receipt', icon: Receipt },
  { value: 'other', label: 'Other', icon: File },
]

interface EvidenceItem {
  fileUrl: string
  type: string
  description: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FileDisputeDialog({
  userId,
  open,
  onOpenChange,
  onCreated,
}: FileDisputeDialogProps) {
  const [reason, setReason] = useState('')
  const [category, setCategory] = useState<DisputeCategory>('product_issue')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<DisputePriority>('normal')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [orders, setOrders] = useState<Array<{ id: string; totalAmount: number; status: string; createdAt: string; items?: Array<{ product?: { name?: string } }> }>>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Evidence state
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [evidenceType, setEvidenceType] = useState('image')
  const [evidenceDescription, setEvidenceDescription] = useState('')
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [createdDisputeId, setCreatedDisputeId] = useState<string | null>(null)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setReason('')
      setCategory('product_issue')
      setDescription('')
      setPriority('normal')
      setSelectedOrderId('')
      setEvidenceUrl('')
      setEvidenceType('image')
      setEvidenceDescription('')
      setEvidenceList([])
      setCreatedDisputeId(null)
    }
  }, [open])

  // Fetch user's orders
  useEffect(() => {
    if (!open || !userId) return
    setLoadingOrders(true)
    fetch(`/api/orders?userId=${userId}&role=buyer&limit=20`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const data = json.data?.orders ?? json.data ?? []
          setOrders(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => {
        toast.error('Failed to load orders')
      })
      .finally(() => setLoadingOrders(false))
  }, [open, userId])

  const handleAddEvidence = () => {
    if (!evidenceUrl.trim()) {
      toast.error('Please enter a URL for the evidence')
      return
    }
    if (evidenceList.length >= 10) {
      toast.error('Maximum 10 evidence items allowed')
      return
    }
    setEvidenceList((prev) => [
      ...prev,
      { fileUrl: evidenceUrl.trim(), type: evidenceType, description: evidenceDescription.trim() },
    ])
    setEvidenceUrl('')
    setEvidenceDescription('')
    toast.success('Evidence added')
  }

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      toast.error('Please select an order')
      return
    }
    if (!reason) {
      toast.error('Please select a reason')
      return
    }
    if (!description.trim()) {
      toast.error('Please describe the issue')
      return
    }
    if (description.trim().length < 20) {
      toast.error('Description must be at least 20 characters')
      return
    }

    setSubmitting(true)
    try {
      // Find the order to get sellerId and shopId
      const selectedOrder = orders.find((o) => o.id === selectedOrderId)
      const sellerId = (selectedOrder as Record<string, unknown>)?.sellerId as string || ''
      const shopId = (selectedOrder as Record<string, unknown>)?.shopId as string || ''

      // Create the dispute
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          userId,
          sellerId,
          shopId: shopId || undefined,
          reason,
          category,
          description: description.trim(),
          priority,
        }),
      })
      const json = await res.json()

      if (json.success) {
        const disputeId = json.data?.id || json.data?.disputeId || ''
        setCreatedDisputeId(disputeId)

        // Upload evidence items
        if (evidenceList.length > 0 && disputeId) {
          for (const ev of evidenceList) {
            try {
              await fetch(`/api/disputes/${disputeId}/evidence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  disputeId,
                  uploadedBy: userId,
                  type: ev.type,
                  fileUrl: ev.fileUrl,
                  description: ev.description,
                }),
              })
            } catch {
              // Silently continue if evidence upload fails
            }
          }
        }

        toast.success('Dispute filed successfully!')
        onCreated?.(disputeId)
      } else {
        toast.error(json.error || 'Failed to file dispute')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    const found = EVIDENCE_TYPE_OPTIONS.find((t) => t.value === type)
    return found ? found.icon : File
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-600" />
            File a Dispute
          </DialogTitle>
          <DialogDescription>
            Submit a dispute for an order issue. Our team will review your case.
          </DialogDescription>
        </DialogHeader>

        {/* Success State */}
        {createdDisputeId ? (
          <div className="py-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 mx-auto">
              <CheckCircle2 className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold">Dispute Filed Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Your dispute <span className="font-semibold">#{createdDisputeId.slice(-8)}</span> has been submitted.
              Our team will review it and get back to you.
            </p>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => onOpenChange(false)}
            >
              <ChevronRight className="h-4 w-4 mr-1.5" />
              View Dispute
            </Button>
          </div>
        ) : (
          <>
            {/* Order Selector */}
            <div className="space-y-1.5">
              <Label>Order *</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingOrders ? 'Loading orders...' : 'Select an order'} />
                </SelectTrigger>
                <SelectContent>
                  {orders.length === 0 ? (
                    <SelectItem value="_none" disabled>No orders found</SelectItem>
                  ) : (
                    orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        <span className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          #{order.id.slice(-8)} — <Price amount={order.totalAmount ?? 0} size="sm" />
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
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

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DisputeCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5" />
                Priority
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as DisputePriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={`flex items-center gap-2 ${opt.color}`}>
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="dispute-description">Description *</Label>
              <Textarea
                id="dispute-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail. Include what happened, when, and what resolution you're seeking..."
                rows={4}
                className="resize-none"
                maxLength={1000}
              />
              <p className="text-[11px] text-muted-foreground">
                {description.length}/1000 characters (minimum 20)
              </p>
            </div>

            <Separator />

            {/* Evidence Upload Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1.5">
                <Paperclip className="h-4 w-4" />
                Evidence (optional)
              </Label>

              {/* Add evidence form */}
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">URL *</Label>
                    <Input
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={evidenceType} onValueChange={setEvidenceType}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVIDENCE_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    placeholder="Brief description of this evidence"
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEvidence}
                  disabled={!evidenceUrl.trim()}
                  className="w-full"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Add Evidence
                </Button>
              </div>

              {/* Evidence list */}
              {evidenceList.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {evidenceList.map((ev, idx) => {
                    const TypeIcon = getTypeIcon(ev.type)
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2 group"
                      >
                        <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{ev.fileUrl}</p>
                          {ev.description && (
                            <p className="text-[10px] text-muted-foreground truncate">{ev.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 capitalize">
                          {ev.type}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(idx)}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                {evidenceList.length}/10 evidence items added
              </p>
            </div>

            {/* Info Banner */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Filing a dispute will notify the seller. Our support team will review the case
                and may request additional information. Please provide as much detail and evidence as possible.
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
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleSubmit}
                disabled={submitting || !selectedOrderId || !reason || !description.trim()}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit Dispute
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
