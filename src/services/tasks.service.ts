import { httpClient } from './api/client'
import { assertUuid } from './api/schemas/common'
import type { TaskRead, PaginatedResponse } from './api/schemas'

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
    assertUuid(projectUuid, 'project uuid')
    return httpClient.get<PaginatedResponse<TaskRead>>(
      `/projects/${projectUuid}/tasks`,
      { params }
    )
  },

  async get(uuid: string): Promise<TaskRead> {
    assertUuid(uuid, 'task uuid')
    return httpClient.get<TaskRead>(`/tasks/${uuid}`)
  },

  async skip(uuid: string, notes?: string): Promise<TaskRead> {
    assertUuid(uuid, 'task uuid')
    return httpClient.post<TaskRead>(
      `/tasks/${uuid}/skip`,
      notes ? { notes } : undefined
    )
  },
}
