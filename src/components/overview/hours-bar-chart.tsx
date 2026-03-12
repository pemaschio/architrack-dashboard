'use client'

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
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-4">
          Horas por projeto — últimos 7 dias
        </h2>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Nenhum dado no período.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">
          Horas por projeto — últimos 7 dias (top 10)
        </h2>
        {selectedProject && (
          <span className="text-xs text-blue-600 font-medium">
            Filtrando por: {selectedProject}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-3">Clique em uma barra para filtrar os registros</p>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11 }} unit="h" />
          <Tooltip
            formatter={(value: number) => [`${value}h`, 'Horas']}
            contentStyle={{ fontSize: 12 }}
            cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
          />
          <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  selectedProject === null || selectedProject === undefined
                    ? '#2563EB'
                    : selectedProject === entry.name
                    ? '#2563EB'
                    : '#CBD5E1'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
