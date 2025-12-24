import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, ExternalLink } from "lucide-react"

const mockMatches = [
  {
    id: "1",
    externalName: "Mariya ABE",
    externalId: "Q13382634",
    externalDetails: "from KOR, born on 1999-01-12, gender W, functions Athlete.",
    wikidataName: "Abe Mariya",
    wikidataId: "Q13382634",
    wikidataDetails: "Person (*1999) ♀",
  },
  {
    id: "2",
    externalName: "Sune ADOLFSSON",
    externalId: "Q50346540",
    externalDetails: "from SWE, born on 1900-01-01, gender M, functions Not active.",
    wikidataName: "Sune Adolfsson",
    wikidataId: "Q50346540",
    wikidataDetails: "Biathlonists (*1950) ♂",
  },
  {
    id: "3",
    externalName: "Hervé BALLAND",
    externalId: "Q12290420",
    externalDetails: "from FRA, born on None, gender M, functions Not active.",
    wikidataName: "Hervé Balland",
    wikidataId: "Q12290420",
    wikidataDetails: "Distanču slēpotājs (*1964) ♂",
  },
  {
    id: "4",
    externalName: "Irina AGOLAKOVA",
    externalId: "Q28664944",
    externalDetails: "from RUS, born on None, gender W, functions Not active.",
    wikidataName: "Irina Agolakova",
    wikidataId: "Q28664944",
    wikidataDetails: "Biathlonists (*1965) ♀",
  },
  {
    id: "5",
    externalName: "Katja BALANTIČ",
    externalId: "Q11431522",
    externalDetails: "from SLO, born on 1991-12-24, gender W, functions Not active.",
    wikidataName: "Katja Balantič",
    wikidataId: "Q11431522",
    wikidataDetails: "Pětnieks",
  },
]

export default function AutomatchesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Automatches</h1>
              <p className="text-sm text-muted-foreground">IBU Biathlon Athletes 2025</p>
            </div>
          </div>
          <Link href="/projects/ibu-biathlon/work-panel">
            <Button variant="outline">Work Panel</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search preliminarily matched..." className="pl-9" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">Action</Button>
              <span className="text-sm text-muted-foreground">5 items • Page 1 of 1</span>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Preliminarily matched:</strong> These entries have been automatically matched with Wikidata items.
              Review and confirm or remove matches as needed.
            </p>
          </div>

          {/* Match Cards */}
          <div className="space-y-3">
            {mockMatches.map((match) => (
              <Card key={match.id} className="p-6">
                <div className="space-y-4">
                  {/* External Source Row */}
                  <div className="flex items-start justify-between pb-4 border-b border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-blue-600">{match.externalName}</h3>
                        <code className="text-sm bg-muted px-2 py-1 rounded">[{match.externalId}]</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{match.externalDetails}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Preliminarily matched</Badge>
                  </div>

                  {/* Wikidata Match Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{match.wikidataName}</h3>
                        <a
                          href={`https://www.wikidata.org/wiki/${match.wikidataId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <code className="text-sm">{match.wikidataId}</code>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground">{match.wikidataDetails}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Button variant="default" size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        Confirm
                      </Button>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Remove <span className="text-muted-foreground ml-1">[all]</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
