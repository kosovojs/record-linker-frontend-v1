import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import { Upload, Check, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useImportEntries } from '../hooks'
import type { DatasetEntryCreate } from '@/services/api/schemas'

interface EntryImportWizardProps {
  datasetUuid: string
  onComplete: () => void
}

type Step = 'upload' | 'mapping' | 'validation' | 'importing' | 'complete'



interface ParsedData {
  headers: string[]
  rows: Record<string, unknown>[]
}

const FIELD_OPTIONS = [
  { value: 'external_id', label: 'External ID (required)', required: true },
  { value: 'display_name', label: 'Display Name' },
  { value: 'external_url', label: 'External URL' },
  { value: 'skip', label: '— Skip this column —' },
]

export function EntryImportWizard({ datasetUuid, onComplete }: EntryImportWizardProps) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validEntries, setValidEntries] = useState<DatasetEntryCreate[]>([])
  const [invalidCount, setInvalidCount] = useState(0)
  const [importResult, setImportResult] = useState<{ created: number } | null>(null)

  const importMutation = useImportEntries()

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)

    Papa.parse<Record<string, unknown>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        setParsedData({
          headers,
          rows: results.data,
        })

        // Auto-detect column mappings
        const autoMapping: Record<string, string> = {}
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes('external_id') || lowerHeader === 'id') {
            autoMapping[header] = 'external_id'
          } else if (lowerHeader.includes('name') || lowerHeader.includes('title')) {
            autoMapping[header] = 'display_name'
          } else if (lowerHeader.includes('url') || lowerHeader.includes('link')) {
            autoMapping[header] = 'external_url'
          } else {
            autoMapping[header] = 'skip'
          }
        })
        setColumnMapping(autoMapping)
        setStep('mapping')
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
      },
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleValidate = () => {
    if (!parsedData) return

    const externalIdColumn = Object.entries(columnMapping).find(
      ([, value]) => value === 'external_id'
    )?.[0]

    if (!externalIdColumn) {
      return
    }

    const displayNameColumn = Object.entries(columnMapping).find(
      ([, value]) => value === 'display_name'
    )?.[0]

    const externalUrlColumn = Object.entries(columnMapping).find(
      ([, value]) => value === 'external_url'
    )?.[0]

    const valid: DatasetEntryCreate[] = []
    let invalid = 0

    parsedData.rows.forEach((row) => {
      const externalId = row[externalIdColumn]
      if (!externalId || typeof externalId !== 'string' || !externalId.trim()) {
        invalid++
        return
      }

      // Collect all columns not mapped to specific fields into raw_data
      const rawData: Record<string, unknown> = {}
      Object.entries(row).forEach(([key, value]) => {
        if (columnMapping[key] === 'skip' || !columnMapping[key]) {
          rawData[key] = value
        }
      })

      valid.push({
        external_id: externalId.trim(),
        display_name: displayNameColumn ? String(row[displayNameColumn] || '') || null : null,
        external_url: externalUrlColumn ? String(row[externalUrlColumn] || '') || null : null,
        raw_data: Object.keys(rawData).length > 0 ? rawData : null,
      })
    })

    setValidEntries(valid)
    setInvalidCount(invalid)
    setStep('validation')
  }

  const handleImport = async () => {
    setStep('importing')

    try {
      // Import in batches of 500
      const BATCH_SIZE = 500
      let totalCreated = 0

      for (let i = 0; i < validEntries.length; i += BATCH_SIZE) {
        const batch = validEntries.slice(i, i + BATCH_SIZE)
        const result = await importMutation.mutateAsync({
          datasetUuid,
          entries: batch,
        })
        totalCreated += result.created
      }

      setImportResult({ created: totalCreated })
      setStep('complete')
    } catch (error) {
      console.error('Import failed:', error)
      setStep('validation')
    }
  }

  const resetWizard = () => {
    setStep('upload')
    setFile(null)
    setParsedData(null)
    setColumnMapping({})
    setValidEntries([])
    setInvalidCount(0)
    setImportResult(null)
  }

  const isExternalIdMapped = Object.values(columnMapping).includes('external_id')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Entries</CardTitle>
        <CardDescription>
          Upload a CSV file to bulk import entries into this dataset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step: Upload */}
        {step === 'upload' && (
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0]
                if (selectedFile) handleFileSelect(selectedFile)
              }}
            />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Drop your CSV file here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse. File should have a header row.
            </p>
          </div>
        )}

        {/* Step: Mapping */}
        {step === 'mapping' && parsedData && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">
                File: {file?.name} ({parsedData.rows.length} rows)
              </h3>
              <p className="text-sm text-muted-foreground">
                Map your CSV columns to the entry fields. Unmapped columns will be stored in raw_data.
              </p>
            </div>

            <div className="space-y-3">
              {parsedData.headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <div className="w-1/3 font-mono text-sm truncate" title={header}>
                    {header}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={columnMapping[header] || 'skip'}
                    onValueChange={(value) =>
                      setColumnMapping((prev) => ({ ...prev, [header]: value }))
                    }
                  >
                    <SelectTrigger className="w-2/3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={
                            option.value !== 'skip' &&
                            Object.entries(columnMapping).some(
                              ([col, val]) => col !== header && val === option.value
                            )
                          }
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {!isExternalIdMapped && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                Please map a column to External ID (required).
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetWizard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button onClick={handleValidate} disabled={!isExternalIdMapped}>
                Validate & Preview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Validation */}
        {step === 'validation' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-2xl font-bold">{validEntries.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Valid entries</p>
                </CardContent>
              </Card>
              {invalidCount > 0 && (
                <Card className="flex-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-2xl font-bold">{invalidCount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Invalid (missing ID)</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Preview (first 5 entries)</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>External ID</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>External URL</TableHead>
                      <TableHead>Raw Data Fields</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validEntries.slice(0, 5).map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm">
                          {entry.external_id}
                        </TableCell>
                        <TableCell>{entry.display_name || '—'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {entry.external_url || '—'}
                        </TableCell>
                        <TableCell>
                          {entry.raw_data ? (
                            <Badge variant="secondary">
                              {Object.keys(entry.raw_data).length} fields
                            </Badge>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mapping
              </Button>
              <Button onClick={handleImport} disabled={validEntries.length === 0}>
                Import {validEntries.length} Entries
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Importing */}
        {step === 'importing' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium">Importing entries...</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please wait while we import your data.
            </p>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && importResult && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium">Import Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Successfully imported {importResult.created} entries.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" onClick={resetWizard}>
                Import More
              </Button>
              <Button onClick={onComplete}>View Entries</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
