import { z } from 'zod'

// Property Data Type enum
export const PropertyDataTypeSchema = z.enum([
  'text',
  'date',
  'number',
  'url',
  'email',
  'identifier',
])

// Property schemas
export const PropertyDefinitionReadSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  display_name: z.string(),
  description: z.string().nullable(),
  data_type_hint: PropertyDataTypeSchema,
  is_multivalued: z.boolean(),
  is_searchable: z.boolean(),
  is_display_field: z.boolean(),
  display_order: z.number(),
  wikidata_property: z.string().nullable(),
  validation_regex: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const PropertyDefinitionCreateSchema = z.object({
  name: z.string().min(1),
  display_name: z.string().min(1),
  description: z.string().nullable().optional(),
  data_type_hint: PropertyDataTypeSchema,
  is_multivalued: z.boolean().optional(),
  is_searchable: z.boolean().optional(),
  is_display_field: z.boolean().optional(),
  display_order: z.number().optional(),
  wikidata_property: z.string().nullable().optional(),
  validation_regex: z.string().nullable().optional(),
})

export const PropertyDefinitionUpdateSchema = PropertyDefinitionCreateSchema.partial()

// Inferred types
export type PropertyDataType = z.infer<typeof PropertyDataTypeSchema>
export type PropertyDefinitionRead = z.infer<typeof PropertyDefinitionReadSchema>
export type PropertyDefinitionCreate = z.infer<typeof PropertyDefinitionCreateSchema>
export type PropertyDefinitionUpdate = z.infer<typeof PropertyDefinitionUpdateSchema>
