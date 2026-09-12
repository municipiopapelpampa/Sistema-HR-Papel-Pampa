import { useNavigate } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  AlertCircle,
  Bell
} from 'lucide-react'
import { useMarcarComoLeida } from '../../hooks/useNotificaciones'
import type { NotificacionConHR } from '../../services/notificaciones'

interface Props {
  notificacion: NotificacionConHR
  onCerrarDropdown?: () => void
}

const tipoConfig: Record<
  string,
  { icono: any; color: string; bg: string }
> = {
  NUEVA_HR: {
    icono: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  CONFIRMADA: {
    icono: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  OBSERVADA: {
    icono: Eye,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100'
  },
  RECHAZADA: {
    icono: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100'
  },
  DERIVADA: {
    icono: Send,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  CONCLUIDA: {
    icono: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-100'
  }
}

export default function ItemNotificacion({
  notificacion,
  onCerrarDropdown
}: Props) {
  const navigate = useNavigate()
  const marcarMutation = useMarcarComoLeida()

  const config = tipoConfig[notificacion.tipo] || {
    icono: Bell,
    color: 'text-gray-600',
    bg: 'bg-gray-100'
  }
  const Icono = config.icono

  const handleClick = async () => {
    // Marcar como leída
    if (!notificacion.leida) {
      await marcarMutation.mutateAsync(notificacion.id)
    }

    // Cerrar dropdown si aplica
    onCerrarDropdown?.()

    // Navegar al detalle de la HR
    if (notificacion.hoja_ruta?.id) {
      navigate(`/hojas-ruta/${notificacion.hoja_ruta.id}`)
    }
  }

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    const ahora = new Date()
    const diffMs = ahora.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHoras = Math.floor(diffMs / 3600000)
    const diffDias = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return 'Ahora'
    if (diffMin < 60) return `Hace ${diffMin} min`
    if (diffHoras < 24) return `Hace ${diffHoras} h`
    if (diffDias < 7) return `Hace ${diffDias} d`
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${
        !notificacion.leida ? 'bg-blue-50/50' : ''
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}
      >
        <Icono className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm line-clamp-2 ${
            !notificacion.leida ? 'font-medium text-gray-800' : 'text-gray-600'
          }`}
        >
          {notificacion.mensaje}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {notificacion.hoja_ruta && (
            <span className="text-xs text-primary font-mono">
              {notificacion.hoja_ruta.numero_unico}
            </span>
          )}
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">
            {formatFecha(notificacion.created_at)}
          </span>
        </div>
      </div>
      {!notificacion.leida && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </button>
  )
}