'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  Monitor,
  Smartphone,
  RefreshCw,
  Loader2,
  LogOut,
  Trash2,
  AlertTriangle,
  Globe,
  Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

interface SessionInfo {
  id: string
  deviceInfo: string | null
  ipAddress: string | null
  createdAt: string
  lastActiveAt: string
  expiresAt: string
  isCurrentSession: boolean
}

/**
 * Parse a User-Agent string into a human-readable device description
 */
function parseDeviceInfo(ua: string | null): { icon: React.ReactNode; label: string } {
  if (!ua) return { icon: <Monitor className="h-5 w-5" />, label: 'Unknown Device' }

  const uaLower = ua.toLowerCase()

  // Detect device type
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)
  const isTablet = /ipad|tablet|playbook|silk/i.test(ua)

  // Detect browser
  let browser = 'Unknown Browser'
  if (uaLower.includes('edg/')) browser = 'Edge'
  else if (uaLower.includes('opr/') || uaLower.includes('opera')) browser = 'Opera'
  else if (uaLower.includes('chrome/') && !uaLower.includes('edg/')) browser = 'Chrome'
  else if (uaLower.includes('safari/') && !uaLower.includes('chrome/')) browser = 'Safari'
  else if (uaLower.includes('firefox/')) browser = 'Firefox'

  // Detect OS
  let os = 'Unknown OS'
  if (uaLower.includes('windows')) os = 'Windows'
  else if (uaLower.includes('mac os')) os = 'macOS'
  else if (uaLower.includes('linux') && !uaLower.includes('android')) os = 'Linux'
  else if (uaLower.includes('android')) os = 'Android'
  else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS'
  else if (uaLower.includes('cros')) os = 'Chrome OS'

  const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop'
  const label = `${browser} on ${os} (${deviceType})`
  const icon = isTablet || isMobile ? (
    <Smartphone className="h-5 w-5" />
  ) : (
    <Monitor className="h-5 w-5" />
  )

  return { icon, label }
}

/**
 * Mask an IP address for privacy (e.g., 192.168.1.100 → 192.168.***.***)
 */
function maskIpAddress(ip: string | null): string {
  if (!ip) return 'Unknown'
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`
  }
  // IPv6 or other format — show first segment and mask the rest
  if (ip.includes(':')) {
    const v6Parts = ip.split(':')
    if (v6Parts.length >= 2) {
      return `${v6Parts[0]}:${v6Parts[1]}:****`
    }
  }
  return '***.***.***.***'
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function SessionManager() {
  const { currentUser, authToken } = useMarketplaceStore()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)
  const [isRevokingAll, setIsRevokingAll] = useState(false)
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false)

  const fetchSessions = useCallback(async () => {
    if (!authToken) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (data.success) {
        setSessions(data.data)
      } else {
        toast.error(data.error || 'Failed to load sessions')
      }
    } catch {
      toast.error('Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleRevokeSession = async (sessionId: string) => {
    if (!authToken) return
    setIsRevoking(sessionId)
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Session revoked successfully')
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      } else {
        toast.error(data.error || 'Failed to revoke session')
      }
    } catch {
      toast.error('Failed to revoke session')
    } finally {
      setIsRevoking(null)
    }
  }

  const handleRevokeAllOther = async () => {
    if (!authToken || !currentUser) return
    setIsRevokingAll(true)
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`${data.revokedCount} session(s) revoked`)
        // Refresh to only show current session
        await fetchSessions()
      } else {
        toast.error(data.error || 'Failed to revoke sessions')
      }
    } catch {
      toast.error('Failed to revoke sessions')
    } finally {
      setIsRevokingAll(false)
      setShowRevokeAllConfirm(false)
    }
  }

  const otherSessionsCount = sessions.filter((s) => !s.isCurrentSession).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSessions}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <CardDescription>
            Manage your active sessions across devices. Revoke any session you don&apos;t recognize.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <span className="ml-2 text-sm text-muted-foreground">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active sessions found.</p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {sessions.map((session, index) => {
                  const { icon, label } = parseDeviceInfo(session.deviceInfo)
                  return (
                    <div key={session.id}>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                        {/* Device icon */}
                        <div className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
                          {icon}
                        </div>

                        {/* Session details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{label}</p>
                            {session.isCurrentSession && (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0 text-[10px] px-1.5 py-0"
                              >
                                Current Session
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            {session.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {maskIpAddress(session.ipAddress)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active {formatRelativeTime(session.lastActiveAt)}
                            </span>
                          </div>

                          <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                            Signed in {formatRelativeTime(session.createdAt)}
                          </div>
                        </div>

                        {/* Revoke button */}
                        {!session.isCurrentSession && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={isRevoking === session.id}
                            className="shrink-0 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                          >
                            {isRevoking === session.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-1 text-xs">Revoke</span>
                          </Button>
                        )}
                      </div>
                      {index < sessions.length - 1 && <Separator className="my-0" />}
                    </div>
                  )
                })}
              </div>

              {/* Sign out all other devices */}
              {otherSessionsCount > 0 && (
                <>
                  <Separator className="my-2" />
                  {showRevokeAllConfirm ? (
                    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            Are you sure?
                          </p>
                          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                            This will sign out {otherSessionsCount} other device
                            {otherSessionsCount !== 1 ? 's' : ''}. You&apos;ll need to log in again on those devices.
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleRevokeAllOther}
                              disabled={isRevokingAll}
                              className="h-7 text-xs"
                            >
                              {isRevokingAll ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <LogOut className="h-3 w-3 mr-1" />
                              )}
                              Yes, Sign Out All
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowRevokeAllConfirm(false)}
                              disabled={isRevokingAll}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowRevokeAllConfirm(true)}
                      className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out All Other Devices ({otherSessionsCount})
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
