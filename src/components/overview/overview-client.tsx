'use client'

import { useState } from 'react'
import { HoursBarChart } from './hours-bar-chart'
import { TimeEntriesTable } from './time-entries-table'

interface TimeEntry {
  id: string
  duration_min: number | null
  started_at: string
  description: string | null
  source: string
  users: { name: string } | null
  projects: { name: string } | null
  activity_types: { name: string } | null
}

interface Props {
  chartData: { name: string; horas: number }[]
  entries: TimeEntry[]
}

export function OverviewClient({ chartData, entries }: Props) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  function handleBarClick(project: string) {
    setSelectedProject((prev) => (prev === project ? null : project))
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <HoursBarChart
        data={chartData}
        selectedProject={selectedProject}
        onBarClick={handleBarClick}
      />
      <TimeEntriesTable
        entries={entries}
        filterProject={selectedProject}
        onClearFilter={() => setSelectedProject(null)}
      />
    </div>
  )
}
