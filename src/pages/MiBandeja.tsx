import { Link } from 'react-router-dom'
import {
  Inbox,
  AlertCircle,
  Clock,
  FileText,
  ArrowRight,
  CheckCircle2,
  Send,
  Eye,
  RefreshCw
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useBandeja, type HrBandeja } from '../hooks/useBandeja'
import { useAuth } from '../hooks/useAuth'

const estadoConfig: Record<string, { label: string; color: string }> = {
  PENDIENTE_CONFIRMACION: {
    label: 'Pendiente de confirmar',
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  CONFIRMADA: {
    label: 'Confirmada - Esperando derivar',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  OBSERVADA: {
    label: 'Observada - Esperando acción',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
}

const accionConfig: Record<
  HrBandeja['accion_pendiente'],
  { label: string; color: string; icono: any }
> = {
  CONFIRMAR: {
    label: 'Confirmar recepción',
    color: 'bg-primary-700 hover:bg-primary-800',
    icono: CheckCircle2
  },
  DERIVAR: {
    label: 'Derivar',
    color: 'bg-secondary-700 hover:bg-secondary-800',
    icono: Send
  },
  OBSERVAR: {
    label: 'Observar',
    color: 'bg-yellow-600 hover:bg-yellow-700',
    icono: Eye
  },
  CONCLUIR: {
    label: 'Concluir',
    color: 'bg-green-600 hover:bg-green-700',
    icono: CheckCircle2
  }
}

export default function MiBandeja() {
  const { user } = useAuth()
  const { data: hrBandeja = [], isLoading, refetch, isFetching } = useBandeja(user)

  if (!user) return null

  const formatFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const urgentes = hrBandeja.filter((hr) => hr.tipo_urgente).length
  const miDireccion = user.direccion_principal?.codigo || 'MAE'

  return (
    <Layout titulo="Mi Bandeja">
      <div className="max-w-5xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Inbox className="w-6 h-6 text-primary-700" />
              Mi Bandeja
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {isLoading ? (
                'Cargando...'
              ) : hrBandeja.length === 0 ? (
                'No tienes hojas de ruta pendientes de atender'
              ) : (
                <>
                  Tienes{' '}
                  <strong className="text-primary-700">
                    {hrBandeja.length}
                  </strong>{' '}
                  hoja{hrBandeja.length > 1 ? 's' : ''} de ruta esperando tu
                  acción
                  {urgentes > 0 && (
                    <span className="ml-2 text-accent-600 font-semibold">
                      ({urgentes} urgente{urgentes > 1 ? 's' : ''})
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-outline flex items-center gap-2 w-fit"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Actualizar
          </button>
        </div>

        {/* Info */}
        <div className="card p-4 mb-6 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Inbox className="w-4 h-4 text-primary-700" />
            </div>
            <div className="text-sm text-primary-800">
              <p className="font-semibold">
                Aquí aparecen las HR que esperan tu acción
              </p>
              <p className="text-xs mt-0.5">
                Se muestran las HR dirigidas a <strong>{miDireccion}</strong>{' '}
                o asignadas directamente a ti que aún no has atendido.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-700 mx-auto" />
            <p className="mt-4 text-neutral-500">Cargando tu bandeja...</p>
          </div>
        ) : hrBandeja.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-neutral-800 mb-2">
              ¡Todo al día! 🎉
            </h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
              No tienes hojas de ruta pendientes de atender. Cuando alguien te
              envíe una o derive una a tu dirección, aparecerá aquí.
            </p>
            <Link
              to="/hojas-ruta"
              className="btn-outline inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver todas las hojas de ruta
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {hrBandeja.map((hr) => {
              const estado = estadoConfig[hr.estado] || estadoConfig.PENDIENTE_CONFIRMACION
              const accion = accionConfig[hr.accion_pendiente]
              const IconoAccion = accion.icono
              const esUrgente = hr.tipo_urgente
              const diasAlerta = hr.dias_esperando >= 5

              return (
                <div
                  key={hr.id}
                  className={`card overflow-hidden border-l-4 ${
                    esUrgente
                      ? 'border-l-accent-500'
                      : diasAlerta
                      ? 'border-l-amber-500'
                      : 'border-l-primary-600'
                  }`}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-primary-700 text-lg">
                          {hr.numero_unico}
                        </span>
                        <span
                          className={`badge border ${estado.color}`}
                        >
                          {estado.label}
                        </span>
                        {esUrgente && (
                          <span className="badge bg-accent-100 text-accent-800">
                            <AlertCircle className="w-3 h-3" /> URGENTE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {hr.dias_esperando === 0
                          ? 'Hoy'
                          : hr.dias_esperando === 1
                          ? 'Ayer'
                          : `Hace ${hr.dias_esperando} días`}
                      </span>
                    </div>

                    {/* Asunto */}
                    <h3 className="font-semibold text-neutral-800 mb-2">
                      {hr.descripcion_contenido.substring(0, 120)}
                      {hr.descripcion_contenido.length > 120 ? '...' : ''}
                    </h3>

                    {/* Info */}
                    <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4 flex-wrap">
                      <span>
                        <strong>De:</strong> {hr.remitente_nombre}
                      </span>
                      {hr.destinatario_direccion && (
                        <span>
                          <strong>Para:</strong>{' '}
                          {hr.destinatario_direccion.codigo}
                        </span>
                      )}
                      <span>
                        <strong>Fecha:</strong>{' '}
                        {formatFecha(hr.fecha_recepcion)}
                      </span>
                    </div>

                    {/* Alerta si lleva mucho tiempo */}
                    {diasAlerta && (
                      <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-800">
                          Esta HR lleva{' '}
                          <strong>{hr.dias_esperando} días</strong> esperando tu
                          acción. Considera atenderla pronto.
                        </p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/hojas-ruta/${hr.id}`}
                        className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${accion.color}`}
                      >
                        <IconoAccion className="w-4 h-4" />
                        {accion.label}
                      </Link>
                      <Link
                        to={`/hojas-ruta/${hr.id}`}
                        className="btn-outline text-sm"
                      >
                        Ver detalle
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}