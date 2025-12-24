import { httpClient } from '@/services/api'
import type {
  MatchCandidateRead,
  MatchCandidateCreate,
  MatchCandidateUpdate,
  BulkCandidateUpdateRequest,
  AcceptRejectResponse,
} from '@/services/api/schemas'

/**
 * Candidates API service
 */
export const candidatesService = {
  async listByTask(taskUuid: string): Promise<MatchCandidateRead[]> {
    return httpClient.get(`/tasks/${taskUuid}/candidates`)
  },

  async create(taskUuid: string, data: MatchCandidateCreate): Promise<MatchCandidateRead> {
    return httpClient.post(`/tasks/${taskUuid}/candidates`, data)
  },

  async createBulk(
    taskUuid: string,
    candidates: MatchCandidateCreate[]
  ): Promise<{ created: number }> {
    return httpClient.post(`/tasks/${taskUuid}/candidates/bulk`, { candidates })
  },

  async get(uuid: string): Promise<MatchCandidateRead> {
    return httpClient.get(`/candidates/${uuid}`)
  },

  async update(uuid: string, data: MatchCandidateUpdate): Promise<MatchCandidateRead> {
    return httpClient.patch(`/candidates/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    return httpClient.delete(`/candidates/${uuid}`)
  },

  async accept(uuid: string): Promise<AcceptRejectResponse> {
    return httpClient.post(`/candidates/${uuid}/accept`)
  },

  async reject(uuid: string): Promise<AcceptRejectResponse> {
    return httpClient.post(`/candidates/${uuid}/reject`)
  },

  async bulkUpdate(data: BulkCandidateUpdateRequest): Promise<{ updated: number }> {
    return httpClient.patch('/candidates/bulk', data)
  },
}
