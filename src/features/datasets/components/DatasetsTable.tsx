import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MoreHorizontal, Trash2, ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/common'
import { useDeleteDataset } from '../hooks'
import type { DatasetRead } from '@/services/api/schemas'

interface DatasetsTableProps {
  datasets: DatasetRead[]
}

export function DatasetsTable({ datasets }: DatasetsTableProps) {
  const [deleteDataset, setDeleteDataset] = useState<DatasetRead | null>(null)
  const deleteMutation = useDeleteDataset()

  const handleDelete = async () => {
    if (!deleteDataset) return
    await deleteMutation.mutateAsync(deleteDataset.uuid)
    setDeleteDataset(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((dataset) => (
              <TableRow key={dataset.uuid}>
                <TableCell>
                  <div className="space-y-1">
                    <Link
                      to="/datasets/$uuid"
                      params={{ uuid: dataset.uuid }}
                      className="font-medium hover:underline"
                    >
                      {dataset.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {dataset.slug}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{dataset.entity_type}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {dataset.entry_count.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dataset.last_synced_at
                    ? formatDate(dataset.last_synced_at)
                    : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(dataset.created_at)}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDataset(dataset)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete dataset</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteDataset}
        onOpenChange={(open) => !open && setDeleteDataset(null)}
        title="Delete Dataset"
        description={`Are you sure you want to delete "${deleteDataset?.name}"? This action cannot be undone and will also delete all entries in this dataset.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
