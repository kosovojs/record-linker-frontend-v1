/**
 * Utility functions for CSV column mapping
 */

export interface FieldOption {
  value: string
  label: string
  required?: boolean
}

export const ENTRY_FIELD_OPTIONS: FieldOption[] = [
  { value: 'external_id', label: 'External ID (required)', required: true },
  { value: 'display_name', label: 'Display Name' },
  { value: 'external_url', label: 'External URL' },
  { value: 'skip', label: '— Skip this column —' },
]

/**
 * Auto-detect column mappings based on header names
 */
export function autoDetectColumnMappings(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  headers.forEach((header) => {
    const lowerHeader = header.toLowerCase().trim()

    if (
      lowerHeader.includes('external_id') ||
      lowerHeader === 'id' ||
      lowerHeader === 'ext_id' ||
      lowerHeader === 'externalid'
    ) {
      mapping[header] = 'external_id'
    } else if (
      lowerHeader.includes('name') ||
      lowerHeader.includes('title') ||
      lowerHeader === 'label'
    ) {
      mapping[header] = 'display_name'
    } else if (
      lowerHeader.includes('url') ||
      lowerHeader.includes('link') ||
      lowerHeader.includes('href')
    ) {
      mapping[header] = 'external_url'
    } else {
      mapping[header] = 'skip'
    }
  })

  return mapping
}

/**
 * Get the column name mapped to a specific field
 */
export function getColumnForField(
  mapping: Record<string, string>,
  field: string
): string | undefined {
  return Object.entries(mapping).find(([, value]) => value === field)?.[0]
}

/**
 * Check if a required field is mapped
 */
export function isMappingValid(mapping: Record<string, string>): boolean {
  return Object.values(mapping).includes('external_id')
}

/**
 * Transform parsed CSV rows into entry objects based on column mapping
 */
export function transformRowsToEntries(
  rows: Record<string, unknown>[],
  mapping: Record<string, string>
): { valid: EntryData[]; invalidCount: number } {
  const externalIdColumn = getColumnForField(mapping, 'external_id')
  const displayNameColumn = getColumnForField(mapping, 'display_name')
  const externalUrlColumn = getColumnForField(mapping, 'external_url')

  if (!externalIdColumn) {
    return { valid: [], invalidCount: rows.length }
  }

  const valid: EntryData[] = []
  let invalidCount = 0

  rows.forEach((row) => {
    const externalId = row[externalIdColumn]
    if (!externalId || typeof externalId !== 'string' || !externalId.trim()) {
      invalidCount++
      return
    }

    // Collect all unmapped columns into raw_data
    const rawData: Record<string, unknown> = {}
    Object.entries(row).forEach(([key, value]) => {
      if (mapping[key] === 'skip' || !mapping[key]) {
        rawData[key] = value
      }
    })

    valid.push({
      external_id: externalId.trim(),
      display_name: displayNameColumn
        ? String(row[displayNameColumn] || '') || null
        : null,
      external_url: externalUrlColumn
        ? String(row[externalUrlColumn] || '') || null
        : null,
      raw_data: Object.keys(rawData).length > 0 ? rawData : null,
    })
  })

  return { valid, invalidCount }
}

export interface EntryData {
  external_id: string
  display_name: string | null
  external_url: string | null
  raw_data: Record<string, unknown> | null
}
