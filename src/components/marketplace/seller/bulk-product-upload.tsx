'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileUp,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ParsedRow {
  name: string
  description: string
  price: string
  comparePrice: string
  type: string
  stock: string
  sku: string
  tags: string
  shortDesc: string
  errors: string[]
}

interface ImportResult {
  imported: number
  errors: { row: number; message: string }[]
}

const CSV_HEADERS = 'name,description,price,comparePrice,type,stock,sku,tags,shortDesc'

function parseCSVText(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim())
        if (currentRow.some((f) => f.length > 0)) rows.push(currentRow)
        currentRow = []
        currentField = ''
        if (char === '\r') i++
      } else if (char === '\r') {
        currentRow.push(currentField.trim())
        if (currentRow.some((f) => f.length > 0)) rows.push(currentRow)
        currentRow = []
        currentField = ''
      } else {
        currentField += char
      }
    }
  }

  currentRow.push(currentField.trim())
  if (currentRow.some((f) => f.length > 0)) rows.push(currentRow)
  return rows
}

function validateRow(row: string[]): ParsedRow {
  const errors: string[] = []

  const name = row[0] || ''
  const description = row[1] || ''
  const price = row[2] || ''
  const comparePrice = row[3] || ''
  const type = row[4] || 'digital'
  const stock = row[5] || ''
  const sku = row[6] || ''
  const tags = row[7] || ''
  const shortDesc = row[8] || ''

  if (!name) errors.push('Name is required')
  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) errors.push('Price must be a valid positive number')
  if (type && !['digital', 'physical', 'freelance'].includes(type.toLowerCase().trim())) errors.push('Invalid type')

  return { name, description, price, comparePrice, type, stock, sku, tags, shortDesc, errors }
}

