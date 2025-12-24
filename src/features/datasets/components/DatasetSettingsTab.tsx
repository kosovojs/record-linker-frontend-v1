import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/common'
import { useUpdateDataset, useDeleteDataset } from '../hooks'
import type { DatasetRead } from '@/services/api/schemas'

const updateDatasetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase with only letters, numbers, hyphens, and underscores'),
  entity_type: z.string().min(1, 'Entity type is required'),
  description: z.string().optional(),
  source_url: z.string().url().optional().or(z.literal('')),
  source_type: z.enum(['web_scrape', 'api', 'file_import', 'manual']).optional().nullable(),
})

type UpdateDatasetForm = z.infer<typeof updateDatasetSchema>

interface DatasetSettingsTabProps {
  dataset: DatasetRead
}

export function DatasetSettingsTab({ dataset }: DatasetSettingsTabProps) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const updateMutation = useUpdateDataset()
  const deleteMutation = useDeleteDataset()

  const form = useForm<UpdateDatasetForm>({
    resolver: zodResolver(updateDatasetSchema),
    defaultValues: {
      name: dataset.name,
      slug: dataset.slug,
      entity_type: dataset.entity_type,
      description: dataset.description || '',
      source_url: dataset.source_url || '',
      source_type: dataset.source_type,
    },
  })

  const onSubmit = async (data: UpdateDatasetForm) => {
    try {
      await updateMutation.mutateAsync({
        uuid: dataset.uuid,
        data: {
          name: data.name,
          slug: data.slug,
          entity_type: data.entity_type,
          description: data.description || null,
          source_url: data.source_url || null,
          source_type: data.source_type || undefined,
        },
      })
    } catch (error) {
      console.error('Failed to update dataset:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(dataset.uuid)
      navigate({ to: '/datasets' })
    } catch (error) {
      console.error('Failed to delete dataset:', error)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Dataset Settings</CardTitle>
          <CardDescription>Update the dataset metadata and configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug <span className="text-destructive">*</span>
              </label>
              <Input id="slug" {...form.register('slug')} />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="entity_type" className="text-sm font-medium">
                Entity Type <span className="text-destructive">*</span>
              </label>
              <Input id="entity_type" {...form.register('entity_type')} />
              {form.formState.errors.entity_type && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.entity_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea id="description" rows={3} {...form.register('description')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="source_type" className="text-sm font-medium">
                  Source Type
                </label>
                <Select
                  value={form.watch('source_type') ?? 'none'}
                  onValueChange={(value) =>
                    form.setValue(
                      'source_type',
                      value === 'none' ? null : (value as UpdateDatasetForm['source_type'])
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="file_import">File Import</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="web_scrape">Web Scrape</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="source_url" className="text-sm font-medium">
                  Source URL
                </label>
                <Input
                  id="source_url"
                  type="url"
                  placeholder="https://..."
                  {...form.register('source_url')}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            These actions are destructive and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Dataset</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this dataset and all its entries.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Dataset
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Dataset?"
        description={`Are you sure you want to delete "${dataset.name}"? This will permanently remove the dataset and all ${dataset.entry_count} entries. This action cannot be undone.`}
        confirmLabel="Delete Dataset"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
