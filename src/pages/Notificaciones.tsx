import { Bell, CheckCheck, Inbox } from 'lucide-react'
import Layout from '../components/layout/Layout'
import ItemNotificacion from '../components/notificaciones/ItemNotificacion'
import {
  useNotificaciones,
  useContadorNoLeidas,
  useMarcarTodasComoLeidas
} from '../hooks/useNotificaciones'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

export default function Notificaciones() {
  const { user } = useAuth()
  const { data: notificaciones = [], isLoading } = useNotificaciones(user?.id)
  const { data: noLeidas = 0 } = useContadorNoLeidas(user?.id)
  const marcarTodasMutation = useMarcarTodasComoLeidas()

  if (!user) return null

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasMutation.mutateAsync(user.id)
      toast.success('Todas las notificaciones marcadas como leídas')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const noLeidasList = notificaciones.filter((n) => !n.leida)
  const leidasList = notificaciones.filter((n) => n.leida)

  return (
    <Layout titulo="Notificaciones">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-700" />
              Notificaciones
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {notificaciones.length} en total
              {noLeidas > 0 && (
                <span className="text-accent-600 font-medium">
                  {' '}
                  • {noLeidas} sin leer
                </span>
              )}
            </p>
          </div>
          {noLeidas > 0 && (
            <button
              onClick={handleMarcarTodas}
              className="btn-outline flex items-center gap-2 w-fit"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como leídas
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-700 mx-auto" />
            <p className="mt-4 text-neutral-500">Cargando notificaciones...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="card text-center py-12">
            <Inbox className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-700 mb-2">
              No tienes notificaciones
            </h3>
            <p className="text-sm text-neutral-500">
              Cuando recibas una hoja de ruta o alguien actúe sobre las tuyas,
              aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* No leídas */}
            {noLeidasList.length > 0 && (
              <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-primary-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    Sin leer ({noLeidasList.length})
                  </h2>
                </div>
                <div className="divide-y divide-neutral-100">
                  {noLeidasList.map((n) => (
                    <ItemNotificacion key={n.id} notificacion={n} />
                  ))}
                </div>
              </div>
            )}

            {/* Leídas */}
            {leidasList.length > 0 && (
              <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                  <h2 className="font-semibold text-sm text-neutral-600">
                    Anteriores ({leidasList.length})
                  </h2>
                </div>
                <div className="divide-y divide-neutral-100">
                  {leidasList.map((n) => (
                    <ItemNotificacion key={n.id} notificacion={n} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}