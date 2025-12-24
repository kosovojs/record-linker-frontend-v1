import { describe, it, expect } from 'vitest'
import { ApiError, NetworkError, ValidationError } from './errors'

describe('API Error Classes', () => {
  describe('ApiError', () => {
    it('should create error with status and message', () => {
      const error = new ApiError('Not found', 404)

      expect(error.message).toBe('Not found')
      expect(error.status).toBe(404)
      expect(error.name).toBe('ApiError')
    })

    it('should store optional code and data', () => {
      const data = { detail: 'Resource not found' }
      const error = new ApiError('Not found', 404, 'NOT_FOUND', data)

      expect(error.code).toBe('NOT_FOUND')
      expect(error.data).toEqual(data)
    })

    describe('isClientError', () => {
      it('should return true for 4xx status codes', () => {
        expect(new ApiError('Bad request', 400).isClientError()).toBe(true)
        expect(new ApiError('Unauthorized', 401).isClientError()).toBe(true)
        expect(new ApiError('Not found', 404).isClientError()).toBe(true)
        expect(new ApiError('Conflict', 409).isClientError()).toBe(true)
        expect(new ApiError('Unprocessable', 422).isClientError()).toBe(true)
      })

      it('should return false for non-4xx status codes', () => {
        expect(new ApiError('OK', 200).isClientError()).toBe(false)
        expect(new ApiError('Server error', 500).isClientError()).toBe(false)
      })
    })

    describe('isServerError', () => {
      it('should return true for 5xx status codes', () => {
        expect(new ApiError('Internal error', 500).isServerError()).toBe(true)
        expect(new ApiError('Bad gateway', 502).isServerError()).toBe(true)
        expect(new ApiError('Service unavailable', 503).isServerError()).toBe(true)
      })

      it('should return false for non-5xx status codes', () => {
        expect(new ApiError('Not found', 404).isServerError()).toBe(false)
        expect(new ApiError('OK', 200).isServerError()).toBe(false)
      })
    })

    describe('isNotFound', () => {
      it('should return true for 404', () => {
        expect(new ApiError('Not found', 404).isNotFound()).toBe(true)
      })

      it('should return false for other status codes', () => {
        expect(new ApiError('Error', 400).isNotFound()).toBe(false)
        expect(new ApiError('Error', 500).isNotFound()).toBe(false)
      })
    })

    describe('isUnauthorized', () => {
      it('should return true for 401', () => {
        expect(new ApiError('Unauthorized', 401).isUnauthorized()).toBe(true)
      })

      it('should return false for other status codes', () => {
        expect(new ApiError('Forbidden', 403).isUnauthorized()).toBe(false)
      })
    })
  })

  describe('NetworkError', () => {
    it('should create error with default message', () => {
      const error = new NetworkError()

      expect(error.message).toBe('Network request failed')
      expect(error.name).toBe('NetworkError')
    })

    it('should create error with custom message', () => {
      const error = new NetworkError('Connection refused')

      expect(error.message).toBe('Connection refused')
    })

    it('should store original error', () => {
      const original = new Error('ECONNREFUSED')
      const error = new NetworkError('Connection failed', original)

      expect(error.originalError).toBe(original)
    })
  })

  describe('ValidationError', () => {
    it('should create error with message and errors array', () => {
      const errors = [
        { path: 'email', message: 'Invalid email format' },
        { path: 'name', message: 'Name is required' },
      ]
      const error = new ValidationError('Validation failed', errors)

      expect(error.message).toBe('Validation failed')
      expect(error.name).toBe('ValidationError')
      expect(error.errors).toEqual(errors)
    })

    it('should handle empty errors array', () => {
      const error = new ValidationError('Validation failed', [])

      expect(error.errors).toEqual([])
    })
  })
})
