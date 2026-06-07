'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { currentUser, setAuthToken, setRefreshToken } = useMarketplaceStore()

  const hasMinLength = newPassword.length >= 6
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword
  const passwordsMismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword) {
      setError('Current password is required')
      return
    }
    if (!newPassword) {
      setError('New password is required')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (!confirmPassword) {
      setError('Please confirm your new password')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!currentUser?.id) {
      setError('You must be logged in to change your password')
      return
    }

    setIsLoading(true)
    try {
      const res = await api.auth.changePassword(currentUser.id, currentPassword, newPassword)
      if (res.success) {
        // Update tokens if the API returned new ones
        const responseData = res as unknown as Record<string, unknown>
        if (responseData.token) {
          setAuthToken(responseData.token as string)
          const rt = responseData.refreshToken as string | undefined
          if (rt) {
            setRefreshToken(rt)
          }
          api.auth.setAuthCookies(responseData.token as string, rt).catch(() => {})
        }
        toast.success('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const msg = res.error || 'Failed to update password'
        setError(msg)
        toast.error(msg)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            key={error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/50 p-3 flex items-start gap-2"
          >
            <X className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="current-password">Current Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="current-password"
            type={showCurrentPassword ? 'text' : 'password'}
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="change-new-password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="change-new-password"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Min 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {newPassword.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-1.5"
          >
            {hasMinLength ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400">Minimum 6 characters</span>
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                <span className="text-xs text-red-500 dark:text-red-400">
                  {6 - newPassword.length} more character{6 - newPassword.length !== 1 ? 's' : ''} needed
                </span>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Confirm New Password */}
      <div className="space-y-2">
        <Label htmlFor="change-confirm-password">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="change-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`pl-10 pr-10 ${
              passwordsMismatch
                ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-500/30'
                : passwordsMatch
                ? 'border-green-400 dark:border-green-500 focus-visible:ring-green-500/30'
                : ''
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-1.5"
          >
            {passwordsMatch ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
              </>
            ) : passwordsMismatch ? (
              <>
                <X className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                <span className="text-xs text-red-500 dark:text-red-400">Passwords don&apos;t match</span>
              </>
            ) : null}
          </motion.div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
        disabled={isLoading || !currentPassword || !hasMinLength || !passwordsMatch}
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <KeyRound className="h-4 w-4 mr-2" />
        )}
        Update Password
      </Button>
    </form>
  )
}
