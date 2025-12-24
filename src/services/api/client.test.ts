import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError, NetworkError } from './errors'

// We need to test the HttpClient class, but it's instantiated as a singleton
// So we'll test it by importing a fresh module for each test

describe('HttpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockFetchSuccess = (data: unknown, status = 200) => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(data),
    } as Response)
  }

  const mockFetchError = (data: unknown, status: number) => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(data),
    } as Response)
  }

  const mockNetworkError = () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network failure'))
  }

  describe('request method', () => {
    it('should make GET request with correct URL', async () => {
      mockFetchSuccess({ id: 1 })

      // Dynamic import to get fresh httpClient
      const { httpClient } = await import('./client')
      await httpClient.get('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should include JSON content-type header', async () => {
      mockFetchSuccess({})

      const { httpClient } = await import('./client')
      await httpClient.get('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      )
    })

    it('should serialize body as JSON for POST', async () => {
      mockFetchSuccess({ created: true })

      const { httpClient } = await import('./client')
      await httpClient.post('/items', { name: 'test' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      )
    })

    it('should append query params to URL', async () => {
      mockFetchSuccess([])

      const { httpClient } = await import('./client')
      await httpClient.get('/items', { params: { page: 1, limit: 10 } })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/page=1/),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/limit=10/),
        expect.any(Object)
      )
    })

    it('should skip null and undefined params', async () => {
      mockFetchSuccess([])

      const { httpClient } = await import('./client')
      await httpClient.get('/items', { params: { page: 1, filter: undefined, search: null } })

      const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string
      expect(calledUrl).toContain('page=1')
      expect(calledUrl).not.toContain('filter')
      expect(calledUrl).not.toContain('search')
    })
  })

  describe('HTTP methods', () => {
    it('should make GET request', async () => {
      mockFetchSuccess({ data: 'test' })
      const { httpClient } = await import('./client')

      const result = await httpClient.get<{ data: string }>('/test')

      expect(result.data).toBe('test')
    })

    it('should make POST request', async () => {
      mockFetchSuccess({ id: 1 })
      const { httpClient } = await import('./client')

      await httpClient.post('/items', { name: 'new' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should make PATCH request', async () => {
      mockFetchSuccess({ updated: true })
      const { httpClient } = await import('./client')

      await httpClient.patch('/items/1', { name: 'updated' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('should make PUT request', async () => {
      mockFetchSuccess({ replaced: true })
      const { httpClient } = await import('./client')

      await httpClient.put('/items/1', { name: 'replaced' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('should make DELETE request', async () => {
      mockFetchSuccess(null, 204)
      const { httpClient } = await import('./client')

      await httpClient.delete('/items/1')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('error handling', () => {
    it('should throw ApiError for HTTP errors', async () => {
      mockFetchError({ detail: 'Not found' }, 404)
      const { httpClient } = await import('./client')

      await expect(httpClient.get('/missing')).rejects.toThrow(ApiError)
    })

    it('should extract error message from detail field', async () => {
      mockFetchError({ detail: 'Resource not found' }, 404)
      const { httpClient } = await import('./client')

      try {
        await httpClient.get('/missing')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).message).toBe('Resource not found')
        expect((error as ApiError).status).toBe(404)
      }
    })

    it('should extract error message from message field', async () => {
      mockFetchError({ message: 'Validation failed' }, 422)
      const { httpClient } = await import('./client')

      try {
        await httpClient.get('/validate')
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as ApiError).message).toBe('Validation failed')
      }
    })

    it('should fallback to HTTP status for error message', async () => {
      mockFetchError({}, 500)
      const { httpClient } = await import('./client')

      try {
        await httpClient.get('/error')
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as ApiError).message).toBe('HTTP 500')
      }
    })

    it('should throw NetworkError for fetch failures', async () => {
      mockNetworkError()
      const { httpClient } = await import('./client')

      await expect(httpClient.get('/test')).rejects.toThrow(NetworkError)
    })

    it('should rethrow AbortError without wrapping', async () => {
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      vi.mocked(global.fetch).mockRejectedValueOnce(abortError)

      const { httpClient } = await import('./client')

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as Error).name).toBe('AbortError')
      }
    })
  })

  describe('response handling', () => {
    it('should parse JSON responses', async () => {
      mockFetchSuccess({ items: [1, 2, 3] })
      const { httpClient } = await import('./client')

      const result = await httpClient.get<{ items: number[] }>('/items')

      expect(result.items).toEqual([1, 2, 3])
    })

    it('should handle 204 No Content', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as Response)

      const { httpClient } = await import('./client')
      const result = await httpClient.delete('/items/1')

      expect(result).toBeUndefined()
    })

    it('should handle text responses', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve('Hello World'),
      } as Response)

      const { httpClient } = await import('./client')
      const result = await httpClient.get<string>('/text')

      expect(result).toBe('Hello World')
    })
  })
})
