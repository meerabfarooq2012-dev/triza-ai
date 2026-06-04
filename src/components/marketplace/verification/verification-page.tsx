'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  XCircle,
  ShieldQuestion,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Award,
  TrendingUp,
  Star,
  ArrowLeft,
  RefreshCw,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useToast } from '@/hooks/use-toast'
import { TrustBadgeIcon } from './trust-badge-icon'
import { SellerTrustBadge } from './seller-trust-badge'
import { cn } from '@/lib/utils'
import { SellerTierCard } from './seller-tier-card'

// ==================== Types ====================
interface VerificationDoc {
  id: string
  documentType: string
  documentUrl: string
  documentNumber: string | null
  country: string | null
  status: string
  rejectionReason: string | null
  submittedAt: string
  reviewedAt: string | null
  createdAt: string
}

interface TrustScoreBreakdown {
  score: number
  max: number
  label: string
  description: string
}

interface TrustScoreData {
  score: number
  trustLevel: string
  breakdown: Record<string, TrustScoreBreakdown>
  levelThresholds: Record<string, { min: number; max: number }>
  currentLevel: { name: string; min: number; max: number }
  nextLevel: { name: string; min: number; max: number } | null
  progressToNext: number
}

interface BadgeData {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  criteria: Record<string, unknown>
  tier: string
  earned: boolean
  awardedAt: string | null
}

interface VerificationStatusData {
  verificationStatus: string
  verificationProgress: number
  documents: VerificationDoc[]
  sellerBadges: Array<{ id: string; badgeSlug: string; awardedAt: Date; expiresAt: Date | null }>
  stats: {
    totalDocuments: number
    verifiedDocuments: number
    pendingDocuments: number
    rejectedDocuments: number
    totalBadges: number
  }
  shop: {
    id: string
    name: string
    slug: string
    verificationStatus: string
    trustLevel: string
    trustScore: number
    badges: string[]
    verifiedAt: string | null
    totalSales: number
    totalReviews: number
    averageRating: number
  } | null
  user: {
    id: string
    name: string
    trustLevel: string
    isVerified: boolean
    verifiedAt: string | null
  }
}

// ==================== Constants ====================
const DOC_TYPES = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'business_license', label: 'Business License' },
  { value: 'tax_certificate', label: 'Tax Certificate' },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'bank_statement', label: 'Bank Statement' },
]

