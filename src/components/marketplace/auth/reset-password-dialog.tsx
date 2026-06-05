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
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token?: string
}

export function ResetPasswordDialog({ open, onOpenChange, token: tokenProp }: ResetPasswordDialogProps) {
  const [token, setToken] = useState(tokenProp || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { setCurrentView } = useMarketplaceStore()

  const hasMinLength = newPassword.length >= 6
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword
  const passwordsMismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const resetToken = tokenProp || token
    if (!resetToken) {
      setError('Reset token is missing. Please use the link from your email.')
      return
    }
    if (!newPassword) {
      setError('Please enter a new password')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
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

    setIsLoading(true)
    try {
      const res = await api.auth.resetPassword(resetToken, newPassword)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || 'Failed to reset password')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    onOpenChange(false)
    setCurrentView('auth')
  }

  const handleReset = () => {
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess(false)
    if (!tokenProp) setToken('')
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Enter your new password to regain access to your account.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center space-y-4"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Your password has been reset successfully!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can now sign in with your new password.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleGoToLogin}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Login
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 pt-2"
            >
              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
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

              {/* Token input (only shown if token wasn't provided as prop) */}
              {!tokenProp && (
                <div className="space-y-2">
                  <Label htmlFor="reset-token">Reset Token</Label>
                  <Input
                    id="reset-token"
                    type="text"
                    placeholder="Paste the token from your email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
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
                disabled={isLoading || !hasMinLength || !passwordsMatch}
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                Reset Password
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
