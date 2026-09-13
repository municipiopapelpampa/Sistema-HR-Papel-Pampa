import {
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Send,
  FilePlus,
  Building2,
  AlertTriangle,
  ArrowRight,
  MapPin
} from 'lucide-react'
import type { Derivacion, EstadoDerivacion, Usuario } from '../../types'

interface Props {
  derivaciones: Derivacion[]
  // Datos de la creación (opcionales pero recomendados)
  hrCreada?: {
    numero_unico: string
    fecha_recepcion: string
    hora_recepcion: string
    remitente_nombre: string
    remitente_cargo?: string | null
    creadaPor?: Pick<Usuario, 'nombre_completo' | 'cargo'> | null
  }
  // ID de la dirección donde está actualmente
  direccionActualId?: string | null
  // Estado de la HR actual
  estadoActual?: string
}

// ============================================
// CONFIGURACIÓN VISUAL POR ESTADO
// ============================================
const estadoConfig: Record<
  EstadoDerivacion,
  {
    label: string
    icono: any
    color: string
    border: string
    bg: string
    bgLight: string
  }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    icono: Clock,
    color: 'text-amber-600',
    border: 'border-amber-400',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50'
  },
  CONFIRMADA: {
    label: 'Confirmada',
    icono: CheckCircle2,
    color: 'text-primary-700',
    border: 'border-primary-500',
    bg: 'bg-primary-600',
    bgLight: 'bg-primary-50'
  },
  OBSERVADA: {
    label: 'Observada',
    icono: Eye,
    color: 'text-yellow-600',
    border: 'border-yellow-400',
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-50'
  },
  RECHAZADA: {
    label: 'Rechazada',
    icono: XCircle,
    color: 'text-accent-600',
    border: 'border-accent-500',
    bg: 'bg-accent-600',
    bgLight: 'bg-accent-50'
  }
}

// ============================================
// UTILIDADES
// ============================================
function diasDesde(fecha: string): number {
  const hoy = new Date()
  const f = new Date(fecha + 'T00:00:00')
  return Math.floor((hoy.getTime() - f.getTime()) / 86400000)
}

