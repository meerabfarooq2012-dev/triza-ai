'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export interface EmailVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
  userEmail?: string
}

export function EmailVerificationDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
}: EmailVerificationDialogProps) {
  const [token, setToken] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const { login, currentUser } = useMarketplaceStore()
  const { toast } = useToast()

  // Auto-detect token from URL params (supports both ?verify= and ?token=)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('verify') || params.get('token')
      if (urlToken) {
        setToken(urlToken)
        // Auto-verify if token found in URL
        handleVerifyWithToken(urlToken)
      }
    }
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleVerify = async () => {
    if (!token.trim()) {
      setError('Please enter the verification token')
      return
    }
    await handleVerifyWithToken(token.trim())
  }

  const handleVerifyWithToken = async (verifyToken: string) => {

    setIsVerifying(true)
    setError('')

    try {
      const res = await api.auth.verifyEmail(verifyToken)
      if (res.success) {
        setIsVerified(true)
        // Update user state if logged in
        if (currentUser) {
          login({ ...currentUser, emailVerified: true })
        }
        toast({
          title: 'Email Verified!',
          description: 'Your email has been verified successfully.',
        })
      } else {
        setError(res.error || 'Verification failed')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      setError(message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!userId) {
      setError('Unable to resend — please log in and try again from your profile.')
      return
    }

    if (resendCooldown > 0) return

    setIsResending(true)
    setError('')

    try {
      const res = await api.auth.resendVerification(userId)
      if (res.success) {
        setResendCooldown(60) // 60-second cooldown
        toast({
          title: 'Verification Email Sent',
          description: `A new verification link has been sent to ${userEmail || 'your email'}.`,
        })
      } else {
        setError(res.error || 'Failed to resend verification email')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification email'
      setError(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isVerified}>
        <AnimatePresence mode="wait">
          {isVerified ? (
            <motion.div
              key="verified"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="flex flex-col items-center py-6 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40"
              >
                <CheckCircle2 className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400">
                Email Verified!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your email address has been verified successfully. You now have full access to all Thiora features.
              </p>
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg mt-2"
                size="lg"
              >
                Continue
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="verify-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                    <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <DialogTitle className="text-xl">Verify Your Email</DialogTitle>
                </div>
                <DialogDescription className="text-left">
                  {userEmail
                    ? `We've sent a verification link to ${userEmail}. Enter the token below or click the link in your email.`
                    : 'Enter the verification token sent to your email address.'}
                </DialogDescription>
              </DialogHeader>

              {/* Info banner */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Verifying your email unlocks full access to all Thiora features including buying, selling, and secure transactions.
                  </span>
                </p>
              </div>

              {/* Error display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-lg border border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/50 p-3 flex items-start gap-2"
                  >
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Token input */}
              <div className="space-y-2">
                <Label htmlFor="verify-token">Verification Token</Label>
                <Input
                  id="verify-token"
                  type="text"
                  placeholder="Paste the token from your email"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value)
                    setError('')
                  }}
                  disabled={isVerifying}
                  className="font-mono text-sm"
                />
              </div>

              {/* Verify button */}
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !token.trim()}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Verify Email
                  </>
                )}
              </Button>

              {/* Resend link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0 || !userId}
                  className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
