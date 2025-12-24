import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateDataset } from '../hooks'
import { useNavigate } from '@tanstack/react-router'

const createDatasetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase with only letters, numbers, hyphens, and underscores'),
  entity_type: z.string().min(1, 'Entity type is required'),
  description: z.string().optional(),
  source_url: z.string().url().optional().or(z.literal('')),
  source_type: z.enum(['web_scrape', 'api', 'file_import', 'manual']).optional(),
})

type CreateDatasetForm = z.infer<typeof createDatasetSchema>

interface CreateDatasetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDatasetDialog({ open, onOpenChange }: CreateDatasetDialogProps) {
  const navigate = useNavigate()
  const createMutation = useCreateDataset()

  const form = useForm<CreateDatasetForm>({
    resolver: zodResolver(createDatasetSchema),
    defaultValues: {
      name: '',
      slug: '',
      entity_type: '',
      description: '',
      source_url: '',
      source_type: undefined,
    },
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  const onSubmit = async (data: CreateDatasetForm) => {
    try {
      const dataset = await createMutation.mutateAsync({
        name: data.name,
        slug: data.slug,
        entity_type: data.entity_type,
        description: data.description || null,
        source_url: data.source_url || null,
        source_type: data.source_type,
      })
      form.reset()
      onOpenChange(false)
      // Navigate to the new dataset
      navigate({ to: '/datasets/$uuid', params: { uuid: dataset.uuid } })
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to create dataset:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Dataset</DialogTitle>
            <DialogDescription>
              Create a new dataset to import and reconcile entries.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                placeholder="Berlin Museums"
                {...form.register('name', {
                  onChange: (e) => {
                    const slug = generateSlug(e.target.value)
                    if (!form.getValues('slug')) {
                      form.setValue('slug', slug)
                    }
                  },
                })}
              />
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
              <Input
                id="slug"
                placeholder="berlin_museums"
                {...form.register('slug')}
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Unique identifier. Lowercase, numbers, hyphens, and underscores only.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="entity_type" className="text-sm font-medium">
                Entity Type <span className="text-destructive">*</span>
              </label>
              <Input
                id="entity_type"
                placeholder="museum, person, organization..."
                {...form.register('entity_type')}
              />
              {form.formState.errors.entity_type && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.entity_type.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The type of Wikidata items this dataset will match (e.g., Q5 for humans).
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="A collection of museums in Berlin..."
                rows={3}
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="source_type" className="text-sm font-medium">
                  Source Type
                </label>
                <Select
                  value={form.watch('source_type') ?? ''}
                  onValueChange={(value) =>
                    form.setValue('source_type', value as CreateDatasetForm['source_type'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Dataset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
