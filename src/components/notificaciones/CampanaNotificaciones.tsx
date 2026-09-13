import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import {
  useNotificaciones,
  useContadorNoLeidas,
  useMarcarTodasComoLeidas
} from '../../hooks/useNotificaciones'
import { useAuth } from '../../hooks/useAuth'
import ItemNotificacion from './ItemNotificacion'

export default function CampanaNotificaciones() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notificaciones = [] } = useNotificaciones(user?.id)
  const { data: noLeidas = 0 } = useContadorNoLeidas(user?.id)
  const marcarTodasMutation = useMarcarTodasComoLeidas()

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!abierto) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [abierto])

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [abierto])

  if (!user) return null

  const handleMarcarTodas = async () => {
    await marcarTodasMutation.mutateAsync(user.id)
  }

  const handleVerTodas = () => {
    setAbierto(false)
    navigate('/notificaciones')
  }

  const ultimas = notificaciones.slice(0, 8)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón campana */}
      <button
        onClick={() => setAbierto(!abierto)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          abierto
            ? 'bg-primary-50 text-primary-700'
            : 'hover:bg-neutral-100 text-neutral-700'
        }`}
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 text-gray-900">
          {/* Header del dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="font-semibold text-sm">Notificaciones</h3>
              {noLeidas > 0 && (
                <p className="text-xs text-gray-500">
                  {noLeidas} sin leer
                </p>
              )}
            </div>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {ultimas.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No tienes notificaciones</p>
              </div>
            ) : (
              ultimas.map((n) => (
                <ItemNotificacion
                  key={n.id}
                  notificacion={n}
                  onCerrarDropdown={() => setAbierto(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleVerTodas}
                className="w-full text-center py-2.5 text-sm text-primary hover:bg-primary/5 font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}