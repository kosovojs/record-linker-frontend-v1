import { config } from '@/config'
import { ApiError, NetworkError } from './errors'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: RequestOptions['params']): string {
  const url = new URL(endpoint, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.pathname + url.search
}

/**
 * Core HTTP client for API requests
 */
class HttpClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  /**
   * Get auth token from storage (placeholder for future auth)
   */
  private getAuthHeader(): Record<string, string> {
    // Future: const token = storage.get('auth_token')
    // if (token) return { Authorization: `Bearer ${token}` }
    return {}
  }

  /**
   * Core request method
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params, headers = {}, signal } = options

    const url = buildUrl(`${this.baseUrl}${endpoint}`, params)

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.getAuthHeader(),
      ...headers,
    }

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal,
    }

    if (body) {
      fetchOptions.body = JSON.stringify(body)
    }

    let response: Response

    try {
      response = await fetch(url, fetchOptions)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      throw new NetworkError('Network request failed', error as Error)
    }

    // Parse response
    let data: unknown
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      try {
        data = await response.json()
      } catch {
        data = null
      }
    } else if (response.status !== 204) {
      data = await response.text()
    }

    // Handle HTTP errors
    if (!response.ok) {
      const errorMessage =
        (data as { detail?: string })?.detail ||
        (data as { message?: string })?.message ||
        `HTTP ${response.status}`

      throw new ApiError(
        errorMessage,
        response.status,
        (data as { code?: string })?.code,
        data
      )
    }

    return data as T
  }

  // Convenience methods
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Singleton instance
export const httpClient = new HttpClient(config.apiBaseUrl)
