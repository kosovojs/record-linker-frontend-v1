import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCachedLabels, cacheLabels, fetchWikidataLabels } from './wikidata'

describe('wikidata utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getCachedLabels', () => {
    it('should return empty object for non-existent cache', () => {
      const result = getCachedLabels(['Q42', 'Q100'])
      expect(result).toEqual({})
    })

    it('should return cached labels that are not expired', () => {
      const now = Date.now()
      const cache = {
        Q42: { label: 'Douglas Adams', description: 'Writer', cachedAt: now },
      }
      localStorage.setItem('wikidata_labels', JSON.stringify(cache))

      const result = getCachedLabels(['Q42'])

      expect(result.Q42).toBeDefined()
      expect(result.Q42.label).toBe('Douglas Adams')
    })

    it('should filter out expired labels', () => {
      const sevenDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 days ago
      const cache = {
        Q42: { label: 'Douglas Adams', description: 'Writer', cachedAt: sevenDaysAgo },
      }
      localStorage.setItem('wikidata_labels', JSON.stringify(cache))

      const result = getCachedLabels(['Q42'])

      expect(result.Q42).toBeUndefined()
    })

    it('should only return requested QIDs', () => {
      const now = Date.now()
      const cache = {
        Q42: { label: 'Douglas Adams', description: 'Writer', cachedAt: now },
        Q100: { label: 'Boston', description: 'City', cachedAt: now },
      }
      localStorage.setItem('wikidata_labels', JSON.stringify(cache))

      const result = getCachedLabels(['Q42'])

      expect(Object.keys(result)).toEqual(['Q42'])
    })
  })

  describe('cacheLabels', () => {
    it('should cache labels to localStorage', () => {
      const labels = {
        Q42: { label: 'Douglas Adams', description: 'Writer' },
      }

      cacheLabels(labels)

      const stored = JSON.parse(localStorage.getItem('wikidata_labels') || '{}')
      expect(stored.Q42).toBeDefined()
      expect(stored.Q42.label).toBe('Douglas Adams')
      expect(stored.Q42.description).toBe('Writer')
      expect(stored.Q42.cachedAt).toBeDefined()
    })

    it('should merge with existing cache', () => {
      const now = Date.now()
      const existingCache = {
        Q100: { label: 'Boston', description: 'City', cachedAt: now },
      }
      localStorage.setItem('wikidata_labels', JSON.stringify(existingCache))

      cacheLabels({
        Q42: { label: 'Douglas Adams', description: 'Writer' },
      })

      const stored = JSON.parse(localStorage.getItem('wikidata_labels') || '{}')
      expect(stored.Q100).toBeDefined()
      expect(stored.Q42).toBeDefined()
    })
  })

  describe('fetchWikidataLabels', () => {
    it('should return empty object for empty QIDs array', async () => {
      const result = await fetchWikidataLabels([])
      expect(result).toEqual({})
    })

    it('should return cached labels without fetching', async () => {
      const now = Date.now()
      const cache = {
        Q42: { label: 'Douglas Adams', description: 'Writer', cachedAt: now },
      }
      localStorage.setItem('wikidata_labels', JSON.stringify(cache))

      const fetchMock = vi.mocked(global.fetch)

      const result = await fetchWikidataLabels(['Q42'])

      expect(fetchMock).not.toHaveBeenCalled()
      expect(result.Q42.label).toBe('Douglas Adams')
    })

    it('should fetch uncached labels from Wikidata API', async () => {
      const mockResponse = {
        entities: {
          Q42: {
            labels: { en: { value: 'Douglas Adams' } },
            descriptions: { en: { value: 'English writer' } },
          },
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchWikidataLabels(['Q42'])

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('wikidata.org')
      )
      expect(result.Q42.label).toBe('Douglas Adams')
      expect(result.Q42.description).toBe('English writer')
    })

    it('should use QID as fallback label when not found', async () => {
      const mockResponse = {
        entities: {
          Q999999: {
            labels: {},
            descriptions: {},
          },
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await fetchWikidataLabels(['Q999999'])

      expect(result.Q999999.label).toBe('Q999999')
      expect(result.Q999999.description).toBeNull()
    })

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      // Should not throw, should return empty for failed fetches
      const result = await fetchWikidataLabels(['Q42'])

      // The function logs errors and continues
      expect(result).toBeDefined()
    })

    it('should batch requests for many QIDs', async () => {
      // Create 60 QIDs (over the 50 limit)
      const qids = Array.from({ length: 60 }, (_, i) => `Q${i + 1}`)

      const mockResponse = { entities: {} }
      vi.mocked(global.fetch).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      } as Response)

      await fetchWikidataLabels(qids)

      // Should make 2 requests (50 + 10)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
