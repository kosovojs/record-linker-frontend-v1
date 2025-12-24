import { describe, it, expect } from 'vitest'
import { isValidUuid, assertUuid } from './common'

describe('UUID validation utilities', () => {
  describe('isValidUuid', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(isValidUuid('123E4567-E89B-12D3-A456-426614174000')).toBe(true)
      expect(isValidUuid('123e4567-E89B-12d3-A456-426614174000')).toBe(true)
    })

    it('should return false for invalid UUIDs', () => {
      expect(isValidUuid('')).toBe(false)
      expect(isValidUuid('not-a-uuid')).toBe(false)
      expect(isValidUuid('123e4567-e89b-12d3-a456')).toBe(false) // too short
      expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000-extra')).toBe(false) // too long
      expect(isValidUuid('123e4567e89b12d3a456426614174000')).toBe(false) // no hyphens
      expect(isValidUuid('gggggggg-gggg-gggg-gggg-gggggggggggg')).toBe(false) // invalid chars
    })

    it('should reject UUIDs with invalid version digit', () => {
      // Version must be 1-5 (third segment starts with 1-5)
      expect(isValidUuid('123e4567-e89b-62d3-a456-426614174000')).toBe(false) // version 6
      expect(isValidUuid('123e4567-e89b-02d3-a456-426614174000')).toBe(false) // version 0
    })

    it('should reject UUIDs with invalid variant digit', () => {
      // Fourth segment must start with 8, 9, a, or b
      expect(isValidUuid('123e4567-e89b-12d3-c456-426614174000')).toBe(false) // variant c
      expect(isValidUuid('123e4567-e89b-12d3-0456-426614174000')).toBe(false) // variant 0
    })
  })

  describe('assertUuid', () => {
    it('should not throw for valid UUID', () => {
      expect(() => assertUuid('123e4567-e89b-12d3-a456-426614174000')).not.toThrow()
    })

    it('should throw for invalid UUID', () => {
      expect(() => assertUuid('invalid')).toThrow('Invalid UUID format')
    })

    it('should include field name in error message', () => {
      expect(() => assertUuid('invalid', 'project uuid')).toThrow('project uuid')
    })

    it('should include the invalid value in error message', () => {
      expect(() => assertUuid('bad-uuid', 'test')).toThrow('bad-uuid')
    })
  })
})
