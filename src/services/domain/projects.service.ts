import { httpClient } from '../api/client'
import { assertUuid } from '../api/schemas/common'
import type {
  ProjectRead,
  ProjectCreate,
  ProjectUpdate,
  ProjectStartRequest,
  ProjectStartResponse,
  ProjectStatsResponse,
  ApprovedMatchesResponse,
  PaginatedResponse,
  QueryParams,
} from '../api/schemas'

interface ProjectListParams {
  [key: string]: string | number | boolean | undefined | null
  page?: number
  page_size?: number
  status?: string
}

interface RerunTasksRequest {
  task_uuids: string[]
}

interface RerunTasksResponse {
  message: string
  tasks_requeued: number
}

/**
 * Projects API service
 */
export const projectsService = {
  // Project CRUD
  async list(params?: ProjectListParams): Promise<PaginatedResponse<ProjectRead>> {
    return httpClient.get<PaginatedResponse<ProjectRead>>('/projects', { params })
  },

  async get(uuid: string): Promise<ProjectRead> {
    assertUuid(uuid, 'project uuid')
    return httpClient.get<ProjectRead>(`/projects/${uuid}`)
  },

  async create(data: ProjectCreate): Promise<ProjectRead> {
    return httpClient.post<ProjectRead>('/projects', data)
  },

  async update(uuid: string, data: ProjectUpdate): Promise<ProjectRead> {
    assertUuid(uuid, 'project uuid')
    return httpClient.patch<ProjectRead>(`/projects/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    assertUuid(uuid, 'project uuid')
    return httpClient.delete<void>(`/projects/${uuid}`)
  },

  // Workflow operations
  async start(uuid: string, data: ProjectStartRequest): Promise<ProjectStartResponse> {
    assertUuid(uuid, 'project uuid')
    return httpClient.post<ProjectStartResponse>(`/projects/${uuid}/start`, data)
  },

  async rerunTasks(uuid: string, data: RerunTasksRequest): Promise<RerunTasksResponse> {
    assertUuid(uuid, 'project uuid')
    // Validate all task UUIDs
    data.task_uuids.forEach((taskUuid, idx) => {
      assertUuid(taskUuid, `task uuid[${idx}]`)
    })
    return httpClient.post<RerunTasksResponse>(`/projects/${uuid}/rerun-tasks`, data)
  },

  // Stats and results
  async getStats(uuid: string): Promise<ProjectStatsResponse> {
    assertUuid(uuid, 'project uuid')
    return httpClient.get<ProjectStatsResponse>(`/projects/${uuid}/stats`)
  },

  async getApprovedMatches(
    uuid: string,
    params?: { page?: number; page_size?: number }
  ): Promise<ApprovedMatchesResponse> {
    assertUuid(uuid, 'project uuid')
    return httpClient.get<ApprovedMatchesResponse>(
      `/projects/${uuid}/approved-matches`,
      { params: params as QueryParams }
    )
  },
}
