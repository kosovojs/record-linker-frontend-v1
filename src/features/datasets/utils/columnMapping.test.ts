import { describe, it, expect } from 'vitest'
import {
  autoDetectColumnMappings,
  getColumnForField,
  isMappingValid,
  transformRowsToEntries,
  ENTRY_FIELD_OPTIONS,
} from './columnMapping'

describe('columnMapping utilities', () => {
  describe('ENTRY_FIELD_OPTIONS', () => {
    it('should have external_id as required', () => {
      const externalId = ENTRY_FIELD_OPTIONS.find(opt => opt.value === 'external_id')
      expect(externalId).toBeDefined()
      expect(externalId?.required).toBe(true)
    })

    it('should include skip option', () => {
      const skip = ENTRY_FIELD_OPTIONS.find(opt => opt.value === 'skip')
      expect(skip).toBeDefined()
    })
  })

  describe('autoDetectColumnMappings', () => {
    it('should detect external_id from various header names', () => {
      const headers = ['external_id', 'ID', 'ext_id', 'externalid']
      const mapping = autoDetectColumnMappings(headers)

      expect(mapping['external_id']).toBe('external_id')
      expect(mapping['ID']).toBe('external_id')
      expect(mapping['ext_id']).toBe('external_id')
      expect(mapping['externalid']).toBe('external_id')
    })

    it('should detect display_name from name/title/label headers', () => {
      const headers = ['name', 'title', 'label', 'display_name']
      const mapping = autoDetectColumnMappings(headers)

      expect(mapping['name']).toBe('display_name')
      expect(mapping['title']).toBe('display_name')
      expect(mapping['label']).toBe('display_name')
      expect(mapping['display_name']).toBe('display_name')
    })

    it('should detect external_url from url/link/href headers', () => {
      const headers = ['url', 'link', 'href', 'external_url']
      const mapping = autoDetectColumnMappings(headers)

      expect(mapping['url']).toBe('external_url')
      expect(mapping['link']).toBe('external_url')
      expect(mapping['href']).toBe('external_url')
      expect(mapping['external_url']).toBe('external_url')
    })

    it('should mark unrecognized headers as skip', () => {
      const headers = ['foo', 'bar', 'baz']
      const mapping = autoDetectColumnMappings(headers)

      expect(mapping['foo']).toBe('skip')
      expect(mapping['bar']).toBe('skip')
      expect(mapping['baz']).toBe('skip')
    })

    it('should be case-insensitive', () => {
      const headers = ['EXTERNAL_ID', 'NAME', 'URL']
      const mapping = autoDetectColumnMappings(headers)

      expect(mapping['EXTERNAL_ID']).toBe('external_id')
      expect(mapping['NAME']).toBe('display_name')
      expect(mapping['URL']).toBe('external_url')
    })

    it('should handle empty headers array', () => {
      const mapping = autoDetectColumnMappings([])
      expect(mapping).toEqual({})
    })
  })

  describe('getColumnForField', () => {
    it('should return column name for mapped field', () => {
      const mapping = { 'col1': 'external_id', 'col2': 'display_name' }
      expect(getColumnForField(mapping, 'external_id')).toBe('col1')
      expect(getColumnForField(mapping, 'display_name')).toBe('col2')
    })

    it('should return undefined for unmapped field', () => {
      const mapping = { 'col1': 'external_id' }
      expect(getColumnForField(mapping, 'display_name')).toBeUndefined()
    })
  })

  describe('isMappingValid', () => {
    it('should return true when external_id is mapped', () => {
      const mapping = { 'col1': 'external_id', 'col2': 'skip' }
      expect(isMappingValid(mapping)).toBe(true)
    })

    it('should return false when external_id is not mapped', () => {
      const mapping = { 'col1': 'display_name', 'col2': 'skip' }
      expect(isMappingValid(mapping)).toBe(false)
    })

    it('should return false for empty mapping', () => {
      expect(isMappingValid({})).toBe(false)
    })
  })

  describe('transformRowsToEntries', () => {
    const validMapping = {
      'id': 'external_id',
      'name': 'display_name',
      'link': 'external_url',
      'extra': 'skip',
    }

    it('should transform valid rows to entries', () => {
      const rows = [
        { id: 'abc123', name: 'Test Item', link: 'http://example.com', extra: 'data' },
      ]

      const result = transformRowsToEntries(rows, validMapping)

      expect(result.valid).toHaveLength(1)
      expect(result.invalidCount).toBe(0)
      expect(result.valid[0]).toEqual({
        external_id: 'abc123',
        display_name: 'Test Item',
        external_url: 'http://example.com',
        raw_data: { extra: 'data' },
      })
    })

    it('should skip rows with empty external_id', () => {
      const rows = [
        { id: '', name: 'No ID' },
        { id: '  ', name: 'Whitespace ID' },
        { name: 'Missing ID' },
      ]

      const result = transformRowsToEntries(rows, validMapping)

      expect(result.valid).toHaveLength(0)
      expect(result.invalidCount).toBe(3)
    })

    it('should trim external_id', () => {
      const rows = [{ id: '  abc123  ', name: 'Test' }]
      const result = transformRowsToEntries(rows, validMapping)

      expect(result.valid[0].external_id).toBe('abc123')
    })

    it('should handle null display_name and external_url', () => {
      const rows = [{ id: 'abc123' }]
      const result = transformRowsToEntries(rows, { 'id': 'external_id' })

      expect(result.valid[0].display_name).toBeNull()
      expect(result.valid[0].external_url).toBeNull()
    })

    it('should return empty raw_data as null', () => {
      const rows = [{ id: 'abc123', name: 'Test' }]
      const mapping = { 'id': 'external_id', 'name': 'display_name' }

      const result = transformRowsToEntries(rows, mapping)

      expect(result.valid[0].raw_data).toBeNull()
    })

    it('should handle rows with no external_id column mapped', () => {
      const rows = [{ name: 'Test' }]
      const mapping = { 'name': 'display_name' }

      const result = transformRowsToEntries(rows, mapping)

      expect(result.valid).toHaveLength(0)
      expect(result.invalidCount).toBe(1)
    })

    it('should process multiple rows correctly', () => {
      const rows = [
        { id: 'a1', name: 'Item 1' },
        { id: '', name: 'Invalid' },
        { id: 'a2', name: 'Item 2' },
      ]

      const result = transformRowsToEntries(rows, validMapping)

      expect(result.valid).toHaveLength(2)
      expect(result.invalidCount).toBe(1)
    })
  })
})
