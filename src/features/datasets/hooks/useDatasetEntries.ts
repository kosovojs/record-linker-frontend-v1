import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datasetsService } from '@/services/domain'
import type { DatasetEntryCreate, ListParams } from '@/services/api/schemas'
import { datasetKeys } from './useDatasets'

// Query keys for entries
export const entryKeys = {
  all: ['entries'] as const,
  lists: () => [...entryKeys.all, 'list'] as const,
  list: (datasetUuid: string, params?: ListParams) =>
    [...entryKeys.lists(), datasetUuid, params] as const,
  details: () => [...entryKeys.all, 'detail'] as const,
  detail: (datasetUuid: string, entryUuid: string) =>
    [...entryKeys.details(), datasetUuid, entryUuid] as const,
}

/**
 * Hook to fetch paginated entries for a dataset
 */
export function useDatasetEntries(datasetUuid: string, params?: ListParams) {
  return useQuery({
    queryKey: entryKeys.list(datasetUuid, params),
    queryFn: () => datasetsService.listEntries(datasetUuid, params),
    enabled: !!datasetUuid,
  })
}

/**
 * Hook to fetch a single entry
 */
export function useDatasetEntry(datasetUuid: string, entryUuid: string) {
  return useQuery({
    queryKey: entryKeys.detail(datasetUuid, entryUuid),
    queryFn: () => datasetsService.getEntry(datasetUuid, entryUuid),
    enabled: !!datasetUuid && !!entryUuid,
  })
}

/**
 * Hook to create a single entry
 */
export function useCreateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      datasetUuid,
      data,
    }: {
      datasetUuid: string
      data: DatasetEntryCreate
    }) => datasetsService.createEntry(datasetUuid, data),
    onSuccess: (_, { datasetUuid }) => {
      // Invalidate entries list
      queryClient.invalidateQueries({
        queryKey: entryKeys.list(datasetUuid),
      })
      // Invalidate dataset to update entry_count
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(datasetUuid),
      })
    },
  })
}

/**
 * Hook to bulk import entries
 */
export function useImportEntries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      datasetUuid,
      entries,
    }: {
      datasetUuid: string
      entries: DatasetEntryCreate[]
    }) => datasetsService.createEntriesBulk(datasetUuid, entries),
    onSuccess: (_, { datasetUuid }) => {
      // Invalidate entries list
      queryClient.invalidateQueries({
        queryKey: entryKeys.list(datasetUuid),
      })
      // Invalidate dataset to update entry_count
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(datasetUuid),
      })
      // Also invalidate datasets list for entry count
      queryClient.invalidateQueries({
        queryKey: datasetKeys.lists(),
      })
    },
  })
}

/**
 * Hook to delete an entry
 */
export function useDeleteEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      datasetUuid,
      entryUuid,
    }: {
      datasetUuid: string
      entryUuid: string
    }) => datasetsService.deleteEntry(datasetUuid, entryUuid),
    onSuccess: (_, { datasetUuid, entryUuid }) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: entryKeys.detail(datasetUuid, entryUuid),
      })
      // Invalidate entries list
      queryClient.invalidateQueries({
        queryKey: entryKeys.list(datasetUuid),
      })
      // Invalidate dataset to update entry_count
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(datasetUuid),
      })
    },
  })
}
