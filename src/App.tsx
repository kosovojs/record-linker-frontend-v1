import { AppShell } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function App() {
  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Record Linker
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Datasets
                <Badge variant="secondary">0</Badge>
              </CardTitle>
              <CardDescription>
                Manage your external data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No datasets yet. Create one to get started.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Projects
                <Badge variant="secondary">0</Badge>
              </CardTitle>
              <CardDescription>
                Reconciliation projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No projects yet. Create a dataset first.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Phase 2 Infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">Complete</Badge>
                <span className="text-sm">API Client</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Complete</Badge>
                <span className="text-sm">Zod Schemas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Complete</Badge>
                <span className="text-sm">Redux Store</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

export default App
