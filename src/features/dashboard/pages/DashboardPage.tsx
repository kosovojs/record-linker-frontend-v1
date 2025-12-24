import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { Database, FolderKanban, Settings, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Record Linker
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-5 w-5 text-primary" />
              </div>
              Datasets
            </CardTitle>
            <CardDescription>
              Manage your external data sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create datasets and import entries for reconciliation with Wikidata.
            </p>
            <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Link to="/datasets">
                Go to Datasets
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              Projects
            </CardTitle>
            <CardDescription>
              Reconciliation projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create projects to link dataset entries to Wikidata items.
            </p>
            <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Link to="/datasets">
                Go to Projects
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              Properties
            </CardTitle>
            <CardDescription>
              Property definitions for matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Define properties used for comparison and matching rules.
            </p>
            <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Link to="/properties">
                Go to Properties
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
            <CardDescription>
              Phase 3: Dataset Management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">Complete</Badge>
              <span className="text-sm">API Client & Zod Schemas</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Complete</Badge>
              <span className="text-sm">Redux Store & Service Layer</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">In Progress</Badge>
              <span className="text-sm">Dataset Management UI</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
