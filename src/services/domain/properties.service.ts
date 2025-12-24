import { httpClient } from '@/services/api/client'
import { assertUuid } from '@/services/api/schemas/common'
import type {
  PropertyDefinitionRead,
  PropertyDefinitionCreate,
  PropertyDefinitionUpdate,
} from '@/services/api/schemas'

/**
 * Properties API service
 */
export const propertiesService = {
  async list(): Promise<PropertyDefinitionRead[]> {
    return httpClient.get<PropertyDefinitionRead[]>('/properties')
  },

  async get(uuid: string): Promise<PropertyDefinitionRead> {
    assertUuid(uuid, 'property uuid')
    return httpClient.get<PropertyDefinitionRead>(`/properties/${uuid}`)
  },

  async create(data: PropertyDefinitionCreate): Promise<PropertyDefinitionRead> {
    return httpClient.post<PropertyDefinitionRead>('/properties', data)
  },

  async update(
    uuid: string,
    data: PropertyDefinitionUpdate
  ): Promise<PropertyDefinitionRead> {
    assertUuid(uuid, 'property uuid')
    return httpClient.patch<PropertyDefinitionRead>(`/properties/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    assertUuid(uuid, 'property uuid')
    return httpClient.delete<void>(`/properties/${uuid}`)
  },
}
