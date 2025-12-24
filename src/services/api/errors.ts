/**
 * Custom API Error class for HTTP errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
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
  constructor(message = 'Network request failed', public originalError?: Error) {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * Validation error - thrown when Zod schema validation fails
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
