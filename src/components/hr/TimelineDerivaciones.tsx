import { CheckCircle2, Clock, XCircle, Eye, Send } from 'lucide-react'
import type { Derivacion, EstadoDerivacion } from '../../types'

interface Props {
  derivaciones: Derivacion[]
}

const estadoConfig: Record<
  EstadoDerivacion,
  { label: string; color: string; icono: any }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icono: Clock
  },
  CONFIRMADA: {
    label: 'Confirmada',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icono: CheckCircle2
  },
  OBSERVADA: {
    label: 'Observada',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icono: Eye
  },
  RECHAZADA: {
    label: 'Rechazada',
    color: 'bg-red-100 text-red-800 border-red-300',
    icono: XCircle
  }
}

export default function TimelineDerivaciones({ derivaciones }: Props) {
  if (derivaciones.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Sin derivaciones registradas
      </p>
    )
  }

  return (
    <ol className="relative">
      {derivaciones.map((d, index) => {
        const config = estadoConfig[d.estado]
        const Icono = config.icono
        const esUltima = index === derivaciones.length - 1

        return (
          <li key={d.id} className="relative pl-8 pb-6">
            {/* Línea vertical */}
            {!esUltima && (
              <span className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Círculo */}
            <span
              className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                d.estado === 'PENDIENTE'
                  ? 'border-amber-400'
                  : d.estado === 'CONFIRMADA'
                  ? 'border-blue-400'
                  : d.estado === 'OBSERVADA'
                  ? 'border-yellow-400'
                  : 'border-red-400'
              }`}
            >
              <Icono
                className={`w-3.5 h-3.5 ${
                  d.estado === 'PENDIENTE'
                    ? 'text-amber-500'
                    : d.estado === 'CONFIRMADA'
                    ? 'text-blue-500'
                    : d.estado === 'OBSERVADA'
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}
              />
            </span>

            {/* Contenido */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">
                    #{d.numero_orden}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {d.fecha_remision
                    ? new Date(d.fecha_remision + 'T00:00:00').toLocaleDateString(
                        'es-BO'
                      )
                    : 'Sin fecha'}
                  {d.hora && ` • ${d.hora.substring(0, 5)}`}
                </span>
              </div>

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-800">
                  {d.destinatario_nombre}
                </p>
                {d.destinatario_cargo && (
                  <p className="text-xs text-gray-500">{d.destinatario_cargo}</p>
                )}
              </div>

              {d.cite && (
                <p className="text-xs text-gray-600 mb-1">
                  <strong>CITE:</strong> {d.cite}
                </p>
              )}

              {d.instrucciones && (
                <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Instrucciones:
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {d.instrucciones}
                  </p>
                </div>
              )}

              {d.respondiendo_con && (
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Respuesta:</strong> {d.respondiendo_con}
                </p>
              )}

              {d.fecha_respuesta && (
                <p className="text-xs text-gray-400 mt-1">
                  Respondido el{' '}
                  {new Date(d.fecha_respuesta + 'T00:00:00').toLocaleDateString(
                    'es-BO'
                  )}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}