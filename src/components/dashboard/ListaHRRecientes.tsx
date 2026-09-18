import { Link } from 'react-router-dom'
import { FileText, ArrowRight, Plus } from 'lucide-react'
import type { HRReciente } from '../../hooks/useEstadisticas'

interface Props {
  datos: HRReciente[]
  isLoading?: boolean
}

const estadoConfig: Record<string, { label: string; color: string }> = {
  CREADA: { label: 'Creada', color: 'bg-neutral-100 text-neutral-700' },
  ENVIADA: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  PENDIENTE_CONFIRMACION: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-800'
  },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  OBSERVADA: { label: 'Observada', color: 'bg-yellow-100 text-yellow-800' },
  RECHAZADA: { label: 'Rechazada', color: 'bg-red-100 text-red-800' },
  DERIVADA: { label: 'Derivada', color: 'bg-purple-100 text-purple-800' },
  CONCLUIDA: { label: 'Concluida', color: 'bg-green-100 text-green-800' }
}

export default function ListaHRRecientes({ datos, isLoading }: Props) {
  const formatFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-700" />
          <h2 className="font-bold text-neutral-900">HR Recientes</h2>
        </div>
        <Link
          to="/hojas-ruta/nueva"
          className="text-xs text-primary-700 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva HR
        </Link>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
        </div>
      ) : datos.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <FileText className="w-16 h-16 text-neutral-200 mb-3" />
          <p className="text-sm text-neutral-500">No hay hojas de ruta</p>
          <Link
            to="/hojas-ruta/nueva"
            className="text-xs text-primary-700 hover:underline mt-2"
          >
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {datos.map((hr) => {
            const badge = estadoConfig[hr.estado] || {
              label: hr.estado,
              color: 'bg-neutral-100 text-neutral-700'
            }
            return (
              <Link
                key={hr.id}
                to={`/hojas-ruta/${hr.id}`}
                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 border border-neutral-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-primary-700 text-sm">
                      {hr.numero_unico}
                    </span>
                    <span className={`badge ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 truncate">
                    {hr.descripcion_contenido.substring(0, 60)}
                    {hr.descripcion_contenido.length > 60 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 flex-wrap">
                    <span>
                      <strong>De:</strong> {hr.remitente_nombre}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span>{formatFecha(hr.fecha_recepcion)}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </Link>
            )
          })}

          {/* Ver todas */}
          <div className="pt-2 border-t border-neutral-100">
            <Link
              to="/hojas-ruta"
              className="text-xs text-primary-700 hover:bg-primary-50 w-full py-2 rounded-lg text-center block font-medium transition-colors"
            >
              Ver todas las hojas de ruta →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}