import { z } from 'zod'

// Common pagination response wrapper
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    page_size: z.number(),
    has_more: z.boolean(),
  })

// Generic paginated response type (for service return types)
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// Common list params interface
// Index signature required for compatibility with httpClient params type
export interface ListParams {
  [key: string]: string | number | boolean | undefined | null
  page?: number
  page_size?: number
  search?: string
}

// Type alias for query params (for use in service files)
export type QueryParams = Record<string, string | number | boolean | undefined | null>

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validate that a string is a valid UUID
 */
export function isValidUuid(value: string): boolean {
  return uuidRegex.test(value)
}

/**
 * Assert that a string is a valid UUID, throw if not
 */
export function assertUuid(value: string, fieldName = 'uuid'): void {
  if (!isValidUuid(value)) {
    throw new Error(`Invalid UUID format for ${fieldName}: ${value}`)
  }
}
