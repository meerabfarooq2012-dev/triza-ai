'use client'

import { useState } from 'react'
import { Shield, ShieldCheck, Key, Loader2, AlertTriangle } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import { TwoFactorSetup } from './two-factor-setup'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface TwoFactorProfileProps {
  userId: string
  twoFactorEnabled: boolean
}

export function TwoFactorProfile({ userId, twoFactorEnabled }: TwoFactorProfileProps) {
  const [showSetup, setShowSetup] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)

  // Regenerate state
  const [regenOtpValue, setRegenOtpValue] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenError, setRegenError] = useState('')
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])
  const [regenSuccess, setRegenSuccess] = useState(false)

  // Disable state
  const [disablePassword, setDisablePassword] = useState('')
  const [disableLoading, setDisableLoading] = useState(false)
  const [disableError, setDisableError] = useState('')

  const handleRegenerate = async () => {
    if (regenOtpValue.length !== 6) return

    setRegenLoading(true)
    setRegenError('')

    try {
      const res = await api.twoFactor.regenerateBackupCodes(regenOtpValue)
      if (res.success && res.data?.backupCodes) {
        setNewBackupCodes(res.data.backupCodes)
        setRegenSuccess(true)
        toast.success('Backup codes regenerated!')
      } else {
        setRegenError(res.error || 'Failed to regenerate backup codes')
        setRegenOtpValue('')
      }
    } catch {
      setRegenError('Failed to regenerate backup codes')
      setRegenOtpValue('')
    } finally {
      setRegenLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!disablePassword) return

    setDisableLoading(true)
    setDisableError('')

    try {
      const res = await api.twoFactor.disable(disablePassword)
      if (res.success) {
        toast.success('Two-factor authentication disabled')
        setShowDisableDialog(false)
        setDisablePassword('')
        // The parent component should re-fetch user data to update twoFactorEnabled
        // We can force a page refresh or update the store
        window.location.reload()
      } else {
        setDisableError(res.error || 'Failed to disable 2FA')
        setDisablePassword('')
      }
    } catch {
      setDisableError('Failed to disable 2FA')
      setDisablePassword('')
    } finally {
      setDisableLoading(false)
    }
  }

  return (
    <>
      <Card className="border-amber-200 dark:border-amber-800/50">
        <CardContent className="p-6">
          {!twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Shield className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication adds an additional layer of security by requiring more than just a password to sign in to your account.
                </p>
              </div>

              <Button
                onClick={() => setShowSetup(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
              >
                <Shield className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                    Two-Factor Authentication is enabled
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRegenOtpValue('')
                    setRegenError('')
                    setNewBackupCodes([])
                    setRegenSuccess(false)
                    setShowRegenerateDialog(true)
                  }}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Regenerate Backup Codes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDisablePassword('')
                    setDisableError('')
                    setShowDisableDialog(true)
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <TwoFactorSetup
        open={showSetup}
        onOpenChange={setShowSetup}
        userId={userId}
      />

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent className="sm:max-w-md">
          {!regenSuccess ? (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-2">
                  <Key className="h-6 w-6 text-amber-600" />
                </div>
                <DialogTitle className="text-xl">Regenerate Backup Codes</DialogTitle>
                <DialogDescription>
                  Enter your current authenticator code to generate new backup codes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {regenError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/50 p-3 flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{regenError}</p>
                  </div>
                )}

                <div className="flex flex-col items-center gap-4">
                  <InputOTP
                    maxLength={6}
                    value={regenOtpValue}
                    onChange={setRegenOtpValue}
                    disabled={regenLoading}
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
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRegenerateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    disabled={regenOtpValue.length !== 6 || regenLoading}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
                  >
                    {regenLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-2">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                </div>
                <DialogTitle className="text-xl">New Backup Codes</DialogTitle>
                <DialogDescription>
                  Save these new backup codes — your old ones are no longer valid
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      These codes replace your previous backup codes. Each code can only be used once.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {newBackupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-muted/50 px-3 py-2 text-center font-mono text-sm select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(newBackupCodes.join('\n')).then(() => {
                      toast.success('Codes copied!')
                    })
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Copy All Codes
                </Button>

                <Button
                  onClick={() => setShowRegenerateDialog(false)}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg"
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              This will reduce the security of your account. Please enter your password to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {disableError && (
              <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/50 p-3 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{disableError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                disabled={disableLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && disablePassword) {
                    handleDisable()
                  }
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDisableDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisable}
                disabled={!disablePassword || disableLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {disableLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Disable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
