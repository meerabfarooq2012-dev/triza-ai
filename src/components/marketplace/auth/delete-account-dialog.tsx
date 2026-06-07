'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { currentUser, logout } = useMarketplaceStore()
  const [password, setPassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [reason, setReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)

  const isDeleteEnabled =
    password.length > 0 &&
    deleteConfirmation === 'DELETE' &&
    !isDeleting &&
    !isDeleted

  const handleDelete = async () => {
    if (!currentUser || !isDeleteEnabled) return

    setIsDeleting(true)
    try {
      const authToken = useMarketplaceStore.getState().authToken
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          userId: currentUser.id,
          password,
          reason: reason.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to delete account')
        setIsDeleting(false)
        return
      }

      setIsDeleted(true)
      toast.success('Account deleted successfully')

      // Wait 3 seconds, then redirect to landing
      setTimeout(() => {
        logout()
        onOpenChange(false)
      }, 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account'
      toast.error(message)
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (isDeleting) return
    if (isDeleted) {
      logout()
    }
    setPassword('')
    setDeleteConfirmation('')
    setReason('')
    setIsDeleted(false)
    setIsDeleting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isDeleted ? (
          // Success state
          <div className="py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Account Deleted</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Your account has been successfully deleted. You will be redirected shortly.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting...
            </div>
          </div>
        ) : (
          // Deletion form
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Delete Your Account
              </DialogTitle>
              <DialogDescription className="text-left pt-2">
                This action is permanent and cannot be undone. Please read carefully before proceeding.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Warning box */}
              <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-red-800 dark:text-red-300">
                    <p className="font-semibold">The following will happen when you delete your account:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                      <li>Your profile information will be permanently deleted</li>
                      <li>Your shop and all products will be removed</li>
                      <li>Your order history will be anonymized</li>
                      <li>Your reviews, wishlists, and favorites will be removed</li>
                      <li>Your messages and notifications will be deleted</li>
                      <li>This action <strong>CANNOT</strong> be undone</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Password confirmation */}
              <div className="space-y-2">
                <Label htmlFor="delete-password" className="text-sm font-medium">
                  Confirm your password
                </Label>
                <Input
                  id="delete-password"
                  type="password"
                  placeholder="Enter your current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isDeleting}
                  className="border-muted"
                />
              </div>

              {/* Optional reason */}
              <div className="space-y-2">
                <Label htmlFor="delete-reason" className="text-sm font-medium">
                  Reason for leaving{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="delete-reason"
                  placeholder="Tell us why you're leaving (helps us improve)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isDeleting}
                  rows={3}
                  className="resize-none border-muted"
                />
              </div>

              {/* DELETE confirmation input */}
              <div className="space-y-2">
                <Label htmlFor="delete-confirm" className="text-sm font-medium">
                  Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  placeholder='Type "DELETE" here'
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  disabled={isDeleting}
                  className={`border-muted ${
                    deleteConfirmation.length > 0 && deleteConfirmation !== 'DELETE'
                      ? 'border-red-400 focus-visible:ring-red-400'
                      : deleteConfirmation === 'DELETE'
                      ? 'border-amber-400 focus-visible:ring-amber-400'
                      : ''
                  }`}
                />
                {deleteConfirmation.length > 0 && deleteConfirmation !== 'DELETE' && (
                  <p className="text-xs text-red-500">Please type exactly &quot;DELETE&quot; to confirm</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!isDeleteEnabled}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                      Delete My Account
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
