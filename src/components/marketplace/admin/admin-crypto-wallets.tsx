'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Copy,
  RefreshCw,
  Save,
  Info,
  History,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'

interface WalletData {
  code: string
  name: string
  symbol: string
  icon: string
  network: string
  id: string | null
  address: string
  label: string
  isActive: boolean
  depositCount: number
  maxDeposits: number | null
  notes: string
  previousAddresses: { address: string; depositCount: number; usedFrom?: string; usedTo?: string }[]
  updatedAt: string | null
  needsUpdate: boolean
  approachingLimit: boolean
}

interface WalletsResponse {
  success: boolean
  data: {
    wallets: WalletData[]
    totalConfigured: number
    totalActive: number
    needingUpdate: number
    tableMissing?: boolean
    hint?: string
  }
}

export default function AdminCryptoWallets() {
  const { currentUser } = useMarketplaceStore()
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, { address: string; label: string; maxDeposits: string; notes: string }>>({})
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalConfigured: 0, totalActive: 0, needingUpdate: 0 })
  const [tableMissing, setTableMissing] = useState(false)
  const [tableHint, setTableHint] = useState('')

  const fetchWallets = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/crypto-wallets')
      const data: WalletsResponse = await res.json()
      if (data.success) {
        setWallets(data.data.wallets)
        setStats({
          totalConfigured: data.data.totalConfigured,
          totalActive: data.data.totalActive,
          needingUpdate: data.data.needingUpdate,
        })
        setTableMissing(data.data.tableMissing || false)
        setTableHint(data.data.hint || '')
        // Initialize edit data
        const edit: Record<string, { address: string; label: string; maxDeposits: string; notes: string }> = {}
        data.data.wallets.forEach((w: WalletData) => {
          edit[w.code] = {
            address: w.address,
            label: w.label,
            maxDeposits: w.maxDeposits?.toString() || '',
            notes: w.notes,
          }
        })
        setEditData(edit)
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
      toast.error('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  const handleSave = async (code: string) => {
    const edit = editData[code]
    if (!edit || !edit.address.trim()) {
      toast.error('Wallet address is required')
      return
    }

    setSaving(code)
    try {
      const res = await fetch('/api/admin/crypto-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: code,
          address: edit.address.trim(),
          label: edit.label.trim() || undefined,
          maxDeposits: edit.maxDeposits ? parseInt(edit.maxDeposits) : null,
          notes: edit.notes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchWallets()
      } else {
        toast.error(data.error || 'Failed to save wallet')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save wallet')
    } finally {
      setSaving(null)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Address copied!')
  }

  const handleToggleActive = async (code: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/crypto-wallets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: code, action: 'toggle_active' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchWallets()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Failed to toggle wallet')
    }
  }

  const handleResetCount = async (code: string) => {
    try {
      const res = await fetch('/api/admin/crypto-wallets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: code, action: 'reset_count' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchWallets()
      }
    } catch (error) {
      toast.error('Failed to reset count')
    }
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Admin access required</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-[#F7931A]" />
            Crypto Wallets
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage escrow wallet addresses for crypto payments. Update anytime without redeploying.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWallets}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalActive}</p>
              <p className="text-xs text-muted-foreground">Active Wallets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalConfigured}</p>
              <p className="text-xs text-muted-foreground">Configured</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.needingUpdate}</p>
              <p className="text-xs text-muted-foreground">Need Update</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Missing Warning */}
      {tableMissing && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Database Table Missing</p>
                <p className="text-xs text-red-700 mt-1">
                  The <code className="bg-red-100 px-1 rounded">CryptoWallet</code> table doesn&apos;t exist in the database yet.
                  You need to sync the schema first:
                </p>
                <ol className="text-xs text-red-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Go to <strong>Admin Panel → Settings → Sync Schema</strong></li>
                  <li>Click <strong>&quot;Sync Schema&quot;</strong> to create the table</li>
                  <li>Then come back here to set up wallet addresses</li>
                </ol>
                <p className="text-xs text-red-600 mt-2">
                  Or run <code className="bg-red-100 px-1 rounded">npx prisma db push</code> in your terminal with the production DATABASE_URL.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* C Wallet Info Banner */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">C Wallet Address Regeneration</p>
              <p className="text-xs text-amber-700 mt-1">
                C Wallet regenerates the deposit address after every 8 deposits. When the deposit count
                reaches the limit, you&apos;ll see a warning here. Just update the address in C Wallet app
                and paste the new one below — the old address is automatically saved to history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Cards */}
      <div className="grid gap-4">
        {wallets.map((wallet) => {
          const edit = editData[wallet.code] || { address: '', label: '', maxDeposits: '', notes: '' }
          const isSaving = saving === wallet.code
          const hasChanges =
            edit.address !== wallet.address ||
            edit.label !== wallet.label ||
            edit.maxDeposits !== (wallet.maxDeposits?.toString() || '') ||
            edit.notes !== wallet.notes

          return (
            <Card
              key={wallet.code}
              className={`overflow-hidden ${
                wallet.needsUpdate
                  ? 'border-red-300 shadow-red-100'
                  : wallet.approachingLimit
                    ? 'border-amber-300 shadow-amber-100'
                    : wallet.address
                      ? 'border-green-200'
                      : 'border-muted'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{wallet.icon}</span>
                    {wallet.name} ({wallet.symbol})
                    {wallet.address ? (
                      wallet.isActive ? (
                        <Badge variant="default" className="bg-green-600 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Not Configured</Badge>
                    )}
                    {wallet.needsUpdate && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs Update!
                      </Badge>
                    )}
                    {wallet.approachingLimit && !wallet.needsUpdate && (
                      <Badge className="bg-amber-100 text-amber-800 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Approaching Limit
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {wallet.address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(wallet.code, wallet.isActive)}
                      >
                        {wallet.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                    {wallet.previousAddresses.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(showHistory === wallet.code ? null : wallet.code)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        History ({wallet.previousAddresses.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Deposit Counter */}
                {wallet.address && (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Deposits</p>
                      <p className="text-lg font-bold">
                        {wallet.depositCount}
                        {wallet.maxDeposits ? ` / ${wallet.maxDeposits}` : ''}
                      </p>
                    </div>
                    {wallet.maxDeposits && (
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              wallet.needsUpdate
                                ? 'bg-red-500'
                                : wallet.approachingLimit
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((wallet.depositCount / wallet.maxDeposits) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {wallet.depositCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => handleResetCount(wallet.code)}>
                        Reset Count
                      </Button>
                    )}
                  </div>
                )}

                {/* Edit Form */}
                <div className="grid gap-3">
                  <div>
                    <Label className="text-xs font-medium">Wallet Address ({wallet.network})</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={edit.address}
                        onChange={(e) => setEditData({ ...editData, [wallet.code]: { ...edit, address: e.target.value } })}
                        placeholder={`Enter ${wallet.symbol} wallet address...`}
                        className="font-mono text-xs"
                      />
                      {edit.address && (
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(edit.address)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Label</Label>
                      <Input
                        value={edit.label}
                        onChange={(e) => setEditData({ ...editData, [wallet.code]: { ...edit, label: e.target.value } })}
                        placeholder={`e.g. Exodus ${wallet.symbol}`}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Max Deposits (C Wallet: 8)</Label>
                      <Input
                        type="number"
                        value={edit.maxDeposits}
                        onChange={(e) => setEditData({ ...editData, [wallet.code]: { ...edit, maxDeposits: e.target.value } })}
                        placeholder="e.g. 8"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Notes</Label>
                    <Input
                      value={edit.notes}
                      onChange={(e) => setEditData({ ...editData, [wallet.code]: { ...edit, notes: e.target.value } })}
                      placeholder="Any notes about this wallet..."
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {hasChanges && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleSave(wallet.code)}
                      disabled={isSaving}
                      className="bg-[#F7931A] hover:bg-[#E8850F] text-white"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save {wallet.symbol} Wallet
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditData({
                          ...editData,
                          [wallet.code]: {
                            address: wallet.address,
                            label: wallet.label,
                            maxDeposits: wallet.maxDeposits?.toString() || '',
                            notes: wallet.notes,
                          },
                        })
                      }
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Network Warning */}
                <div className="flex items-start gap-2 p-2 rounded bg-orange-50 border border-orange-200">
                  <ShieldCheck className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-orange-700">
                    Only send <strong>{wallet.symbol}</strong> on the <strong>{wallet.network}</strong> network.
                    Wrong network = lost funds.
                  </p>
                </div>

                {/* Address History */}
                {showHistory === wallet.code && wallet.previousAddresses.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium mb-2 flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Previous Addresses
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {wallet.previousAddresses.map((prev, i) => (
                          <div key={i} className="p-2 rounded bg-muted/50 text-xs">
                            <div className="flex items-center gap-2">
                              <code className="flex-1 font-mono break-all text-muted-foreground">
                                {prev.address}
                              </code>
                              <Button variant="ghost" size="sm" onClick={() => handleCopy(prev.address)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <span>{prev.depositCount} deposits</span>
                              {prev.usedTo && <span>• Used until {new Date(prev.usedTo).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>How it works:</strong> Buyers send crypto directly to these wallet addresses. The payment is held in escrow until delivery is confirmed.</p>
              <p><strong>Fee structure:</strong> 10% platform fee is automatically calculated. Seller receives 90% when escrow is released.</p>
              <p><strong>Updating addresses:</strong> Changes take effect immediately. The old address is saved to history and the deposit counter resets.</p>
              <p><strong>Fallback:</strong> If no address is set in the database, the system falls back to the CRYPTO_*_WALLET environment variable.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
