import { httpClient } from '@/services/api'
import type {
  ProjectRead,
  ProjectCreate,
  ProjectUpdate,
  ProjectStartRequest,
  ProjectStartResponse,
  ProjectStatsResponse,
  ApprovedMatchesResponse,
  PaginatedResponse,
} from '@/services/api/schemas'

interface ListParams {
  page?: number
  page_size?: number
  status?: string
}

/**
 * Projects API service
 */
export const projectsService = {
  // Project CRUD
  async list(params?: ListParams): Promise<PaginatedResponse<ProjectRead>> {
    return httpClient.get('/projects', { params })
  },

  async get(uuid: string): Promise<ProjectRead> {
    return httpClient.get(`/projects/${uuid}`)
  },

  async create(data: ProjectCreate): Promise<ProjectRead> {
    return httpClient.post('/projects', data)
  },

  async update(uuid: string, data: ProjectUpdate): Promise<ProjectRead> {
    return httpClient.patch(`/projects/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    return httpClient.delete(`/projects/${uuid}`)
  },

  // Workflow operations
  async start(uuid: string, data: ProjectStartRequest): Promise<ProjectStartResponse> {
    return httpClient.post(`/projects/${uuid}/start`, data)
  },

  async rerunTasks(
    uuid: string,
    data: { task_uuids: string[] }
  ): Promise<{ message: string; tasks_requeued: number }> {
    return httpClient.post(`/projects/${uuid}/rerun-tasks`, data)
  },

  // Stats and results
  async getStats(uuid: string): Promise<ProjectStatsResponse> {
    return httpClient.get(`/projects/${uuid}/stats`)
  },

  async getApprovedMatches(
    uuid: string,
    params?: { page?: number; page_size?: number }
  ): Promise<ApprovedMatchesResponse> {
    return httpClient.get(`/projects/${uuid}/approved-matches`, { params })
  },
}
