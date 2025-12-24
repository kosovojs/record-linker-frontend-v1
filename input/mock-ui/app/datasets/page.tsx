"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, ArrowLeft, Upload } from "lucide-react"

export default function DatasetsPage() {
  const [activeTab, setActiveTab] = useState("datasets")

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
              <h1 className="text-2xl font-semibold">Datasets</h1>
              <p className="text-sm text-muted-foreground">Manage external data sources</p>
            </div>
          </div>
          <Link href="/projects">
            <Button variant="outline">Projects</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="border-b border-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("datasets")}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === "datasets"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Datasets
              </button>
              <button
                onClick={() => setActiveTab("properties")}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === "properties"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Properties
              </button>
            </div>
          </div>

          {activeTab === "datasets" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search datasets..." className="pl-9" />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Dataset
                </Button>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>EliteProspects Hockey Players</CardTitle>
                        <CardDescription className="mt-2">
                          Complete database of professional hockey players from EliteProspects
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Entries: <span className="text-foreground font-medium">45,231</span>
                        </p>
                        <p className="text-muted-foreground">
                          Entry Type: <span className="text-foreground font-medium">Person</span>
                        </p>
                        <p className="text-muted-foreground">
                          URL: <span className="text-foreground font-medium">eliteprospects.com</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Entries
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Olympedia Athletes</CardTitle>
                        <CardDescription className="mt-2">
                          Olympic Games participants from Olympedia database
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Entries: <span className="text-foreground font-medium">127,849</span>
                        </p>
                        <p className="text-muted-foreground">
                          Entry Type: <span className="text-foreground font-medium">Athlete</span>
                        </p>
                        <p className="text-muted-foreground">
                          URL: <span className="text-foreground font-medium">olympedia.org</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Entries
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>IBU Biathlon Database</CardTitle>
                        <CardDescription className="mt-2">
                          International Biathlon Union athlete profiles
                        </CardDescription>
                      </div>
                      <Badge>Draft</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Entries: <span className="text-foreground font-medium">8,543</span>
                        </p>
                        <p className="text-muted-foreground">
                          Entry Type: <span className="text-foreground font-medium">Biathlete</span>
                        </p>
                        <p className="text-muted-foreground">
                          URL: <span className="text-foreground font-medium">biathlonworld.com</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Entries
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "properties" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search properties..." className="pl-9" />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Property
                </Button>
              </div>

              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Property Name</th>
                      <th className="text-left p-4 font-medium">Data Type</th>
                      <th className="text-left p-4 font-medium">Wikidata Property</th>
                      <th className="text-left p-4 font-medium">Usage Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">Date of Birth</td>
                      <td className="p-4">
                        <Badge variant="outline">Date</Badge>
                      </td>
                      <td className="p-4">
                        <code className="text-sm">P569</code>
                      </td>
                      <td className="p-4">3</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">Country</td>
                      <td className="p-4">
                        <Badge variant="outline">String</Badge>
                      </td>
                      <td className="p-4">
                        <code className="text-sm">P27</code>
                      </td>
                      <td className="p-4">3</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">Full Name</td>
                      <td className="p-4">
                        <Badge variant="outline">String</Badge>
                      </td>
                      <td className="p-4">
                        <code className="text-sm">P1559</code>
                      </td>
                      <td className="p-4">3</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">Achievements</td>
                      <td className="p-4">
                        <Badge variant="outline">Text</Badge>
                      </td>
                      <td className="p-4">
                        <code className="text-sm">P166</code>
                      </td>
                      <td className="p-4">2</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">Position</td>
                      <td className="p-4">
                        <Badge variant="outline">String</Badge>
                      </td>
                      <td className="p-4">
                        <code className="text-sm">P413</code>
                      </td>
                      <td className="p-4">1</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="p-4">Height</td>
                      <td className="p-4">
                        <Badge variant="outline">Number</Badge>
                      </td>
                      <td className="p-4">
                        <code className="text-sm">P2048</code>
                      </td>
                      <td className="p-4">2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
