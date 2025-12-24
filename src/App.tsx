import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Record Linker</CardTitle>
          <CardDescription>
            Data reconciliation portal connecting external profiles to Wikidata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Phase 1 scaffolding complete. Ready for Phase 2: Core Infrastructure.
          </p>
          <div className="flex gap-2">
            <Button>Datasets</Button>
            <Button variant="outline">Projects</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
