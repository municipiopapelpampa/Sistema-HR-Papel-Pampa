import { Bell, CheckCheck, Inbox } from 'lucide-react'
import Header from '../components/layout/Header'
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notificaciones
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {notificaciones.length} en total
              {noLeidas > 0 && ` • ${noLeidas} sin leer`}
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-500">Cargando notificaciones...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="card text-center py-12">
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">
              No tienes notificaciones
            </h3>
            <p className="text-sm text-gray-500">
              Cuando recibas una hoja de ruta o alguien actúe sobre las tuyas,
              aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* No leídas */}
            {noLeidasList.length > 0 && (
              <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                  <h2 className="font-semibold text-sm text-blue-800">
                    Sin leer ({noLeidasList.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {noLeidasList.map((n) => (
                    <ItemNotificacion key={n.id} notificacion={n} />
                  ))}
                </div>
              </div>
            )}

            {/* Leídas */}
            {leidasList.length > 0 && (
              <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h2 className="font-semibold text-sm text-gray-600">
                    Anteriores ({leidasList.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {leidasList.map((n) => (
                    <ItemNotificacion key={n.id} notificacion={n} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}