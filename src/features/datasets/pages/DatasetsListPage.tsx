import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, Database, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader, EmptyState, LoadingState, Pagination } from '@/components/common'
import { DatasetsTable } from '../components/DatasetsTable'
import { CreateDatasetDialog } from '../components/CreateDatasetDialog'
import { useDatasets } from '../hooks'

export function DatasetsListPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data, isLoading, isError, error } = useDatasets({
    page,
    page_size: pageSize,
    search: search || undefined,
  })

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on new search
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Datasets"
        description="Manage your external data sources for reconciliation"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Dataset
          </Button>
        }
      >
        <div className="mt-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </PageHeader>

      {isLoading && <LoadingState message="Loading datasets..." />}

      {isError && (
        <EmptyState
          icon={<Database className="h-12 w-12" />}
          title="Failed to load datasets"
          description={error?.message || 'An error occurred while loading datasets.'}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          }
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={<Database className="h-12 w-12" />}
          title={search ? 'No datasets found' : 'No datasets yet'}
          description={
            search
              ? `No datasets match "${search}". Try a different search term.`
              : 'Create your first dataset to get started with data reconciliation.'
          }
          action={
            !search && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Dataset
              </Button>
            )
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <DatasetsTable datasets={data.items} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data.total}
            hasMore={data.has_more}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <CreateDatasetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
