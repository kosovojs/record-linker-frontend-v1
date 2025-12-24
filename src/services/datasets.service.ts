import { httpClient } from './api/client'
import { assertUuid } from './api/schemas/common'
import type {
  DatasetRead,
  DatasetCreate,
  DatasetUpdate,
  DatasetEntryRead,
  DatasetEntryCreate,
  PaginatedResponse,
  ListParams,
} from './api/schemas'

/**
 * Datasets API service
 */
export const datasetsService = {
  // Dataset CRUD
  async list(params?: ListParams): Promise<PaginatedResponse<DatasetRead>> {
    return httpClient.get<PaginatedResponse<DatasetRead>>('/datasets', { params })
  },

  async get(uuid: string): Promise<DatasetRead> {
    assertUuid(uuid, 'dataset uuid')
    return httpClient.get<DatasetRead>(`/datasets/${uuid}`)
  },

  async create(data: DatasetCreate): Promise<DatasetRead> {
    return httpClient.post<DatasetRead>('/datasets', data)
  },

  async update(uuid: string, data: DatasetUpdate): Promise<DatasetRead> {
    assertUuid(uuid, 'dataset uuid')
    return httpClient.patch<DatasetRead>(`/datasets/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    assertUuid(uuid, 'dataset uuid')
    return httpClient.delete<void>(`/datasets/${uuid}`)
  },

  // Dataset Entries
  async listEntries(
    datasetUuid: string,
    params?: ListParams
  ): Promise<PaginatedResponse<DatasetEntryRead>> {
    assertUuid(datasetUuid, 'dataset uuid')
    return httpClient.get<PaginatedResponse<DatasetEntryRead>>(
      `/datasets/${datasetUuid}/entries`,
      { params }
    )
  },

  async getEntry(datasetUuid: string, entryUuid: string): Promise<DatasetEntryRead> {
    assertUuid(datasetUuid, 'dataset uuid')
    assertUuid(entryUuid, 'entry uuid')
    return httpClient.get<DatasetEntryRead>(
      `/datasets/${datasetUuid}/entries/${entryUuid}`
    )
  },

  async createEntry(
    datasetUuid: string,
    data: DatasetEntryCreate
  ): Promise<DatasetEntryRead> {
    assertUuid(datasetUuid, 'dataset uuid')
    return httpClient.post<DatasetEntryRead>(
      `/datasets/${datasetUuid}/entries`,
      data
    )
  },

  async createEntriesBulk(
    datasetUuid: string,
    entries: DatasetEntryCreate[]
  ): Promise<{ created: number }> {
    assertUuid(datasetUuid, 'dataset uuid')
    return httpClient.post<{ created: number }>(
      `/datasets/${datasetUuid}/entries/bulk`,
      { entries }
    )
  },

  async deleteEntry(datasetUuid: string, entryUuid: string): Promise<void> {
    assertUuid(datasetUuid, 'dataset uuid')
    assertUuid(entryUuid, 'entry uuid')
    return httpClient.delete<void>(
      `/datasets/${datasetUuid}/entries/${entryUuid}`
    )
  },
}
