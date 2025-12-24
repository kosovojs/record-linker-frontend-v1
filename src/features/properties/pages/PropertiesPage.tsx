import { useState } from 'react'
import { Plus, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, EmptyState, LoadingState, ConfirmDialog } from '@/components/common'
import { PropertyDialog } from '../components/PropertyDialog'
import { useProperties, useDeleteProperty } from '../hooks'
import type { PropertyDefinitionRead } from '@/services/api/schemas'

export function PropertiesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editProperty, setEditProperty] = useState<PropertyDefinitionRead | null>(null)
  const [deleteProperty, setDeleteProperty] = useState<PropertyDefinitionRead | null>(null)

  const { data: properties, isLoading, isError, error } = useProperties()
  const deleteMutation = useDeleteProperty()

  const handleDelete = async () => {
    if (!deleteProperty) return
    await deleteMutation.mutateAsync(deleteProperty.uuid)
    setDeleteProperty(null)
  }

  const dataTypeLabels: Record<string, string> = {
    text: 'Text',
    date: 'Date',
    number: 'Number',
    url: 'URL',
    email: 'Email',
    identifier: 'Identifier',
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Properties"
        description="Define properties used for comparison and matching rules"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Property
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading properties..." />}

      {isError && (
        <EmptyState
          icon={<Settings className="h-12 w-12" />}
          title="Failed to load properties"
          description={error?.message || 'An error occurred while loading properties.'}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          }
        />
      )}

      {properties && properties.length === 0 && (
        <EmptyState
          icon={<Settings className="h-12 w-12" />}
          title="No properties defined"
          description="Properties define how your data fields are compared during reconciliation."
          action={
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Property
            </Button>
          }
        />
      )}

      {properties && properties.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Wikidata Property</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.uuid}>
                  <TableCell className="font-mono text-sm">
                    {property.name}
                  </TableCell>
                  <TableCell className="font-medium">
                    {property.display_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {dataTypeLabels[property.data_type_hint] || property.data_type_hint}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {property.wikidata_property ? (
                      <a
                        href={`https://www.wikidata.org/wiki/Property:${property.wikidata_property}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {property.wikidata_property}
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {property.is_searchable && (
                        <Badge variant="secondary" className="text-xs">
                          Searchable
                        </Badge>
                      )}
                      {property.is_display_field && (
                        <Badge variant="secondary" className="text-xs">
                          Display
                        </Badge>
                      )}
                      {property.is_multivalued && (
                        <Badge variant="secondary" className="text-xs">
                          Multi
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditProperty(property)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteProperty(property)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PropertyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
      />

      {editProperty && (
        <PropertyDialog
          open={!!editProperty}
          onOpenChange={(open) => !open && setEditProperty(null)}
          mode="edit"
          property={editProperty}
        />
      )}

      <ConfirmDialog
        open={!!deleteProperty}
        onOpenChange={(open) => !open && setDeleteProperty(null)}
        title="Delete Property"
        description={`Are you sure you want to delete "${deleteProperty?.display_name}"? This may affect matching rules that use this property.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
