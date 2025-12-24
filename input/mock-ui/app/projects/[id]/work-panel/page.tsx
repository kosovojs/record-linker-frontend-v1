"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Copy, Plus, Check, X } from "lucide-react"

const mockTasks = [
  { id: "1", name: "Mariya ABE", status: "Review", country: "JPN" },
  { id: "2", name: "Sune ADOLFSSON", status: "Review", country: "SWE" },
  { id: "3", name: "Hervé BALLAND", status: "Reviewed", country: "FRA" },
  { id: "4", name: "Irina AGOLAKOVA", status: "Reviewed", country: "RUS" },
  { id: "5", name: "latgales 250, riga", status: "Review", country: "LVA" },
]

const mockCandidates = [
  {
    address: "Mariya ABE [Q13382634]",
    source: "Wikidata",
    description: "from KOR, born on 1999-01-12, gender W, functions Athlete",
    approved: false,
  },
  {
    address: "Latgales iela 250 k-8, Riga",
    source: "OSM",
    description: "Residential address in Riga, Latvia",
    approved: true,
  },
  {
    address: "Latgales iela 250 k-11, Riga",
    source: "OSM",
    description: "Residential address in Riga, Latvia",
    approved: false,
  },
]

export default function WorkPanelPage() {
  const [selectedTask, setSelectedTask] = useState(mockTasks[4])
  const [currentIndex, setCurrentIndex] = useState(4)

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
              <h1 className="text-2xl font-semibold">Work Panel</h1>
              <p className="text-sm text-muted-foreground">IBU Biathlon Athletes 2025</p>
            </div>
          </div>
          <Link href="/projects/ibu-biathlon/automatches">
            <Button variant="outline">Automatches View</Button>
          </Link>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Task List */}
        <div className="w-72 border-r border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold mb-3">Tasks</h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tasks..." className="pl-9" size="sm" />
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Filter tasks
            </Button>
          </div>

          <div className="p-2">
            <p className="text-xs text-muted-foreground px-2 mb-2">5 items • Page 1 of 1</p>
            {mockTasks.map((task, index) => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task)
                  setCurrentIndex(index)
                }}
                className={`p-3 rounded-md cursor-pointer mb-1 flex items-center justify-between ${
                  selectedTask.id === task.id ? "bg-primary/10 border border-primary" : "hover:bg-muted"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.name}</p>
                  <p className="text-xs text-muted-foreground">{task.country}</p>
                </div>
                <Badge
                  variant={task.status === "Reviewed" ? "secondary" : "default"}
                  className={
                    task.status === "Reviewed" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                  }
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} of {mockTasks.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex(Math.min(mockTasks.length - 1, currentIndex + 1))}
                  disabled={currentIndex === mockTasks.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">60% done</span>
                <span className="text-sm font-medium">Task 5798475e</span>
              </div>
            </div>

            {/* Task Title */}
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-semibold">{selectedTask.name}</h2>
              <Button variant="ghost" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
              <Badge className="bg-purple-100 text-purple-700">Reviewed</Badge>
            </div>

            {/* Data Section */}
            <div className="mb-6">
              <p className="text-sm">
                <span className="font-medium">Data:</span>{" "}
                <span className="text-muted-foreground">input:address={selectedTask.name}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Manual Candidates
              </Button>
              <Button variant="outline">Edit Approved Candidate</Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9" />
              </div>
              <Button variant="outline">All</Button>
              <Button variant="outline">All Sources</Button>
              <Button variant="link" size="sm">
                Select all
              </Button>
              <Button variant="link" size="sm">
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <p className="text-muted-foreground">13 visible of 13 total.</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="fast-track" className="rounded" />
                  <label htmlFor="fast-track" className="text-muted-foreground">
                    Fast-track: auto-next after approve
                  </label>
                </div>
                <p className="text-muted-foreground">Tips: A approve, M manual candidates, N next task</p>
              </div>
            </div>

            {/* Candidates Table - Split View */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Original Candidates */}
              <div>
                <h3 className="font-semibold mb-3">Address</h3>
                <div className="space-y-2">
                  {mockCandidates.map((candidate, idx) => (
                    <Card key={idx} className={`p-4 ${candidate.approved ? "border-green-500 bg-green-50/50" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" className="rounded" />
                            <p className="font-medium text-sm">{candidate.address}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-muted px-2 py-1 rounded">{candidate.source}</span>
                            {candidate.approved && <span className="text-green-600">● approved</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column - Additional Candidates */}
              <div>
                <h3 className="font-semibold mb-3">Address</h3>
                <div className="space-y-2">
                  {mockCandidates.slice(0, 3).map((candidate, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" className="rounded" />
                            <p className="font-medium text-sm">
                              {candidate.address.replace("250", `250${String.fromCharCode(65 + idx)}`)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-muted px-2 py-1 rounded">{candidate.source}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-6 h-96 bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Map Visualization</p>
                <p className="text-sm text-muted-foreground">Interactive map would show candidate locations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
