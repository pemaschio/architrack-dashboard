'use client'

import type { CSSProperties } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { BarChart2, X } from 'lucide-react'

// Color palette for bars (matches project-colors system)
const BAR_PALETTE = [
  '#B5614A', '#0066CC', '#16A34A', '#9333EA', '#D97706',
  '#0891B2', '#DB2777', '#65A30D', '#7C3AED', '#EA580C',
]

interface Props {
  data: { name: string; horas: number }[]
  selectedProject?: string | null
  onBarClick?: (project: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, horas } = payload[0].payload as { name: string; horas: number }
  return (
    <div style={{
      background: '#0f172a', color: '#f8fafc',
      borderRadius: 8, padding: '8px 12px',
      fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
      pointerEvents: 'none',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 2 }}>{name}</p>
      <p style={{ color: '#94a3b8' }}>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>{horas}h</span> registradas
      </p>
    </div>
  )
}

export function HoursBarChart({ data, selectedProject, onBarClick }: Props) {
  const cardStyle: CSSProperties = {
    background: '#ffffff',
    borderRadius: 12,
    padding: '20px 22px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
  }

  if (data.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <BarChart2 style={{ width: 16, height: 16, color: '#B5614A' }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0B', margin: 0 }}>
            Horas por projeto
          </h2>
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'rgba(10,10,11,0.38)',
            padding: '2px 7px', background: 'rgba(10,10,11,0.05)', borderRadius: 999,
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>Últimos 7 dias</span>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 200, gap: 8,
        }}>
          <BarChart2 style={{ width: 32, height: 32, color: '#e2e8f0' }} />
          <p style={{ fontSize: 13, color: 'rgba(10,10,11,0.32)' }}>Nenhum dado no período.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 style={{ width: 16, height: 16, color: '#B5614A' }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0B', margin: 0 }}>
            Horas por projeto
          </h2>
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'rgba(10,10,11,0.38)',
            padding: '2px 7px', background: 'rgba(10,10,11,0.05)', borderRadius: 999,
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>Últimos 7 dias</span>
        </div>

        {/* Active filter pill */}
        {selectedProject && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(181,97,74,0.08)', border: '1px solid rgba(181,97,74,0.20)',
            fontSize: 11, fontWeight: 600, color: '#B5614A',
          }}>
            {selectedProject}
            {onBarClick && (
              <button
                onClick={(e) => { e.stopPropagation(); onBarClick(selectedProject) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B5614A', padding: 0, display: 'flex' }}
              >
                <X style={{ width: 10, height: 10 }} />
              </button>
            )}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'rgba(10,10,11,0.32)', marginBottom: 16, marginLeft: 24 }}>
        {onBarClick ? 'Clique em uma barra para filtrar os registros abaixo' : ''}
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={270}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, left: -16, bottom: 36 }}
          onClick={(e) => {
            if (e?.activeLabel && onBarClick) onBarClick(e.activeLabel as string)
          }}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        >
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(10,10,11,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'rgba(10,10,11,0.45)', fontWeight: 500 }}
            angle={-28}
            textAnchor="end"
            interval={0}
            axisLine={false}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(10,10,11,0.30)' }}
            unit="h"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(181,97,74,0.04)', radius: 4 }} />
          <Bar dataKey="horas" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => {
              const isSelected = selectedProject === null || selectedProject === undefined
              const isActive = isSelected || selectedProject === entry.name
              return (
                <Cell
                  key={entry.name}
                  fill={isActive ? BAR_PALETTE[i % BAR_PALETTE.length] : 'rgba(10,10,11,0.08)'}
                  opacity={isActive ? 1 : 0.5}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend dots */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8, paddingLeft: 8 }}>
        {data.map((entry, i) => (
          <button
            key={entry.name}
            onClick={() => onBarClick?.(entry.name)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
              opacity: selectedProject && selectedProject !== entry.name ? 0.4 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: 2,
              background: BAR_PALETTE[i % BAR_PALETTE.length],
            }} />
            <span style={{ fontSize: 11, color: 'rgba(10,10,11,0.55)', fontWeight: 500 }}>
              {entry.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(10,10,11,0.70)' }}>
              {entry.horas}h
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
