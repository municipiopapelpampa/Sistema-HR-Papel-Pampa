import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, FileText, CheckCircle2, ArrowRight, Check } from 'lucide-react'
import {
  useNotificacionesModal,
  useMarcarModalVisto,
  useMarcarComoLeida
} from '../../hooks/useNotificaciones'
import { useAuth } from '../../hooks/useAuth'
import type { NotificacionConHR } from '../../services/notificaciones'

export default function ModalNotificaciones() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: pendientes = [], isLoading } = useNotificacionesModal(user?.id)
  const marcarModalMutation = useMarcarModalVisto()
  const marcarLeidaMutation = useMarcarComoLeida()
  const [indiceActual, setIndiceActual] = useState(0)

  if (!user || isLoading || pendientes.length === 0) return null

  const notifActual: NotificacionConHR = pendientes[indiceActual]
  if (!notifActual) return null

  const esUltima = indiceActual === pendientes.length - 1
  const hayVarias = pendientes.length > 1

  const handleIrALaHR = async () => {
    await marcarModalMutation.mutateAsync(notifActual.id)
    await marcarLeidaMutation.mutateAsync(notifActual.id)

    if (esUltima) {
      setIndiceActual(0)
    } else {
      setIndiceActual((i) => i + 1)
    }

    if (notifActual.hoja_ruta?.id) {
      navigate(`/hojas-ruta/${notifActual.hoja_ruta.id}`)
    }
  }

  const handleCerrar = async () => {
    // Marcar la actual como modal visto (pero no como leída)
    await marcarModalMutation.mutateAsync(notifActual.id)

    if (!esUltima) {
      setIndiceActual((i) => i + 1)
    }
  }

  const handleCerrarTodas = async () => {
    // Marcar todas como modal visto
    for (const n of pendientes) {
      await marcarModalMutation.mutateAsync(n.id)
    }
    setIndiceActual(0)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-5 relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {hayVarias
                  ? `Tienes ${pendientes.length} notificaciones`
                  : 'Nueva notificación'}
              </h3>
              <p className="text-sm text-white/80">
                {hayVarias
                  ? `${indiceActual + 1} de ${pendientes.length}`
                  : 'Revisa los detalles a continuación'}
              </p>
            </div>
            <button
              onClick={handleCerrarTodas}
              className="p-1 hover:bg-white/10 rounded"
              title="Cerrar todas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso si hay varias */}
          {hayVarias && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width: `${((indiceActual + 1) / pendientes.length) * 100}%`
                }}
              />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              {notifActual.hoja_ruta && (
                <p className="font-mono text-sm font-bold text-primary mb-1">
                  {notifActual.hoja_ruta.numero_unico}
                </p>
              )}
              <p className="text-sm text-gray-700">{notifActual.mensaje}</p>
            </div>
          </div>

          {notifActual.hoja_ruta?.descripcion_contenido && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Asunto</p>
              <p className="text-sm text-gray-800 line-clamp-3">
                {notifActual.hoja_ruta.descripcion_contenido}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleCerrar}
              className="flex-1 btn-outline"
            >
              {esUltima ? 'Cerrar' : 'Siguiente'}
            </button>
            <button
              onClick={handleIrALaHR}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              Ver Hoja de Ruta
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indicador de "marcar todas" si hay varias */}
          {hayVarias && !esUltima && (
            <button
              onClick={handleCerrarTodas}
              className="w-full text-xs text-gray-500 hover:text-gray-700 mt-3 flex items-center justify-center gap-1"
            >
              <Check className="w-3 h-3" />
              Marcar todas como vistas
            </button>
          )}
        </div>
      </div>
    </div>
  )
}