import { useState } from 'react'
import { Search, ChevronDown, ChevronRight, ExternalLink, Trash2, FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, LoadingState, Pagination, ConfirmDialog } from '@/components/common'
import { useDatasetEntries, useDeleteEntry } from '../hooks'
import type { DatasetEntryRead } from '@/services/api/schemas'

interface EntryTableProps {
  datasetUuid: string
}

export function EntryTable({ datasetUuid }: EntryTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [search, setSearch] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [deleteEntry, setDeleteEntry] = useState<DatasetEntryRead | null>(null)

  const { data, isLoading, isError, error } = useDatasetEntries(datasetUuid, {
    page,
    page_size: pageSize,
    search: search || undefined,
  })

  const deleteMutation = useDeleteEntry()

  const toggleRow = (uuid: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(uuid)) {
        next.delete(uuid)
      } else {
        next.add(uuid)
      }
      return next
    })
  }

  const handleDelete = async () => {
    if (!deleteEntry) return
    await deleteMutation.mutateAsync({
      datasetUuid,
      entryUuid: deleteEntry.uuid,
    })
    setDeleteEntry(null)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  if (isLoading) {
    return <LoadingState message="Loading entries..." />
  }

  if (isError) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="Failed to load entries"
        description={error?.message || 'An error occurred while loading entries.'}
      />
    )
  }

  return (
    <>
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {data && data.items.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title={search ? 'No entries found' : 'No entries yet'}
          description={
            search
              ? `No entries match "${search}".`
              : 'Import entries from the Import tab to get started.'
          }
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead>External URL</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((entry) => (
                  <>
                    <TableRow key={entry.uuid}>
                      <TableCell>
                        {entry.raw_data && Object.keys(entry.raw_data).length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleRow(entry.uuid)}
                          >
                            {expandedRows.has(entry.uuid) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.display_name || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.external_id}
                      </TableCell>
                      <TableCell>
                        {entry.external_url ? (
                          <a
                            href={entry.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Link
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteEntry(entry)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(entry.uuid) && entry.raw_data && (
                      <TableRow key={`${entry.uuid}-expanded`}>
                        <TableCell colSpan={5} className="bg-muted/50 p-4">
                          <div className="text-sm">
                            <h4 className="font-medium mb-2">Raw Data</h4>
                            <div className="rounded border bg-background">
                              <Table>
                                <TableBody>
                                  {Object.entries(entry.raw_data).map(([key, value]) => (
                                    <TableRow key={key}>
                                      <TableCell className="font-medium w-1/4">
                                        {key}
                                      </TableCell>
                                      <TableCell className="font-mono text-xs">
                                        {typeof value === 'object'
                                          ? JSON.stringify(value)
                                          : String(value ?? '—')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {data && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              hasMore={data.has_more}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteEntry}
        onOpenChange={(open) => !open && setDeleteEntry(null)}
        title="Delete Entry"
        description={`Are you sure you want to delete entry "${deleteEntry?.display_name || deleteEntry?.external_id}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
