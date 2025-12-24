import { httpClient } from '@/services/api'
import type {
  DatasetRead,
  DatasetCreate,
  DatasetUpdate,
  DatasetEntryRead,
  DatasetEntryCreate,
  PaginatedResponse,
} from '@/services/api/schemas'

interface ListParams {
  page?: number
  page_size?: number
  search?: string
}

/**
 * Datasets API service
 */
export const datasetsService = {
  // Dataset CRUD
  async list(params?: ListParams): Promise<PaginatedResponse<DatasetRead>> {
    return httpClient.get('/datasets', { params })
  },

  async get(uuid: string): Promise<DatasetRead> {
    return httpClient.get(`/datasets/${uuid}`)
  },

  async create(data: DatasetCreate): Promise<DatasetRead> {
    return httpClient.post('/datasets', data)
  },

  async update(uuid: string, data: DatasetUpdate): Promise<DatasetRead> {
    return httpClient.patch(`/datasets/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    return httpClient.delete(`/datasets/${uuid}`)
  },

  // Dataset Entries
  async listEntries(
    datasetUuid: string,
    params?: ListParams
  ): Promise<PaginatedResponse<DatasetEntryRead>> {
    return httpClient.get(`/datasets/${datasetUuid}/entries`, { params })
  },

  async getEntry(datasetUuid: string, entryUuid: string): Promise<DatasetEntryRead> {
    return httpClient.get(`/datasets/${datasetUuid}/entries/${entryUuid}`)
  },

  async createEntry(datasetUuid: string, data: DatasetEntryCreate): Promise<DatasetEntryRead> {
    return httpClient.post(`/datasets/${datasetUuid}/entries`, data)
  },

  async createEntriesBulk(
    datasetUuid: string,
    entries: DatasetEntryCreate[]
  ): Promise<{ created: number }> {
    return httpClient.post(`/datasets/${datasetUuid}/entries/bulk`, { entries })
  },

  async deleteEntry(datasetUuid: string, entryUuid: string): Promise<void> {
    return httpClient.delete(`/datasets/${datasetUuid}/entries/${entryUuid}`)
  },
}
