import { z } from 'zod'

// Candidate Status enum
export const CandidateStatusSchema = z.enum([
  'suggested',
  'accepted',
  'rejected',
])

// Candidate Source enum
export const CandidateSourceSchema = z.enum([
  'automated_search',
  'manual',
  'file_import',
  'ai_suggestion',
  'knowledge_base',
])

// Candidate schemas
export const MatchCandidateReadSchema = z.object({
  uuid: z.string().uuid(),
  task_uuid: z.string().uuid(),
  wikidata_id: z.string(),
  score: z.number(),
  source: CandidateSourceSchema,
  status: CandidateStatusSchema,
  score_breakdown: z.record(z.unknown()).nullable(),
  matched_properties: z.record(z.unknown()).nullable(),
  notes: z.string().nullable(),
  tags: z.array(z.string()),
  reviewer_uuid: z.string().uuid().nullable(),
  reviewed_at: z.string().nullable(),
  extra_data: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
})

export const MatchCandidateCreateSchema = z.object({
  wikidata_id: z.string().min(1),
  score: z.number().optional(),
  source: CandidateSourceSchema.optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export const MatchCandidateUpdateSchema = z.object({
  score: z.number().optional(),
  status: CandidateStatusSchema.optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  extra_data: z.record(z.unknown()).optional(),
})

export const BulkCandidateCreateSchema = z.object({
  candidates: z.array(MatchCandidateCreateSchema),
})

export const BulkCandidateUpdateRequestSchema = z.object({
  candidate_uuids: z.array(z.string().uuid()),
  updates: MatchCandidateUpdateSchema,
})

// Accept/Reject response includes both task and candidate
export const AcceptRejectResponseSchema = z.object({
  task: z.object({
    uuid: z.string().uuid(),
    status: z.string(),
    accepted_wikidata_id: z.string().nullable(),
    candidate_count: z.number(),
    highest_score: z.number().nullable(),
  }),
  candidate: MatchCandidateReadSchema,
})

// Inferred types
export type CandidateStatus = z.infer<typeof CandidateStatusSchema>
export type CandidateSource = z.infer<typeof CandidateSourceSchema>
export type MatchCandidateRead = z.infer<typeof MatchCandidateReadSchema>
export type MatchCandidateCreate = z.infer<typeof MatchCandidateCreateSchema>
export type MatchCandidateUpdate = z.infer<typeof MatchCandidateUpdateSchema>
export type BulkCandidateCreate = z.infer<typeof BulkCandidateCreateSchema>
export type BulkCandidateUpdateRequest = z.infer<typeof BulkCandidateUpdateRequestSchema>
export type AcceptRejectResponse = z.infer<typeof AcceptRejectResponseSchema>
