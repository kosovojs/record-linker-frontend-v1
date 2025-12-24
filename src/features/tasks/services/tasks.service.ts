import { httpClient } from '@/services/api'
import type { TaskRead, PaginatedResponse } from '@/services/api/schemas'

interface ListTasksParams {
  page?: number
  page_size?: number
  status?: string
  has_candidates?: boolean
  min_score?: number
  max_score?: number
}

/**
 * Tasks API service
 */
export const tasksService = {
  async listByProject(
    projectUuid: string,
    params?: ListTasksParams
  ): Promise<PaginatedResponse<TaskRead>> {
    return httpClient.get(`/projects/${projectUuid}/tasks`, { params })
  },

  async get(uuid: string): Promise<TaskRead> {
    return httpClient.get(`/tasks/${uuid}`)
  },

  async skip(uuid: string, notes?: string): Promise<TaskRead> {
    return httpClient.post(`/tasks/${uuid}/skip`, notes ? { notes } : undefined)
  },
}
