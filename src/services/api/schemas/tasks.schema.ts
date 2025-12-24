import { z } from 'zod'

// Task Status enum
export const TaskStatusSchema = z.enum([
  'new',
  'queued_for_processing',
  'processing',
  'failed',
  'no_candidates_found',
  'awaiting_review',
  'reviewed',
  'auto_confirmed',
  'skipped',
  'knowledge_based',
])

// Task schemas
export const TaskReadSchema = z.object({
  uuid: z.string().uuid(),
  project_uuid: z.string().uuid(),
  dataset_entry_uuid: z.string().uuid(),
  status: TaskStatusSchema,
  notes: z.string().nullable(),
  accepted_wikidata_id: z.string().nullable(),
  candidate_count: z.number(),
  highest_score: z.number().nullable(),
  processing_started_at: z.string().nullable(),
  processing_finished_at: z.string().nullable(),
  reviewer_uuid: z.string().uuid().nullable(),
  reviewed_at: z.string().nullable(),
  extra_data: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
})

// Inferred types
export type TaskStatus = z.infer<typeof TaskStatusSchema>
export type TaskRead = z.infer<typeof TaskReadSchema>
