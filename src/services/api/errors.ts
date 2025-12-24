/**
 * Custom API Error class for HTTP errors
 */
export class ApiError extends Error {
  status: number
  code?: string
  data?: unknown

  constructor(
    message: string,
    status: number,
    code?: string,
    data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  isServerError(): boolean {
    return this.status >= 500
  }

  isNotFound(): boolean {
    return this.status === 404
  }

  isUnauthorized(): boolean {
    return this.status === 401
  }
}

/**
 * Network error - thrown when fetch fails entirely
 */
export class NetworkError extends Error {
  originalError?: Error

  constructor(message = 'Network request failed', originalError?: Error) {
    super(message)
    this.name = 'NetworkError'
    this.originalError = originalError
  }
}

/**
 * Validation error - thrown when Zod schema validation fails
 */
export class ValidationError extends Error {
  errors: Array<{ path: string; message: string }>

  constructor(
    message: string,
    errors: Array<{ path: string; message: string }>
  ) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}
