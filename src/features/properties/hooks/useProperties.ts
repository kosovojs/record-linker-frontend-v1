import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertiesService } from '@/services/domain'
import type {
  PropertyDefinitionCreate,
  PropertyDefinitionUpdate,
} from '@/services/api/schemas'

// Query keys for cache management
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: () => [...propertyKeys.lists()] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...propertyKeys.details(), uuid] as const,
}

/**
 * Hook to fetch all properties
 */
export function useProperties() {
  return useQuery({
    queryKey: propertyKeys.list(),
    queryFn: () => propertiesService.list(),
  })
}

/**
 * Hook to fetch a single property by UUID
 */
export function useProperty(uuid: string) {
  return useQuery({
    queryKey: propertyKeys.detail(uuid),
    queryFn: () => propertiesService.get(uuid),
    enabled: !!uuid,
  })
}

/**
 * Hook to create a new property
 */
export function useCreateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PropertyDefinitionCreate) =>
      propertiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
    },
  })
}

/**
 * Hook to update an existing property
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string
      data: PropertyDefinitionUpdate
    }) => propertiesService.update(uuid, data),
    onSuccess: (updatedProperty) => {
      queryClient.setQueryData(
        propertyKeys.detail(updatedProperty.uuid),
        updatedProperty
      )
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
    },
  })
}

/**
 * Hook to delete a property
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => propertiesService.delete(uuid),
    onSuccess: (_, uuid) => {
      queryClient.removeQueries({ queryKey: propertyKeys.detail(uuid) })
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
    },
  })
}