const COUNTRIES = [
  { value: 'PK', label: 'Pakistan' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AE', label: 'UAE' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'IN', label: 'India' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'TR', label: 'Turkey' },
  { value: 'MY', label: 'Malaysia' },
]

const STATUS_STEPS = ['none', 'pending', 'under_review', 'verified']
const STATUS_LABELS: Record<string, string> = {
  none: 'Not Started',
  pending: 'Pending Review',
  under_review: 'Under Review',
  verified: 'Verified',
  rejected: 'Rejected',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  none: <AlertCircle className="h-5 w-5 text-gray-400" />,
  pending: <Clock className="h-5 w-5 text-amber-500" />,
  under_review: <ShieldQuestion className="h-5 w-5 text-amber-500" />,
  verified: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  rejected: <XCircle className="h-5 w-5 text-red-500" />,
}

const TRUST_LEVEL_COLORS: Record<string, string> = {
  none: '#9ca3af',
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
}

// ==================== Circular Progress Component ====================
function CircularProgress({ value, size = 120, strokeWidth = 8, color = '#10b981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

// ==================== Skeleton Loader ====================
function VerificationSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

// ==================== Main Component ====================
export function VerificationPage() {
  const { currentUser, setCurrentView } = useMarketplaceStore()
  const { toast } = useToast()

  const [statusData, setStatusData] = useState<VerificationStatusData | null>(null)
  const [trustScoreData, setTrustScoreData] = useState<TrustScoreData | null>(null)
  const [badgesData, setBadgesData] = useState<{ badges: BadgeData[]; earnedCount: number; totalCount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [docType, setDocType] = useState('')
  const [country, setCountry] = useState('PK')
  const [docNumber, setDocNumber] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!currentUser?.id) return
    setLoading(true)
    setError(null)

    try {
      // Seed badges first
      await fetch('/api/verification/seed-badges', { method: 'POST' }).catch(() => {})

      // Fetch all data in parallel
      const [statusRes, scoreRes, badgesRes] = await Promise.all([
        fetch(`/api/verification/status?userId=${currentUser.id}`),
        currentUser.shop?.id
          ? fetch(`/api/verification/trust-score?shopId=${currentUser.shop.id}`)
          : Promise.resolve(null),
        currentUser.shop?.id
          ? fetch(`/api/verification/badges?shopId=${currentUser.shop.id}`)
          : Promise.resolve(null),
      ])

      const statusJson = await statusRes.json()
      if (statusJson.success) {
        setStatusData(statusJson.data)
      }

      if (scoreRes) {
        const scoreJson = await scoreRes.json()
        if (scoreJson.success) {
          setTrustScoreData(scoreJson.data)
        }
      }

      if (badgesRes) {
        const badgesJson = await badgesRes.json()
        if (badgesJson.success) {
          setBadgesData(badgesJson.data)
        }
      }
    } catch (err) {
      console.error('[VerificationPage] Fetch error:', err)
      setError('Failed to load verification data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id, currentUser?.shop?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async () => {
    if (!currentUser?.id || !currentUser?.shop?.id) return
    if (!docType) {
      toast({ title: 'Missing Document Type', description: 'Please select a document type.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          shopId: currentUser.shop.id,
          documentType: docType,
          country,
          documentNumber: docNumber || undefined,
          documentUrl: docUrl || undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Document Submitted', description: 'Your verification document has been submitted for review.' })
        setDocType('')
        setDocNumber('')
        setDocUrl('')
        fetchData()
      } else {
        toast({ title: 'Submission Failed', description: json.error || 'Unknown error', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to submit document.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <VerificationSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  if (!currentUser?.shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Shop Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You need a seller shop to access the Trust Center. Create a shop first to start the verification process.
        </p>
        <Button onClick={() => setCurrentView('seller-dashboard')}>
          Go to Seller Dashboard
        </Button>
      </div>
    )
  }

  const currentStatus = statusData?.verificationStatus || 'none'
  const documents = Array.isArray(statusData?.documents) ? statusData.documents : []
  const badges = Array.isArray(badgesData?.badges) ? badgesData.badges : []
  const shop = statusData?.shop

  const statusIndex = STATUS_STEPS.indexOf(currentStatus === 'rejected' ? 'none' : currentStatus)

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView('seller-dashboard')} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Trust Center</h1>
          <p className="text-sm text-muted-foreground">Manage your verification, trust score, and badges</p>
        </div>
        <div className="ml-auto">
          <SellerTrustBadge
            verificationStatus={currentStatus}
            trustLevel={shop?.trustLevel || 'none'}
            trustScore={shop?.trustScore}
            size="lg"
            showLabel
          />
        </div>
      </div>

      {/* 1. Verification Status Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Verification Status
            </CardTitle>
            <CardDescription>Track your seller verification progress</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= statusIndex
                const isCurrent = step === (currentStatus === 'rejected' ? 'none' : currentStatus)
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div
                        className={cn(
                          'absolute top-4 right-1/2 left-[-50%] h-0.5',
                          i <= statusIndex ? 'bg-emerald-500' : 'bg-muted'
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center z-10 transition-colors',
                        isActive ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground',
                        isCurrent && 'ring-2 ring-emerald-500 ring-offset-2'
                      )}
                    >
                      {i <= statusIndex ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{i + 1}</span>
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] mt-1 font-medium text-center',
                      isCurrent ? 'text-emerald-600' : 'text-muted-foreground'
                    )}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                )
              })}
            </div>

            {currentStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700">Verification Rejected</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Your verification was not approved. Please review your documents and resubmit with correct information.
                  </p>
                </div>
              </div>
            )}

            {currentStatus === 'verified' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-700">Verified Seller</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Your identity has been verified. You now have access to all seller features and trust badges.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Trust Score + Trust Level Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trust Score Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <CircularProgress
                  value={trustScoreData?.score ?? 0}
                  color={TRUST_LEVEL_COLORS[trustScoreData?.trustLevel || 'none']}
                />
                <div className="flex-1 space-y-2">
                  {trustScoreData?.breakdown && Object.entries(trustScoreData.breakdown).map(([key, item]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.score}/{item.max}</span>
                      </div>
                      <Progress value={(item.score / item.max) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Level Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                Trust Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                {/* Current Level */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-2 border-2"
                  style={{
                    borderColor: TRUST_LEVEL_COLORS[trustScoreData?.trustLevel || 'none'],
                    backgroundColor: `${TRUST_LEVEL_COLORS[trustScoreData?.trustLevel || 'none']}20`,
                  }}
                >
                  <Star
                    className="h-7 w-7"
                    style={{ color: TRUST_LEVEL_COLORS[trustScoreData?.trustLevel || 'none'] }}
                  />
                </div>
                <p className="font-bold text-lg capitalize">{trustScoreData?.trustLevel || 'None'}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {trustScoreData?.currentLevel
                    ? `Score range: ${trustScoreData.currentLevel.min}–${trustScoreData.currentLevel.max}`
                    : 'Start verifying to earn trust'}
                </p>

                {/* Progress to next tier */}
                {trustScoreData?.nextLevel && (
                  <div className="w-full">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress to <span className="capitalize font-medium">{trustScoreData.nextLevel.name}</span></span>
                      <span className="font-medium">{trustScoreData.progressToNext}%</span>
                    </div>
                    <Progress value={trustScoreData.progressToNext} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Need {trustScoreData.nextLevel.min - (trustScoreData.score)} more points to reach {trustScoreData.nextLevel.name}
                    </p>
                  </div>
                )}
                {!trustScoreData?.nextLevel && trustScoreData?.trustLevel === 'platinum' && (
                  <Badge className="bg-slate-100 text-slate-700 border-slate-200 mt-1">
                    Maximum Level Reached!
                  </Badge>
                )}

                {/* Level tiers overview */}
                <div className="w-full mt-4">
                  <div className="flex items-center gap-1 justify-center">
                    {['bronze', 'silver', 'gold', 'platinum'].map(level => (
                      <div
                        key={level}
                        className={cn(
                          'h-2 flex-1 rounded-full transition-colors',
                          ['bronze', 'silver', 'gold', 'platinum'].indexOf(level) <=
                          ['bronze', 'silver', 'gold', 'platinum'].indexOf(trustScoreData?.trustLevel || 'none')
                            ? ''
                            : 'bg-muted'
                        )}
                        style={
                          ['bronze', 'silver', 'gold', 'platinum'].indexOf(level) <=
                          ['bronze', 'silver', 'gold', 'platinum'].indexOf(trustScoreData?.trustLevel || 'none')
                            ? { backgroundColor: TRUST_LEVEL_COLORS[level] }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-0.5">
                    <span>Bronze</span>
                    <span>Silver</span>
                    <span>Gold</span>
                    <span>Platinum</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 3. Seller Tier Card */}
      {currentUser?.shop?.id && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SellerTierCard shopId={currentUser.shop.id} size="full" />
        </motion.div>
      )}

      {/* 4. Submit Verification Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-500" />
              Submit Verification Document
            </CardTitle>
            <CardDescription>Upload documents to verify your identity and business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Document Type *</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger id="docType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(dt => (
                      <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docNumber">Document Number</Label>
                <Input
                  id="docNumber"
                  placeholder="e.g., ID number, license number"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="docUrl">Document URL</Label>
                <Input
                  id="docUrl"
                  placeholder="https://example.com/document.pdf"
                  value={docUrl}
                  onChange={e => setDocUrl(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Provide a link to your uploaded document (simulated for now)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !docType}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Submit Document</>
                )}
              </Button>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Documents are reviewed within 24–48 hours
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4. Verification Documents List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              Submitted Documents
              {documents.length > 0 && (
                <Badge variant="secondary" className="ml-1">{documents.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No documents submitted yet</p>
                <p className="text-xs text-muted-foreground">Submit your first document above to start the verification process</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {documents.map(doc => {
                    const docTypeLabel = DOC_TYPES.find(d => d.value === doc.documentType)?.label || doc.documentType
                    const statusColor = doc.status === 'approved' || doc.status === 'verified'
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                      : doc.status === 'rejected'
                        ? 'text-red-600 bg-red-50 border-red-200'
                        : doc.status === 'under_review'
                          ? 'text-amber-600 bg-amber-50 border-amber-200'
                          : 'text-amber-600 bg-amber-50 border-amber-200'

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn('p-1.5 rounded-md border', statusColor)}>
                            {doc.status === 'approved' || doc.status === 'verified' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : doc.status === 'rejected' ? (
                              <XCircle className="h-4 w-4" />
                            ) : doc.status === 'under_review' ? (
                              <ShieldQuestion className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{docTypeLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.country || 'N/A'} • {doc.documentNumber || 'No number'}
                              {doc.rejectionReason && (
                                <span className="text-red-500 ml-1">• {doc.rejectionReason}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={cn('text-[10px] capitalize', statusColor)}>
                            {doc.status.replace('_', ' ')}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 5. Earned Badges Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              Trust Badges
              {badgesData && (
                <Badge variant="secondary" className="ml-1">
                  {badgesData.earnedCount}/{badgesData.totalCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Badges you can earn by meeting trust criteria</CardDescription>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No badges available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {badges.map(badge => (
                  <motion.div
                    key={badge.slug}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-colors',
                      badge.earned
                        ? 'bg-card border-emerald-200 hover:border-emerald-300'
                        : 'bg-muted/30 border-muted opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full mx-auto flex items-center justify-center mb-2',
                        badge.earned ? '' : 'grayscale'
                      )}
                      style={{ backgroundColor: `${badge.color}20` }}
                    >
                      <TrustBadgeIcon
                        slug={badge.slug}
                        name={badge.name}
                        icon={badge.icon}
                        color={badge.earned ? badge.color : '#9ca3af'}
                        size="lg"
                      />
                    </div>
                    <p className={cn('text-xs font-medium', badge.earned ? 'text-foreground' : 'text-muted-foreground')}>
                      {badge.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {badge.description}
                    </p>
                    {badge.earned && (
                      <Badge className="mt-1 text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                        Earned
                      </Badge>
                    )}
                    {!badge.earned && (
                      <Badge variant="outline" className="mt-1 text-[9px]">
                        Locked
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
