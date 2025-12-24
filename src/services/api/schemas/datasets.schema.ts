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

// Dataset Source Types
export const DatasetSourceTypeSchema = z.enum([
  'web_scrape',
  'api',
  'file_import',
  'manual',
])

// Dataset schemas
export const DatasetReadSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  source_url: z.string().nullable(),
  source_type: DatasetSourceTypeSchema.nullable(),
  entity_type: z.string(),
  entry_count: z.number(),
  last_synced_at: z.string().nullable(),
  extra_data: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
})

export const DatasetCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  entity_type: z.string().min(1),
  description: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  source_type: DatasetSourceTypeSchema.optional(),
  extra_data: z.record(z.unknown()).optional(),
})

export const DatasetUpdateSchema = DatasetCreateSchema.partial()

// Dataset Entry schemas
export const DatasetEntryReadSchema = z.object({
  uuid: z.string().uuid(),
  dataset_uuid: z.string().uuid().nullable(),
  external_id: z.string(),
  external_url: z.string().nullable(),
  display_name: z.string().nullable(),
  raw_data: z.record(z.unknown()).nullable(),
  extra_data: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
})

export const DatasetEntryCreateSchema = z.object({
  external_id: z.string().min(1),
  display_name: z.string().nullable().optional(),
  external_url: z.string().nullable().optional(),
  raw_data: z.record(z.unknown()).nullable().optional(),
  extra_data: z.record(z.unknown()).optional(),
})

// Inferred types
export type DatasetSourceType = z.infer<typeof DatasetSourceTypeSchema>
export type DatasetRead = z.infer<typeof DatasetReadSchema>
export type DatasetCreate = z.infer<typeof DatasetCreateSchema>
export type DatasetUpdate = z.infer<typeof DatasetUpdateSchema>
export type DatasetEntryRead = z.infer<typeof DatasetEntryReadSchema>
export type DatasetEntryCreate = z.infer<typeof DatasetEntryCreateSchema>
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}
