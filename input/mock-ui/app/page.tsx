import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, FolderKanban } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">WikiMatch</h1>
          <p className="text-sm text-muted-foreground">Data Reconciliation Platform</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Connect External Datasets to Wikidata</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage external datasets and reconcile profiles with Wikidata entities through automated matching and
              human-in-the-loop review interfaces.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <Database className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Datasets</CardTitle>
                <CardDescription>
                  Manage external datasets, define properties, and upload entries from sources like EliteProspects and
                  Olympedia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/datasets">
                  <Button className="w-full">Manage Datasets</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <FolderKanban className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Create reconciliation projects, review matching tasks, and approve connections between external
                  profiles and Wikidata items.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/projects">
                  <Button className="w-full">Manage Projects</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
