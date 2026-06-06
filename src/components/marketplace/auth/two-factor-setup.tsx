'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Smartphone, Key, Copy, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface TwoFactorSetupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

type SetupStep = 'authenticator' | 'verify' | 'backup-codes'

export function TwoFactorSetup({ open, onOpenChange, userId }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('authenticator')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [otpValue, setOtpValue] = useState('')
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState<'secret' | 'code' | null>(null)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('authenticator')
      setOtpValue('')
      setError('')
      setQrCodeUrl('')
      setSecretKey('')
      setBackupCodes([])
      setCopiedField(null)
    }
  }, [open])

  // Fetch setup data when dialog opens
  useEffect(() => {
    if (!open) return

    const fetchSetup = async () => {
      setIsLoading(true)
      try {
        const res = await api.twoFactor.setup()
        if (res.success && res.data) {
          setQrCodeUrl(res.data.qrCodeUrl)
          setSecretKey(res.data.manualEntryKey || res.data.secret)
          setBackupCodes(res.data.backupCodes)
        } else {
          setError(res.error || 'Failed to set up 2FA')
          toast.error('Failed to set up 2FA')
        }
      } catch {
        setError('Failed to set up 2FA. Please try again.')
        toast.error('Failed to set up 2FA')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSetup()
  }, [open])

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otpValue.length === 6 && step === 'verify') {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue, step])

  const handleVerify = useCallback(async () => {
    if (otpValue.length !== 6) return

    setIsVerifying(true)
    setError('')

    try {
      const res = await api.twoFactor.verify({
        userId,
        code: otpValue,
        setupMode: true,
      })

      if (res.success) {
        setStep('backup-codes')
        toast.success('2FA verified successfully!')
      } else {
        setError(res.error || 'Invalid code. Please try again.')
        setOtpValue('')
      }
    } catch {
      setError('Verification failed. Please try again.')
      setOtpValue('')
    } finally {
      setIsVerifying(false)
    }
  }, [otpValue, userId])

  const handleCopy = async (text: string, field: 'secret' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleCopyAllCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'))
      setCopiedField('code')
      toast.success('All backup codes copied!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error('Failed to copy codes')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {(['authenticator', 'verify', 'backup-codes'] as SetupStep[]).map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s
                  ? 'w-8 bg-amber-500'
                  : i < (step === 'authenticator' ? 0 : step === 'verify' ? 1 : 2)
                    ? 'w-8 bg-amber-300'
                    : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 'authenticator' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-2">
                <Smartphone className="h-6 w-6 text-amber-600" />
              </div>
              <DialogTitle className="text-xl">Set Up Authenticator</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app
              </DialogDescription>
            </DialogHeader>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                <p className="text-sm text-muted-foreground">Generating 2FA setup...</p>
              </div>
            ) : error && !qrCodeUrl ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-red-500">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setError('')
                    // Re-trigger setup
                    api.twoFactor.setup().then((res) => {
                      if (res.success && res.data) {
                        setQrCodeUrl(res.data.qrCodeUrl)
                        setSecretKey(res.data.manualEntryKey || res.data.secret)
                        setBackupCodes(res.data.backupCodes)
                      }
                    })
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 p-3 bg-white">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="2FA QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center bg-muted rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Key */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Can&apos;t scan? Enter manual key:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-mono break-all select-all">
                      {secretKey}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={() => handleCopy(secretKey, 'secret')}
                    >
                      {copiedField === 'secret' ? (
                        <Check className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setStep('verify')
                    setOtpValue('')
                    setError('')
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
                  disabled={isLoading || !qrCodeUrl}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Continue to Verification
                </Button>
              </div>
            )}
          </>
        )}

        {step === 'verify' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-2">
                <Key className="h-6 w-6 text-amber-600" />
              </div>
              <DialogTitle className="text-xl">Verify Setup</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
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

                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    {error}
                  </p>
                )}

                {isVerifying && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    Verifying...
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('authenticator')
                    setOtpValue('')
                    setError('')
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={otpValue.length !== 6 || isVerifying}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Verify
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'backup-codes' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-2">
                <Check className="h-6 w-6 text-amber-600" />
              </div>
              <DialogTitle className="text-xl">Backup Codes</DialogTitle>
              <DialogDescription>
                Save these backup codes in a secure location
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Warning */}
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Save these backup codes
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Each code can only be used once. Store them somewhere safe — you&apos;ll need them if you lose access to your authenticator.
                    </p>
                  </div>
                </div>
              </div>

              {/* Backup codes grid */}
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-muted/50 px-3 py-2 text-center font-mono text-sm select-all"
                  >
                    {code}
                  </div>
                ))}
              </div>

              {/* Copy all button */}
              <Button
                variant="outline"
                onClick={handleCopyAllCodes}
                className="w-full"
              >
                {copiedField === 'code' ? (
                  <Check className="h-4 w-4 mr-2 text-amber-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedField === 'code' ? 'Copied!' : 'Copy All Codes'}
              </Button>

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
