import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectsService } from './projects.service'
import { httpClient } from '@/services/api/client'

// Mock the httpClient
vi.mock('@/services/api/client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('projectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validUuid = '123e4567-e89b-12d3-a456-426614174000'

  describe('list', () => {
    it('should call httpClient.get with correct endpoint', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ items: [], total: 0 })

      await projectsService.list()

      expect(httpClient.get).toHaveBeenCalledWith('/projects', { params: undefined })
    })

    it('should pass query params', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ items: [], total: 0 })

      await projectsService.list({ page: 1, page_size: 10, status: 'active' })

      expect(httpClient.get).toHaveBeenCalledWith('/projects', {
        params: { page: 1, page_size: 10, status: 'active' },
      })
    })
  })

  describe('get', () => {
    it('should call httpClient.get with correct endpoint', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ uuid: validUuid, name: 'Test' })

      await projectsService.get(validUuid)

      expect(httpClient.get).toHaveBeenCalledWith(`/projects/${validUuid}`)
    })

    it('should throw for invalid UUID', async () => {
      await expect(projectsService.get('invalid-uuid')).rejects.toThrow('Invalid UUID format')
    })
  })

  describe('create', () => {
    it('should call httpClient.post with correct data', async () => {
      const projectData = { name: 'New Project', description: 'Test' }
      vi.mocked(httpClient.post).mockResolvedValueOnce({ uuid: validUuid, ...projectData })

      await projectsService.create(projectData as any)

      expect(httpClient.post).toHaveBeenCalledWith('/projects', projectData)
    })
  })

  describe('update', () => {
    it('should call httpClient.patch with correct data', async () => {
      const updateData = { name: 'Updated Name' }
      vi.mocked(httpClient.patch).mockResolvedValueOnce({ uuid: validUuid, name: 'Updated Name' })

      await projectsService.update(validUuid, updateData as any)

      expect(httpClient.patch).toHaveBeenCalledWith(`/projects/${validUuid}`, updateData)
    })

    it('should throw for invalid UUID', async () => {
      await expect(projectsService.update('bad', {} as any)).rejects.toThrow('Invalid UUID format')
    })
  })

  describe('delete', () => {
    it('should call httpClient.delete with correct endpoint', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await projectsService.delete(validUuid)

      expect(httpClient.delete).toHaveBeenCalledWith(`/projects/${validUuid}`)
    })

    it('should throw for invalid UUID', async () => {
      await expect(projectsService.delete('invalid')).rejects.toThrow('Invalid UUID format')
    })
  })

  describe('start', () => {
    it('should call httpClient.post to start project', async () => {
      const startData = { source_dataset_uuid: validUuid, target_dataset_uuid: validUuid }
      vi.mocked(httpClient.post).mockResolvedValueOnce({ message: 'Started' })

      await projectsService.start(validUuid, startData as any)

      expect(httpClient.post).toHaveBeenCalledWith(`/projects/${validUuid}/start`, startData)
    })
  })

  describe('rerunTasks', () => {
    it('should call httpClient.post with task UUIDs', async () => {
      const taskUuids = [validUuid, '550e8400-e29b-41d4-a716-446655440000']
      vi.mocked(httpClient.post).mockResolvedValueOnce({ message: 'Rerun', tasks_requeued: 2 })

      await projectsService.rerunTasks(validUuid, { task_uuids: taskUuids })

      expect(httpClient.post).toHaveBeenCalledWith(
        `/projects/${validUuid}/rerun-tasks`,
        { task_uuids: taskUuids }
      )
    })

    it('should throw for invalid project UUID', async () => {
      await expect(
        projectsService.rerunTasks('invalid', { task_uuids: [validUuid] })
      ).rejects.toThrow('Invalid UUID format')
    })

    it('should throw for invalid task UUID in array', async () => {
      await expect(
        projectsService.rerunTasks(validUuid, { task_uuids: ['invalid-task-uuid'] })
      ).rejects.toThrow('Invalid UUID format')
    })
  })

  describe('getStats', () => {
    it('should call httpClient.get for stats', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ total_tasks: 10 })

      await projectsService.getStats(validUuid)

      expect(httpClient.get).toHaveBeenCalledWith(`/projects/${validUuid}/stats`)
    })

    it('should throw for invalid UUID', async () => {
      await expect(projectsService.getStats('invalid')).rejects.toThrow('Invalid UUID format')
    })
  })

  describe('getApprovedMatches', () => {
    it('should call httpClient.get for approved matches', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ items: [], total: 0 })

      await projectsService.getApprovedMatches(validUuid)

      expect(httpClient.get).toHaveBeenCalledWith(
        `/projects/${validUuid}/approved-matches`,
        { params: undefined }
      )
    })

    it('should pass pagination params', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ items: [], total: 0 })

      await projectsService.getApprovedMatches(validUuid, { page: 2, page_size: 25 })

      expect(httpClient.get).toHaveBeenCalledWith(
        `/projects/${validUuid}/approved-matches`,
        { params: { page: 2, page_size: 25 } }
      )
    })

    it('should throw for invalid UUID', async () => {
      await expect(projectsService.getApprovedMatches('invalid')).rejects.toThrow()
    })
  })
})
