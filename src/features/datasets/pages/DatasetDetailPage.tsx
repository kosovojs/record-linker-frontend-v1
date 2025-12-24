import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Database, Upload, Settings, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingState, EmptyState } from '@/components/common'
import { useDataset } from '../hooks'
import { EntryTable } from '../components/EntryTable'
import { EntryImportWizard } from '../components/EntryImportWizard'
import { DatasetSettingsTab } from '../components/DatasetSettingsTab'

export function DatasetDetailPage() {
  const { uuid } = useParams({ from: '/datasets/$uuid' })
  const [activeTab, setActiveTab] = useState('entries')

  const { data: dataset, isLoading, isError, error } = useDataset(uuid)

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading dataset..." />
      </div>
    )
  }

  if (isError || !dataset) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<Database className="h-12 w-12" />}
          title="Dataset not found"
          description={error?.message || 'The requested dataset could not be found.'}
          action={
            <Button asChild variant="outline">
              <Link to="/datasets">Back to Datasets</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/datasets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{dataset.name}</h1>
            {dataset.description && (
              <p className="text-muted-foreground mt-1">{dataset.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary">{dataset.entity_type}</Badge>
              <span className="text-sm text-muted-foreground">
                {dataset.entry_count} {dataset.entry_count === 1 ? 'entry' : 'entries'}
              </span>
              {dataset.last_synced_at && (
                <span className="text-sm text-muted-foreground">
                  Last synced: {new Date(dataset.last_synced_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="entries" className="gap-2">
            <List className="h-4 w-4" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="mt-6">
          <EntryTable datasetUuid={uuid} />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <EntryImportWizard datasetUuid={uuid} onComplete={() => setActiveTab('entries')} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <DatasetSettingsTab dataset={dataset} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