function tiempoRelativo(fecha: string, hora?: string | null): string {
  const dias = diasDesde(fecha)
  if (dias === 0) return hora ? `Hoy a las ${hora.substring(0, 5)}` : 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} sem.`
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatearFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function ChipDireccion({ codigo }: { codigo: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded uppercase tracking-wide">
      <Building2 className="w-3 h-3" />
      {codigo}
    </span>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function TimelineDerivaciones({
  derivaciones,
  hrCreada,
  direccionActualId,
  estadoActual
}: Props) {
  const ultimaDerivacion = derivaciones[derivaciones.length - 1]
  const esUltima = (d: Derivacion) => d.id === ultimaDerivacion?.id

  if (derivaciones.length === 0 && !hrCreada) {
    return (
      <p className="text-sm text-neutral-500 text-center py-4">
        Sin derivaciones registradas
      </p>
    )
  }

  return (
    <ol className="relative">
      {/* ============================================
          BLOQUE 1: CREACIÓN DE LA HOJA DE RUTA
          ============================================ */}
      {hrCreada && (
        <li className="relative pl-12 pb-6">
          {/* Línea vertical */}
          <span className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 to-neutral-200" />

          {/* Ícono creación */}
          <span className="absolute left-0 top-1 w-10 h-10 rounded-full border-2 border-primary-500 bg-white flex items-center justify-center shadow-sm">
            <FilePlus className="w-5 h-5 text-primary-700" />
          </span>

          {/* Contenido */}
          <div className="bg-gradient-to-r from-primary-50 to-white rounded-xl p-4 border border-primary-200">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wide">
                  Creación
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full font-semibold">
                  Paso inicial
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {tiempoRelativo(
                  hrCreada.fecha_recepcion,
                  hrCreada.hora_recepcion
                )}
              </span>
            </div>

            <p className="text-sm text-neutral-800 mb-3">
              <strong>{hrCreada.remitente_nombre}</strong>
              {hrCreada.remitente_cargo && (
                <span className="text-neutral-500"> — {hrCreada.remitente_cargo}</span>
              )}
            </p>

            <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
              <span className="font-mono font-bold text-primary-700">
                {hrCreada.numero_unico}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatearFecha(hrCreada.fecha_recepcion)} a las{' '}
                {hrCreada.hora_recepcion.substring(0, 5)}
              </span>
            </div>
          </div>
        </li>
      )}

      {/* ============================================
          BLOQUES DE DERIVACIONES
          ============================================ */}
      {derivaciones.map((d, index) => {
        const config = estadoConfig[d.estado]
        const Icono = config.icono
        const esElActual = esUltima(d) && estadoActual !== 'CONCLUIDA'
        const diasPendiente = diasDesde(d.fecha_remision || '')

        return (
          <li key={d.id} className="relative pl-12 pb-6">
            {/* Línea vertical */}
            {index < derivaciones.length - 1 && (
              <span className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-neutral-200" />
            )}

            {/* Ícono del paso */}
            <span
              className={`absolute left-0 top-1 w-10 h-10 rounded-full border-2 ${config.border} bg-white flex items-center justify-center shadow-sm ${
                esElActual ? 'ring-4 ring-primary-100 animate-pulse' : ''
              }`}
            >
              <Icono className={`w-5 h-5 ${config.color}`} />
            </span>

            {/* Contenido */}
            <div
              className={`rounded-xl p-4 border ${
                esElActual
                  ? 'bg-gradient-to-r from-primary-50 to-white border-primary-300 shadow-sm'
                  : 'bg-white border-neutral-200'
              }`}
            >
              {/* Header del paso */}
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                    Paso {d.numero_orden}
                  </span>

                  {/* Badge de estado */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${config.bgLight} ${config.color} border ${config.border}`}
                  >
                    <Icono className="w-3 h-3" />
                    {config.label}
                  </span>

                  {/* Badge "Ubicación actual" */}
                  {esElActual && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary-700 text-white">
                      <MapPin className="w-3 h-3" />
                      Ubicación actual
                    </span>
                  )}
                </div>

                <span className="text-xs text-neutral-500">
                  {tiempoRelativo(d.fecha_remision || '', d.hora)}
                </span>
              </div>

              {/* Dirección origen → destino */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {index === 0 && hrCreada && (
                  <>
                    <ChipDireccion codigo="ORIGEN" />
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </>
                )}
                <ChipDireccion
                  codigo={d.destinatario_direccion_id ? 'DESTINO' : 'DIRECTO'}
                />
                <span className="text-xs text-neutral-600 font-medium">
                  {d.destinatario_nombre}
                </span>
              </div>

              {/* Instrucciones */}
              {d.instrucciones && (
                <div className="bg-neutral-50 rounded-lg p-2.5 mb-3 border-l-2 border-primary-300">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    Instrucciones
                  </p>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {d.instrucciones}
                  </p>
                </div>
              )}

              {/* CITE + Respondiendo con */}
              {(d.cite || d.respondiendo_con) && (
                <div className="flex items-center gap-4 text-xs text-neutral-600 flex-wrap">
                  {d.cite && (
                    <span>
                      <strong>CITE:</strong>{' '}
                      <span className="font-mono">{d.cite}</span>
                    </span>
                  )}
                  {d.respondiendo_con && (
                    <span>
                      <strong>Respuesta:</strong> {d.respondiendo_con}
                    </span>
                  )}
                </div>
              )}

              {/* Alerta si lleva mucho tiempo pendiente */}
              {d.estado === 'PENDIENTE' && diasPendiente >= 5 && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    Pendiente hace <strong>{diasPendiente} días</strong>. Considera
                    hacer seguimiento.
                  </p>
                </div>
              )}
            </div>
          </li>
        )
      })}

      {/* ============================================
          BLOQUE FINAL: CONCLUSIÓN (si aplica)
          ============================================ */}
      {estadoActual === 'CONCLUIDA' && (
        <li className="relative pl-12">
          <span className="absolute left-0 top-1 w-10 h-10 rounded-full border-2 border-green-500 bg-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </span>

          <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-4 border border-green-300">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                Conclusión
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold">
                Trámite finalizado
              </span>
            </div>
            <p className="text-sm text-neutral-700">
              La hoja de ruta fue concluida. Ya no puede derivarse.
            </p>
          </div>
        </li>
      )}
    </ol>
  )
}