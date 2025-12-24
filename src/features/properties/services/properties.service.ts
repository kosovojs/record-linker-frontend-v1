import { httpClient } from '@/services/api'
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
    return httpClient.get('/properties')
  },

  async get(uuid: string): Promise<PropertyDefinitionRead> {
    return httpClient.get(`/properties/${uuid}`)
  },

  async create(data: PropertyDefinitionCreate): Promise<PropertyDefinitionRead> {
    return httpClient.post('/properties', data)
  },

  async update(uuid: string, data: PropertyDefinitionUpdate): Promise<PropertyDefinitionRead> {
    return httpClient.patch(`/properties/${uuid}`, data)
  },

  async delete(uuid: string): Promise<void> {
    return httpClient.delete(`/properties/${uuid}`)
  },
}
