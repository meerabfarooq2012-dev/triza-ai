'use client'

import { useState, useEffect } from 'react'
import { Shield, Loader2, Key } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface TwoFactorVerifyProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  email: string
  tempToken: string
}

export function TwoFactorVerify({ open, onOpenChange, userId, email, tempToken }: TwoFactorVerifyProps) {
  const [otpValue, setOtpValue] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  const { login, setAuthToken, setCurrentView } = useMarketplaceStore()

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setOtpValue('')
      setBackupCode('')
      setUseBackupCode(false)
      setError('')
    }
  }, [open])

  // Auto-submit when 6 digits are entered (TOTP mode only)
  useEffect(() => {
    if (otpValue.length === 6 && !useBackupCode && open) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue, useBackupCode, open])

  const handleVerify = async () => {
    const code = useBackupCode ? backupCode.trim() : otpValue

    if (!code || (useBackupCode && code.length === 0)) return
    if (!useBackupCode && code.length !== 6) return

    setIsVerifying(true)
    setError('')

    try {
      // Set the temp token as auth token for the 2FA verify request
      setAuthToken(tempToken)

      const res = await api.twoFactor.verify({
        userId,
        code,
      })

      if (res.success && res.data) {
        // Store the real token
        const token = res.data.token
        if (token) {
          setAuthToken(token)
        }

        // Update user state
        const user = res.data.user
        if (user) {
          login(user)
          // Navigate based on role
          if (user.isAdmin) {
            setCurrentView('admin')
          } else if (user.role === 'seller' || user.role === 'both') {
            setCurrentView('seller-dashboard')
          } else {
            setCurrentView('buyer-dashboard')
          }
        }

        onOpenChange(false)
        toast.success('Two-factor authentication verified!')
      } else {
        setError(res.error || 'Invalid code. Please try again.')
        if (!useBackupCode) {
          setOtpValue('')
        }
      }
    } catch {
      setError('Verification failed. Please try again.')
      if (!useBackupCode) {
        setOtpValue('')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 mb-2">
            <Shield className="h-7 w-7 text-amber-500" />
          </div>
          <DialogTitle className="text-xl">Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/50 p-3 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {!useBackupCode ? (
            <div className="flex flex-col items-center gap-4">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {isVerifying && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  Verifying...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="backup-code">Backup Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="backup-code"
                    placeholder="Enter your backup code"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    className="pl-10 uppercase font-mono"
                    disabled={isVerifying}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && backupCode.trim()) {
                        handleVerify()
                      }
                    }}
                  />
                </div>
              </div>

              {isVerifying && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  Verifying...
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={
              isVerifying ||
              (!useBackupCode ? otpValue.length !== 6 : !backupCode.trim())
            }
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Verify
          </Button>

          {/* Toggle between TOTP and backup code */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode)
                setError('')
                setOtpValue('')
                setBackupCode('')
              }}
              className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
              disabled={isVerifying}
            >
              {useBackupCode
                ? 'Use authenticator code instead'
                : 'Use backup code instead'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
