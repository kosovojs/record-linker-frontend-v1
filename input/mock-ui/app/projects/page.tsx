import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Plus, ArrowLeft } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Projects</h1>
              <p className="text-sm text-muted-foreground">Manage reconciliation projects</p>
            </div>
          </div>
          <Link href="/datasets">
            <Button variant="outline">Datasets</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-9" />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>IBU Biathlon Athletes 2025</CardTitle>
                    <CardDescription className="mt-2">
                      Reconcile biathlon athletes from IBU database with Wikidata
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-500">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">60% complete</span>
                  </div>
                  <Progress value={60} />
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-semibold mt-1">8,543</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold mt-1">2,341</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Review</p>
                    <p className="text-2xl font-semibold mt-1">1,078</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold mt-1">5,124</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href="/projects/ibu-biathlon/work-panel">
                    <Button variant="outline" size="sm">
                      Work Panel
                    </Button>
                  </Link>
                  <Link href="/projects/ibu-biathlon/automatches">
                    <Button variant="outline" size="sm">
                      Review Automatches
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>EliteProspects NHL Players</CardTitle>
                    <CardDescription className="mt-2">Match NHL players with their Wikidata entities</CardDescription>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">85% complete</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-semibold mt-1">12,450</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold mt-1">892</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Review</p>
                    <p className="text-2xl font-semibold mt-1">976</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold mt-1">10,582</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href="/projects/nhl-players/work-panel">
                    <Button variant="outline" size="sm">
                      Work Panel
                    </Button>
                  </Link>
                  <Link href="/projects/nhl-players/automatches">
                    <Button variant="outline" size="sm">
                      Review Automatches
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Olympedia 2024 Paris</CardTitle>
                    <CardDescription className="mt-2">Paris 2024 Olympic athletes reconciliation</CardDescription>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">100% complete</span>
                  </div>
                  <Progress value={100} />
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-semibold mt-1">10,714</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold mt-1">0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Review</p>
                    <p className="text-2xl font-semibold mt-1">0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold mt-1">10,714</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" disabled>
                    Work Panel
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Review Automatches
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
