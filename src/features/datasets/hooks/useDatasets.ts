import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datasetsService } from '@/services/domain'
import type { DatasetCreate, DatasetUpdate, ListParams } from '@/services/api/schemas'

// Query keys for cache management
export const datasetKeys = {
  all: ['datasets'] as const,
  lists: () => [...datasetKeys.all, 'list'] as const,
  list: (params?: ListParams) => [...datasetKeys.lists(), params] as const,
  details: () => [...datasetKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...datasetKeys.details(), uuid] as const,
}

/**
 * Hook to fetch paginated list of datasets
 */
export function useDatasets(params?: ListParams) {
  return useQuery({
    queryKey: datasetKeys.list(params),
    queryFn: () => datasetsService.list(params),
  })
}

/**
 * Hook to fetch a single dataset by UUID
 */
export function useDataset(uuid: string) {
  return useQuery({
    queryKey: datasetKeys.detail(uuid),
    queryFn: () => datasetsService.get(uuid),
    enabled: !!uuid,
  })
}

/**
 * Hook to create a new dataset
 */
export function useCreateDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DatasetCreate) => datasetsService.create(data),
    onSuccess: () => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}

/**
 * Hook to update an existing dataset
 */
export function useUpdateDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: DatasetUpdate }) =>
      datasetsService.update(uuid, data),
    onSuccess: (updatedDataset) => {
      // Update the cache for this specific dataset
      queryClient.setQueryData(
        datasetKeys.detail(updatedDataset.uuid),
        updatedDataset
      )
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}

/**
 * Hook to delete a dataset
 */
export function useDeleteDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => datasetsService.delete(uuid),
    onSuccess: (_, uuid) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: datasetKeys.detail(uuid) })
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}
