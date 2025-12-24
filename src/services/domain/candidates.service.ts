import { httpClient } from '../api/client'
import { assertUuid } from '../api/schemas/common'
import type {
  MatchCandidateRead,
  MatchCandidateCreate,
  MatchCandidateUpdate,
  BulkCandidateUpdateRequest,
  AcceptRejectResponse,
} from '../api/schemas'

/**
 * Candidates API service
 */
export const candidatesService = {
  async listByTask(taskUuid: string): Promise<MatchCandidateRead[]> {
    assertUuid(taskUuid, 'task uuid')
    return httpClient.get<MatchCandidateRead[]>(`/tasks/${taskUuid}/candidates`)
  },

  async create(
    taskUuid: string,
    data: MatchCandidateCreate
  ): Promise<MatchCandidateRead> {
    assertUuid(taskUuid, 'task uuid')
    return httpClient.post<MatchCandidateRead>(
      `/tasks/${taskUuid}/candidates`,
      data
    )
  },

  async createBulk(
    taskUuid: string,
    candidates: MatchCandidateCreate[]
  ): Promise<{ created: number }> {
    assertUuid(taskUuid, 'task uuid')
    return httpClient.post<{ created: number }>(
      `/tasks/${taskUuid}/candidates/bulk`,
      { candidates }
    )
  },

  async get(uuid: string): Promise<MatchCandidateRead> {
    assertUuid(uuid, 'candidate uuid')
    return httpClient.get<MatchCandidateRead>(`/candidates/${uuid}`)
  },

  async update(
    uuid: string,
    data: MatchCandidateUpdate
  ): Promise<MatchCandidateRead> {
    assertUuid(uuid, 'candidate uuid')
    return httpClient.patch<MatchCandidateRead>(`/candidates/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    assertUuid(uuid, 'candidate uuid')
    return httpClient.delete<void>(`/candidates/${uuid}`)
  },

  async accept(uuid: string): Promise<AcceptRejectResponse> {
    assertUuid(uuid, 'candidate uuid')
    return httpClient.post<AcceptRejectResponse>(`/candidates/${uuid}/accept`)
  },

  async reject(uuid: string): Promise<AcceptRejectResponse> {
    assertUuid(uuid, 'candidate uuid')
    return httpClient.post<AcceptRejectResponse>(`/candidates/${uuid}/reject`)
  },

  async bulkUpdate(data: BulkCandidateUpdateRequest): Promise<{ updated: number }> {
    // Validate all candidate UUIDs
    data.candidate_uuids.forEach((candidateUuid, idx) => {
      assertUuid(candidateUuid, `candidate uuid[${idx}]`)
    })
    return httpClient.patch<{ updated: number }>('/candidates/bulk', data)
  },
}
