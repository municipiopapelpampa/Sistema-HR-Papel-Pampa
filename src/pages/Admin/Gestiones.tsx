import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Header from '../../components/layout/Header'
import ModalNuevaGestion from '../../components/admin/ModalNuevaGestion'
import ModalCerrarGestion from '../../components/admin/ModalCerrarGestion'
import {
  useGestiones,
  useGestionActivaQuery,
  useReabrirGestion,
  useContarHRGestion
} from '../../hooks/useGestiones'
import { toast } from 'sonner'
import {
  Calendar,
  Plus,
  Lock,
  Unlock,
  Shield,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react'
import type { Gestion } from '../../types'

export default function Gestiones() {
  const { user } = useAuth()
  const { data: gestiones = [], isLoading } = useGestiones()
  const { data: activa } = useGestionActivaQuery()
  const reabrirMutation = useReabrirGestion()

  const [modalNueva, setModalNueva] = useState(false)
  const [cerrarGestion, setCerrarGestion] = useState<Gestion | null>(null)

  if (!user?.rol?.puede_admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Sin permisos</p>
            <p className="text-sm text-gray-500 mt-1">
              Solo el Alcalde y la Secretaria pueden gestionar las gestiones
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleReabrir = async (g: Gestion) => {
    try {
      await reabrirMutation.mutateAsync(g.id)
      toast.success(`Gestión ${g.anio} reabierta`)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const sugerirAnio = () => {
    if (gestiones.length === 0) return new Date().getFullYear()
    const maxAnio = Math.max(...gestiones.map((g) => g.anio))
    return maxAnio + 1
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Gestión de Años Fiscales
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra las gestiones del sistema
            </p>
          </div>
          <button
            onClick={() => setModalNueva(true)}
            disabled={!!activa}
            className="btn-primary flex items-center gap-2 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              activa
                ? 'Debes cerrar la gestión activa primero'
                : 'Crear nueva gestión'
            }
          >
            <Plus className="w-4 h-4" />
            Nueva gestión
          </button>
        </div>

        {/* Gestión activa */}
        {activa && (
          <div className="card border-l-4 border-l-green-500 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Gestión {activa.anio}
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                      ACTIVA
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Iniciada el{' '}
                    {new Date(activa.fecha_inicio + 'T00:00:00').toLocaleDateString(
                      'es-BO'
                    )}
                  </p>
                  <ContadorHR gestionId={activa.id} />
                </div>
              </div>
              <button
                onClick={() => setCerrarGestion(activa)}
                className="btn-danger flex items-center gap-2 whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                Cerrar gestión
              </button>
            </div>
          </div>
        )}

        {!activa && (
          <div className="card bg-amber-50 border-l-4 border-l-amber-500 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  No hay gestión activa
                </p>
                <p className="text-sm text-amber-800">
                  Debes crear una nueva gestión para que el sistema pueda seguir
                  operando.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Historial */}
        <h3 className="font-semibold text-gray-700 mb-3">
          Historial de gestiones
        </h3>

        {isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-500">Cargando gestiones...</p>
          </div>
        ) : gestiones.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay gestiones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gestiones.map((g) => (
              <div
                key={g.id}
                className={`card flex items-center justify-between gap-4 ${
                  g.estado === 'ACTIVA' ? 'border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      g.estado === 'ACTIVA'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {g.estado === 'ACTIVA' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg text-gray-800">
                        {g.anio}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          g.estado === 'ACTIVA'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {g.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span>
                        <strong>Inicio:</strong>{' '}
                        {new Date(g.fecha_inicio + 'T00:00:00').toLocaleDateString(
                          'es-BO'
                        )}
                      </span>
                      {g.fecha_cierre && (
                        <span>
                          <strong>Cierre:</strong>{' '}
                          {new Date(
                            g.fecha_cierre + 'T00:00:00'
                          ).toLocaleDateString('es-BO')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {g.estado === 'CERRADA' && (
                  <button
                    onClick={() => handleReabrir(g)}
                    className="btn-outline flex items-center gap-2 text-sm whitespace-nowrap"
                    title="Reabrir gestión"
                  >
                    <Unlock className="w-4 h-4" />
                    Reabrir
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Nota informativa */}
        <div className="card mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm mb-1">
                ¿Cómo funciona el cierre de gestión?
              </p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
                <li>
                  Al cerrar una gestión, sus hojas de ruta quedan en{' '}
                  <strong>modo solo lectura</strong>.
                </li>
                <li>No se pueden derivar, modificar ni concluir.</li>
                <li>Sí se pueden consultar y descargar sus PDFs.</li>
                <li>
                  Las nuevas hojas de ruta se crean automáticamente en la
                  gestión activa.
                </li>
                <li>Se puede reabrir una gestión cerrada si es necesario.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modales */}
      {modalNueva && (
        <ModalNuevaGestion
          anioSugerido={sugerirAnio()}
          onClose={() => setModalNueva(false)}
        />
      )}

      {cerrarGestion && (
        <ModalCerrarGestion
          gestion={cerrarGestion}
          onClose={() => setCerrarGestion(null)}
        />
      )}
    </div>
  )
}

// ============================================
// SUBCOMPONENTE: CONTADOR DE HR
// ============================================
function ContadorHR({ gestionId }: { gestionId: string }) {
  const { data, isLoading } = useContarHRGestion(gestionId)

  if (isLoading || !data) {
    return (
      <div className="flex gap-4 text-xs text-gray-500">
        <span>Cargando estadísticas...</span>
      </div>
    )
  }

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-sm">
          <strong>{data.total}</strong>{' '}
          <span className="text-gray-500">HR totales</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        <span className="text-sm">
          <strong>{data.concluidas}</strong>{' '}
          <span className="text-gray-500">concluidas</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-sm">
          <strong>{data.pendientes}</strong>{' '}
          <span className="text-gray-500">pendientes</span>
        </span>
      </div>
    </div>
  )
}