'use client'

import { useState } from 'react'
import {
  Download,
  AlertTriangle,
  Loader2,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

type ExportType = 'users' | 'orders' | 'products' | 'shops' | 'transactions'
type ExportFormat = 'json' | 'csv'

const EXPORT_OPTIONS: { value: ExportType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'users', label: 'Users', description: 'All registered user accounts (excludes passwords)', icon: <Database className="h-4 w-4" /> },
  { value: 'orders', label: 'Orders', description: 'All order records with status and amounts', icon: <Database className="h-4 w-4" /> },
  { value: 'products', label: 'Products', description: 'All product listings with details', icon: <Database className="h-4 w-4" /> },
  { value: 'shops', label: 'Shops', description: 'All shop profiles and settings', icon: <Database className="h-4 w-4" /> },
  { value: 'transactions', label: 'Transactions', description: 'All financial transactions', icon: <Database className="h-4 w-4" /> },
]

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'json', label: 'JSON', description: 'Structured data, good for APIs and processing', icon: <FileJson className="h-4 w-4" /> },
  { value: 'csv', label: 'CSV', description: 'Spreadsheet-compatible, good for analysis', icon: <FileSpreadsheet className="h-4 w-4" /> },
]

export function AdminDataExport() {
  const { authToken } = useMarketplaceStore()
  const [exportType, setExportType] = useState<ExportType>('users')
  const [format, setFormat] = useState<ExportFormat>('json')
  const [exporting, setExporting] = useState(false)
  const [lastExport, setLastExport] = useState<{ type: string; format: string; time: Date } | null>(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(
        `/api/admin/data-export?type=${exportType}&format=${format}&limit=500`,
        { headers }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Export failed' }))
        throw new Error(data.error || `Export failed with status ${response.status}`)
      }

      if (format === 'csv') {
        // CSV is returned as a file download
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // JSON — download as file
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      setLastExport({ type: exportType, format, time: new Date() })
      toast.success(`${exportType} data exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Download className="h-6 w-6 text-amber-600" />
            Data Export
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bulk export platform data for GDPR compliance and analysis
          </p>
        </div>
      </div>

      {/* Data Sensitivity Warning */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-amber-800">Data Sensitivity Notice</h3>
              <p className="text-sm text-amber-700">
                Exported data may contain personally identifiable information (PII) subject to GDPR and
                other data protection regulations. Ensure you have a lawful basis for exporting this data
                and handle it according to your organization&apos;s data protection policies.
              </p>
              <ul className="text-sm text-amber-700 list-disc list-inside space-y-0.5 mt-2">
                <li>All exports are logged in the admin audit trail</li>
                <li>User passwords are never included in exports</li>
                <li>Store exported data securely and delete when no longer needed</li>
                <li>Do not share exported data with unauthorized parties</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              Export Configuration
            </CardTitle>
            <CardDescription>Select the data type and format for your export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="export-type">Data Type</Label>
              <Select value={exportType} onValueChange={(v) => setExportType(v as ExportType)}>
                <SelectTrigger id="export-type">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {EXPORT_OPTIONS.find((o) => o.value === exportType)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {FORMAT_OPTIONS.find((o) => o.value === format)?.description}
              </p>
            </div>

            <Button
              className="w-full gold-gradient hover:opacity-90 text-white border-0"
              size="lg"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {EXPORT_OPTIONS.find((o) => o.value === exportType)?.label} Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export Summary & History */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Type</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-200">
                    {EXPORT_OPTIONS.find((o) => o.value === exportType)?.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Format</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-200">
                    {format.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Records</span>
                  <span className="text-sm font-medium">500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Audit Logged</span>
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Yes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {lastExport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Last Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="text-sm font-medium capitalize">{lastExport.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <span className="text-sm font-medium">{lastExport.format.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="text-sm font-medium">{lastExport.time.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
