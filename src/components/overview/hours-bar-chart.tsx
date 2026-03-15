'use client'

import type { CSSProperties } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  data: { name: string; horas: number }[]
  selectedProject?: string | null
  onBarClick?: (project: string) => void
}

export function HoursBarChart({ data, selectedProject, onBarClick }: Props) {
  const cardStyle: CSSProperties = {
    background: '#ffffff',
    borderRadius: 10,
    padding: '20px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
  }

  if (data.length === 0) {
    return (
      <div style={cardStyle}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0B', marginBottom: 16, margin: '0 0 16px' }}>
          Horas por projeto — últimos 7 dias
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 192, fontSize: 13, color: 'rgba(10,10,11,0.32)' }}>
          Nenhum dado no período.
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0B', margin: 0 }}>
          Horas por projeto — últimos 7 dias
        </h2>
        {selectedProject && (
          <span style={{ fontSize: 11, fontWeight: 500, color: '#B5614A' }}>
            {selectedProject}
          </span>
        )}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(10,10,11,0.32)', marginBottom: 16, marginTop: 2 }}>
        Clique em uma barra para filtrar os registros
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 40 }}
          onClick={(e) => {
            if (e?.activeLabel && onBarClick) {
              onBarClick(e.activeLabel as string)
            }
          }}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        >
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(10,10,11,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10.5, fill: 'rgba(10,10,11,0.42)' }}
            angle={-30}
            textAnchor="end"
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10.5, fill: 'rgba(10,10,11,0.32)' }}
            unit="h"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value}h`, 'Horas']}
            contentStyle={{
              fontSize: 12,
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              padding: '8px 12px',
            }}
            cursor={{ fill: 'rgba(181,97,74,0.04)' }}
          />
          <Bar dataKey="horas" radius={[5, 5, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  selectedProject === null || selectedProject === undefined
                    ? '#B5614A'
                    : selectedProject === entry.name
                    ? '#B5614A'
                    : 'rgba(10,10,11,0.10)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
