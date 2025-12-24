import { useEffect } from 'react'
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
import { useCreateProperty, useUpdateProperty } from '../hooks'
import type { PropertyDefinitionRead } from '@/services/api/schemas'

const propertySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .regex(/^[a-z_][a-z0-9_]*$/, 'Name must be lowercase with underscores only'),
  display_name: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  data_type_hint: z.enum(['text', 'date', 'number', 'url', 'email', 'identifier']),
  is_multivalued: z.boolean(),
  is_searchable: z.boolean(),
  is_display_field: z.boolean(),
  wikidata_property: z
    .string()
    .regex(/^P\d+$/, 'Must be a valid Wikidata property ID (e.g., P569)')
    .optional()
    .or(z.literal('')),
  validation_regex: z.string().optional(),
})

type PropertyForm = z.infer<typeof propertySchema>

interface PropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  property?: PropertyDefinitionRead
}

export function PropertyDialog({
  open,
  onOpenChange,
  mode,
  property,
}: PropertyDialogProps) {
  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty()

  const form = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      display_name: '',
      description: '',
      data_type_hint: 'text',
      is_multivalued: false,
      is_searchable: true,
      is_display_field: false,
      wikidata_property: '',
      validation_regex: '',
    },
  })

  // Reset form when property changes (edit mode)
  useEffect(() => {
    if (property && mode === 'edit') {
      form.reset({
        name: property.name,
        display_name: property.display_name,
        description: property.description || '',
        data_type_hint: property.data_type_hint as PropertyForm['data_type_hint'],
        is_multivalued: property.is_multivalued,
        is_searchable: property.is_searchable,
        is_display_field: property.is_display_field,
        wikidata_property: property.wikidata_property || '',
        validation_regex: property.validation_regex || '',
      })
    } else if (mode === 'create') {
      form.reset({
        name: '',
        display_name: '',
        description: '',
        data_type_hint: 'text',
        is_multivalued: false,
        is_searchable: true,
        is_display_field: false,
        wikidata_property: '',
        validation_regex: '',
      })
    }
  }, [property, mode, form])

  const onSubmit = async (data: PropertyForm) => {
    try {
      const payload = {
        name: data.name,
        display_name: data.display_name,
        description: data.description || null,
        data_type_hint: data.data_type_hint,
        is_multivalued: data.is_multivalued,
        is_searchable: data.is_searchable,
        is_display_field: data.is_display_field,
        wikidata_property: data.wikidata_property || null,
        validation_regex: data.validation_regex || null,
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
      } else if (property) {
        await updateMutation.mutateAsync({
          uuid: property.uuid,
          data: payload,
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save property:', error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Property' : 'Edit Property'}
            </DialogTitle>
            <DialogDescription>
              Define a property for use in matching and comparison rules.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="birth_date"
                  {...form.register('name')}
                  disabled={mode === 'edit'}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="display_name" className="text-sm font-medium">
                  Display Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="display_name"
                  placeholder="Birth Date"
                  {...form.register('display_name')}
                />
                {form.formState.errors.display_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.display_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Date of birth for matching with Wikidata P569..."
                rows={2}
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Type</label>
                <Select
                  value={form.watch('data_type_hint')}
                  onValueChange={(value) =>
                    form.setValue('data_type_hint', value as PropertyForm['data_type_hint'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="identifier">Identifier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="wikidata_property" className="text-sm font-medium">
                  Wikidata Property
                </label>
                <Input
                  id="wikidata_property"
                  placeholder="P569"
                  {...form.register('wikidata_property')}
                />
                {form.formState.errors.wikidata_property && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.wikidata_property.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Flags</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...form.register('is_searchable')}
                    className="rounded"
                  />
                  Searchable
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...form.register('is_display_field')}
                    className="rounded"
                  />
                  Display Field
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...form.register('is_multivalued')}
                    className="rounded"
                  />
                  Multi-valued
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="validation_regex" className="text-sm font-medium">
                Validation Regex
              </label>
              <Input
                id="validation_regex"
                placeholder="^\d{4}-\d{2}-\d{2}$"
                {...form.register('validation_regex')}
              />
              <p className="text-xs text-muted-foreground">
                Optional regex pattern for validating field values.
              </p>
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
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Property'
                  : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
