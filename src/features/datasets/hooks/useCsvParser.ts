import { useState, useCallback, useRef } from 'react'

export interface ParsedCsvData {
  headers: string[]
  rows: Record<string, unknown>[]
  totalRows: number
}

export interface CsvParserState {
  isParsing: boolean
  error: string | null
  data: ParsedCsvData | null
  progress: number // 0-100
}

export interface UseCsvParserOptions {
  /**
   * Maximum rows to keep in memory for preview.
   * Rows beyond this limit are counted but not stored.
   */
  maxPreviewRows?: number
  /**
   * Called when parsing is complete with all rows (for processing)
   */
  onComplete?: (rows: Record<string, unknown>[]) => void
}

/**
 * Hook for parsing CSV files with Web Worker support for large files.
 * Falls back to main-thread parsing for smaller files or when Workers aren't available.
 */
export function useCsvParser(options: UseCsvParserOptions = {}) {
  const { maxPreviewRows = 1000, onComplete } = options
  const [state, setState] = useState<CsvParserState>({
    isParsing: false,
    error: null,
    data: null,
    progress: 0,
  })

  const workerRef = useRef<Worker | null>(null)
  const allRowsRef = useRef<Record<string, unknown>[]>([])

  const parseFile = useCallback(async (file: File): Promise<ParsedCsvData | null> => {
    setState({ isParsing: true, error: null, data: null, progress: 0 })
    allRowsRef.current = []

    // For files under 1MB, parse synchronously on main thread for simplicity
    const USE_WORKER_THRESHOLD = 1 * 1024 * 1024 // 1MB

    if (file.size < USE_WORKER_THRESHOLD || typeof Worker === 'undefined') {
      // Main thread parsing with papaparse
      const Papa = await import('papaparse')

      return new Promise((resolve) => {
        Papa.default.parse<Record<string, unknown>>(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || []
            const allRows = results.data
            const previewRows = allRows.slice(0, maxPreviewRows)

            allRowsRef.current = allRows

            const data: ParsedCsvData = {
              headers,
              rows: previewRows,
              totalRows: allRows.length,
            }

            setState({ isParsing: false, error: null, data, progress: 100 })
            onComplete?.(allRows)
            resolve(data)
          },
          error: (error) => {
            setState({ isParsing: false, error: error.message, data: null, progress: 0 })
            resolve(null)
          },
        })
      })
    }

    // For larger files, use a Web Worker to avoid blocking the UI
    return new Promise((resolve) => {
      const workerCode = `
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js');

        self.onmessage = function(e) {
          const file = e.data.file;
          const maxPreviewRows = e.data.maxPreviewRows;

          let headers = [];
          let previewRows = [];
          let totalRows = 0;
          let allRows = [];

          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            step: function(results, parser) {
              totalRows++;
              allRows.push(results.data);
              if (previewRows.length < maxPreviewRows) {
                previewRows.push(results.data);
              }
              if (headers.length === 0 && results.meta.fields) {
                headers = results.meta.fields;
              }
              // Report progress every 1000 rows
              if (totalRows % 1000 === 0) {
                self.postMessage({ type: 'progress', totalRows });
              }
            },
            complete: function() {
              self.postMessage({
                type: 'complete',
                headers,
                previewRows,
                totalRows,
                allRows
              });
            },
            error: function(error) {
              self.postMessage({ type: 'error', message: error.message });
            }
          });
        };
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)
      const worker = new Worker(workerUrl)
      workerRef.current = worker

      worker.onmessage = (e) => {
        const { type, headers, previewRows, totalRows, allRows, message } = e.data

        if (type === 'progress') {
          setState((prev) => ({ ...prev, progress: Math.min(90, prev.progress + 5) }))
        } else if (type === 'complete') {
          allRowsRef.current = allRows
          const data: ParsedCsvData = {
            headers,
            rows: previewRows,
            totalRows,
          }
          setState({ isParsing: false, error: null, data, progress: 100 })
          onComplete?.(allRows)
          resolve(data)

          // Cleanup
          worker.terminate()
          URL.revokeObjectURL(workerUrl)
          workerRef.current = null
        } else if (type === 'error') {
          setState({ isParsing: false, error: message, data: null, progress: 0 })
          resolve(null)

          worker.terminate()
          URL.revokeObjectURL(workerUrl)
          workerRef.current = null
        }
      }

      worker.onerror = (error) => {
        setState({ isParsing: false, error: error.message, data: null, progress: 0 })
        resolve(null)

        worker.terminate()
        URL.revokeObjectURL(workerUrl)
        workerRef.current = null
      }

      worker.postMessage({ file, maxPreviewRows })
    })
  }, [maxPreviewRows, onComplete])

  const getAllRows = useCallback(() => {
    return allRowsRef.current
  }, [])

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    allRowsRef.current = []
    setState({ isParsing: false, error: null, data: null, progress: 0 })
  }, [])

  return {
    ...state,
    parseFile,
    getAllRows,
    reset,
  }
}
