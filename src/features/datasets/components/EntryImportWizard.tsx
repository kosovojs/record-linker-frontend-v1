import { useState, useCallback, useRef } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { useCsvParser, useImportEntries } from '../hooks'
import {
  ENTRY_FIELD_OPTIONS,
  autoDetectColumnMappings,
  isMappingValid,
  transformRowsToEntries,
  type EntryData,
} from '../utils'

interface EntryImportWizardProps {
  datasetUuid: string
  onComplete: () => void
}

type Step = 'upload' | 'mapping' | 'validation' | 'importing' | 'complete'

// Configurable batch size - can be adjusted based on payload size
const IMPORT_BATCH_SIZE = 500
const CONCURRENT_BATCHES = 3 // Number of parallel batch requests

export function EntryImportWizard({ datasetUuid, onComplete }: EntryImportWizardProps) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validEntries, setValidEntries] = useState<EntryData[]>([])
  const [invalidCount, setInvalidCount] = useState(0)
  const [importResult, setImportResult] = useState<{ created: number } | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  const allRowsRef = useRef<Record<string, unknown>[]>([])

  const csvParser = useCsvParser({
    maxPreviewRows: 1000,
    onComplete: (rows) => {
      allRowsRef.current = rows
    },
  })

  const importMutation = useImportEntries()

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    const result = await csvParser.parseFile(selectedFile)

    if (result) {
      // Auto-detect column mappings
      const autoMapping = autoDetectColumnMappings(result.headers)
      setColumnMapping(autoMapping)
      setStep('mapping')
    }
  }, [csvParser])

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

  const handleValidate = useCallback(() => {
    const rows = csvParser.getAllRows()
    const { valid, invalidCount: invalid } = transformRowsToEntries(rows, columnMapping)

    setValidEntries(valid)
    setInvalidCount(invalid)
    setStep('validation')
  }, [csvParser, columnMapping])

  const handleImport = async () => {
    setStep('importing')
    setImportProgress(0)

    try {
      let totalCreated = 0
      const batches: EntryData[][] = []

      // Split entries into batches
      for (let i = 0; i < validEntries.length; i += IMPORT_BATCH_SIZE) {
        batches.push(validEntries.slice(i, i + IMPORT_BATCH_SIZE))
      }

      // Process batches with concurrency limit
      let completedBatches = 0

      for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
        const batchGroup = batches.slice(i, i + CONCURRENT_BATCHES)

        const results = await Promise.all(
          batchGroup.map((batch) =>
            importMutation.mutateAsync({
              datasetUuid,
              entries: batch,
            })
          )
        )

        results.forEach((result) => {
          totalCreated += result.created
        })

        completedBatches += batchGroup.length
        setImportProgress(Math.round((completedBatches / batches.length) * 100))
      }

      setImportResult({ created: totalCreated })
      setStep('complete')
    } catch (error) {
      console.error('Import failed:', error)
      setStep('validation')
    }
  }

  const resetWizard = useCallback(() => {
    setStep('upload')
    setFile(null)
    setColumnMapping({})
    setValidEntries([])
    setInvalidCount(0)
    setImportResult(null)
    setImportProgress(0)
    csvParser.reset()
    allRowsRef.current = []
  }, [csvParser])

  const isExternalIdMapped = isMappingValid(columnMapping)

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
            {csvParser.isParsing ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Parsing CSV...</h3>
                {csvParser.progress > 0 && (
                  <Progress value={csvParser.progress} className="w-48 mx-auto" />
                )}
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop your CSV file here</h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse. File should have a header row.
                </p>
              </>
            )}
          </div>
        )}

        {/* Step: Mapping */}
        {step === 'mapping' && csvParser.data && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">
                File: {file?.name} ({csvParser.data.totalRows.toLocaleString()} rows)
              </h3>
              <p className="text-sm text-muted-foreground">
                Map your CSV columns to the entry fields. Unmapped columns will be stored in raw_data.
              </p>
            </div>

            <div className="space-y-3">
              {csvParser.data.headers.map((header) => (
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
                      {ENTRY_FIELD_OPTIONS.map((option) => (
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
                    <span className="text-2xl font-bold">{validEntries.length.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Valid entries</p>
                </CardContent>
              </Card>
              {invalidCount > 0 && (
                <Card className="flex-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-2xl font-bold">{invalidCount.toLocaleString()}</span>
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
                Import {validEntries.length.toLocaleString()} Entries
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
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Please wait while we import your data.
            </p>
            <Progress value={importProgress} className="w-64 mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">{importProgress}% complete</p>
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
              Successfully imported {importResult.created.toLocaleString()} entries.
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