export function BulkProductUpload() {
  const { currentUser } = useMarketplaceStore()
  const { toast } = useToast()

  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const shopId = currentUser?.shop?.id

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Invalid file', description: 'Please upload a .csv file', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return

      const rows = parseCSVText(text)
      if (rows.length < 2) {
        toast({ title: 'Empty CSV', description: 'The file must have headers and at least one data row', variant: 'destructive' })
        return
      }

      // Skip header row
      const dataRows = rows.slice(1)
      const parsed = dataRows.map((row) => validateRow(row))
      setParsedData(parsed)
      setFileName(file.name)
      setImportResult(null)
    }
    reader.readAsText(file)
  }, [toast])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const downloadTemplate = () => {
    const template = `${CSV_HEADERS}\nExample Product,Product description,29.99,39.99,digital,-1,SKU-001,tag1;tag2,Short description`
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: 'Template downloaded' })
  }

  const handleImport = async () => {
    if (!shopId || parsedData.length === 0) return

    setImporting(true)
    setImportProgress(0)
    setImportResult(null)

    try {
      // Re-read the file content from parsedData to create CSV
      const csvRows = [CSV_HEADERS]
      for (const row of parsedData) {
        csvRows.push([
          row.name,
          row.description,
          row.price,
          row.comparePrice,
          row.type || 'digital',
          row.stock,
          row.sku,
          row.tags,
          row.shortDesc,
        ].map((f) => {
          if (f.includes(',') || f.includes('"') || f.includes('\n')) {
            return `"${f.replace(/"/g, '""')}"`
          }
          return f
        }).join(','))
      }

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], fileName || 'import.csv', { type: 'text/csv' })

      setImportProgress(30)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('shopId', shopId)

      const res = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      })

      setImportProgress(90)

      const data = await res.json()

      setImportProgress(100)

      if (data.success) {
        setImportResult({ imported: data.imported, errors: data.errors || [] })
        const errorCount = data.errors?.length || 0
        if (errorCount === 0) {
          toast({ title: 'Import complete', description: `${data.imported} products imported successfully` })
        } else {
          toast({ title: 'Import completed with errors', description: `${data.imported} imported, ${errorCount} errors`, variant: 'destructive' })
        }
      } else {
        toast({ title: 'Import failed', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Import failed', description: 'Network error occurred', variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    if (!shopId) return
    try {
      const res = await fetch(`/api/products/export?shopId=${shopId}`)
      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Export failed', description: data.error, variant: 'destructive' })
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'products-export.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: 'Export complete', description: 'Products exported as CSV' })
    } catch {
      toast({ title: 'Export failed', description: 'Network error occurred', variant: 'destructive' })
    }
  }

  const clearData = () => {
    setParsedData([])
    setFileName(null)
    setImportResult(null)
    setImportProgress(0)
  }

  const validRows = parsedData.filter((r) => r.errors.length === 0)
  const invalidRows = parsedData.filter((r) => r.errors.length > 0)
  const previewRows = parsedData.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 p-2.5 shadow-lg shadow-teal-200">
            <FileSpreadsheet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Product Upload</h2>
            <p className="text-sm text-gray-500">Import or export products via CSV</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!shopId}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Export Products
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      {!fileName && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 transition-all cursor-pointer',
                  dragOver
                    ? 'border-teal-400 bg-teal-50/50'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50/50'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('csv-upload')?.click()}
              >
                <div className={cn(
                  'rounded-full p-4 mb-4 transition-colors',
                  dragOver ? 'bg-teal-100' : 'bg-gray-100'
                )}>
                  <Upload className={cn(
                    'h-8 w-8 transition-colors',
                    dragOver ? 'text-teal-600' : 'text-gray-400'
                  )} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {dragOver ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  or click to browse — accepts .csv files only
                </p>
                <Badge variant="outline" className="mt-3 text-xs text-gray-400">
                  Columns: {CSV_HEADERS}
                </Badge>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* File loaded + Preview */}
      {fileName && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* File info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-100 p-2">
                    <FileSpreadsheet className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{fileName}</p>
                    <p className="text-xs text-gray-500">
                      {parsedData.length} rows • {validRows.length} valid • {invalidRows.length} with errors
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {importResult ? (
                    <Button variant="outline" size="sm" onClick={clearData}>
                      <X className="mr-1 h-4 w-4" />
                      Clear
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={clearData}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                        onClick={handleImport}
                        disabled={importing || validRows.length === 0}
                      >
                        {importing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Import {validRows.length} Product{validRows.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {importing && (
                <div className="mt-4">
                  <Progress value={importProgress} className="h-2" />
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    {importProgress < 90 ? 'Uploading and processing...' : 'Finalizing import...'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import result */}
          {importResult && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {importResult.errors.length === 0 ? (
                    <div className="flex items-start gap-3 w-full">
                      <div className="rounded-full bg-emerald-100 p-2 shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">
                          All {importResult.imported} products imported successfully!
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          You can now view and manage these products in your shop.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-amber-100 p-2 shrink-0">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {importResult.imported} imported, {importResult.errors.length} error{importResult.errors.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {importResult.errors.length > 0 && (
                        <div className="ml-9 max-h-40 overflow-y-auto rounded-lg bg-red-50 p-3">
                          <ul className="space-y-1">
                            {importResult.errors.map((err, i) => (
                              <li key={i} className="text-xs text-red-700">
                                {err.row > 0 ? `Row ${err.row}: ` : ''}{err.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview table */}
          {parsedData.length > 0 && !importResult && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Preview</CardTitle>
                    <CardDescription>Showing first {Math.min(10, parsedData.length)} of {parsedData.length} rows</CardDescription>
                  </div>
                  {invalidRows.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {invalidRows.length} row{invalidRows.length !== 1 ? 's' : ''} with errors
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, i) => (
                        <TableRow key={i} className={cn(row.errors.length > 0 && 'bg-red-50/50')}>
                          <TableCell className="text-xs text-gray-400">{i + 1}</TableCell>
                          <TableCell className="font-medium text-sm max-w-[200px] truncate">
                            {row.name || '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.price ? `$${parseFloat(row.price).toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {row.type || 'digital'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {row.stock || (row.type === 'digital' ? '∞' : '0')}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {row.sku || '—'}
                          </TableCell>
                          <TableCell>
                            {row.errors.length === 0 ? (
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Valid</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                {row.errors.length} error{row.errors.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {parsedData.length > 10 && (
                  <div className="border-t px-4 py-2 text-center">
                    <p className="text-xs text-gray-500">
                      + {parsedData.length - 10} more row{parsedData.length - 10 !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Info card at the bottom */}
      <Card className="border-0 shadow-sm bg-gray-50/80">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">CSV Format Guide</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
            <div><span className="font-medium text-gray-700">name</span> — Required. Product name</div>
            <div><span className="font-medium text-gray-700">description</span> — Product description</div>
            <div><span className="font-medium text-gray-700">price</span> — Required. Positive number</div>
            <div><span className="font-medium text-gray-700">comparePrice</span> — Original price for discount display</div>
            <div><span className="font-medium text-gray-700">type</span> — digital | physical | freelance</div>
            <div><span className="font-medium text-gray-700">stock</span> — Quantity (-1 for unlimited)</div>
            <div><span className="font-medium text-gray-700">sku</span> — Stock keeping unit</div>
            <div><span className="font-medium text-gray-700">tags</span> — Semicolon-separated (tag1;tag2)</div>
            <div><span className="font-medium text-gray-700">shortDesc</span> — Brief product description</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
