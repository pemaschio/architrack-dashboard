'use client'

import { useState } from 'react'
import { HoursBarChart } from './hours-bar-chart'
import { TimeEntriesTable } from './time-entries-table'
import { NewEntryDialog } from '@/components/shared/new-entry-dialog'
import { Plus } from 'lucide-react'

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
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)

  function handleBarClick(project: string) {
    setSelectedProject((prev) => (prev === project ? null : project))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
        <button
          onClick={() => setEntryDialogOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 9,
            background: '#1d4ed8', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(29,78,216,0.30)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1d4ed8')}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ marginTop: 0 }}>
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

      <NewEntryDialog
        open={entryDialogOpen}
        onClose={() => setEntryDialogOpen(false)}
      />
    </>
  )
}
