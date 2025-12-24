import { z } from 'zod'

// Project Status enum
export const ProjectStatusSchema = z.enum([
  'draft',
  'active',
  'pending_search',
  'search_in_progress',
  'search_completed',
  'pending_processing',
  'processing',
  'processing_failed',
  'review_ready',
  'completed',
  'archived',
])

// Project schemas
export const ProjectReadSchema = z.object({
  uuid: z.string().uuid(),
  dataset_uuid: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  status: ProjectStatusSchema,
  owner_uuid: z.string().uuid().nullable(),
  task_count: z.number(),
  tasks_completed: z.number(),
  tasks_with_candidates: z.number(),
  config: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  dataset_uuid: z.string().uuid(),
  description: z.string().nullable().optional(),
  config: z.record(z.unknown()).optional(),
})

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: ProjectStatusSchema.optional(),
  config: z.record(z.unknown()).optional(),
})

// Project workflow schemas
export const ProjectStartRequestSchema = z.object({
  entry_uuids: z.array(z.string().uuid()).nullable().optional(),
  all_entries: z.boolean().optional(),
})

export const ProjectStartResponseSchema = z.object({
  message: z.string(),
  tasks_created: z.number(),
  project_status: z.string(),
})

export const ProjectStatsResponseSchema = z.object({
  total_tasks: z.number(),
  by_status: z.record(z.number()),
  candidates: z.object({
    total: z.number(),
    avg_per_task: z.number(),
  }),
  avg_score: z.number().nullable(),
  progress_percent: z.number(),
})

export const ApprovedMatchSchema = z.object({
  task_uuid: z.string(),
  entry_external_id: z.string(),
  entry_display_name: z.string().nullable(),
  wikidata_id: z.string(),
  score: z.number(),
})

export const ApprovedMatchesResponseSchema = z.object({
  matches: z.array(ApprovedMatchSchema),
  total: z.number(),
})

// Inferred types
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>
export type ProjectRead = z.infer<typeof ProjectReadSchema>
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>
export type ProjectStartRequest = z.infer<typeof ProjectStartRequestSchema>
export type ProjectStartResponse = z.infer<typeof ProjectStartResponseSchema>
export type ProjectStatsResponse = z.infer<typeof ProjectStatsResponseSchema>
export type ApprovedMatch = z.infer<typeof ApprovedMatchSchema>
export type ApprovedMatchesResponse = z.infer<typeof ApprovedMatchesResponseSchema>
