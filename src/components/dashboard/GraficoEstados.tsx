import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { PieChart as PieIcon, BarChart3 } from 'lucide-react'
import type { ConteoEstado } from '../../hooks/useEstadisticas'

interface Props {
  datos: ConteoEstado[]
  isLoading?: boolean
}

export default function GraficoEstados({ datos, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="w-5 h-5 text-primary-700" />
          <h2 className="font-bold text-neutral-900">HR por Estado</h2>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
        </div>
      </div>
    )
  }

  const total = datos.reduce((sum, d) => sum + d.total, 0)

  if (datos.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="w-5 h-5 text-primary-700" />
          <h2 className="font-bold text-neutral-900">HR por Estado</h2>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-16 h-16 text-neutral-200 mb-3" />
          <p className="text-sm text-neutral-500">
            No hay hojas de ruta para mostrar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-primary-700" />
          <h2 className="font-bold text-neutral-900">HR por Estado</h2>
        </div>
        <span className="badge bg-primary-100 text-primary-800">
          {total} total
        </span>
      </div>

      {/* Gráfico */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="total"
            >
              {datos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value ?? 0} HR`,
                datos.find((d) => d.label === name)?.label || name
              ]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda personalizada */}
      <div className="mt-4 space-y-2">
        {datos.map((d) => (
          <div
            key={d.estado}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-neutral-700">{d.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900">{d.total}</span>
              <span className="text-xs text-neutral-400">
                ({((d.total / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}