import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { Lock, AlertCircle, Loader2, Clock, CheckCircle2 } from 'lucide-react'
import { useCerrarGestion, useContarHRGestion } from '../../hooks/useGestiones'
import type { Gestion } from '../../types'

interface Props {
  gestion: Gestion
  onClose: () => void
}

export default function ModalCerrarGestion({ gestion, onClose }: Props) {
  const [enviando, setEnviando] = useState(false)
  const [confirmado, setConfirmado] = useState(false)
  const mutation = useCerrarGestion()
  const { data: stats, isLoading: loadingStats } = useContarHRGestion(gestion.id)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!confirmado) {
      toast.error('Debes confirmar el cierre de la gestión')
      return
    }

    setEnviando(true)
    try {
      await mutation.mutateAsync(gestion.id)
      toast.success(`Gestión ${gestion.anio} cerrada correctamente`)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const tienePendientes = stats && stats.pendientes > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">
                Cerrar gestión {gestion.anio}
              </h2>
              <p className="text-sm text-white/80">
                Esta acción es reversible pero importante
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Stats */}
          {!loadingStats && stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Total HR</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">
                  {stats.concluidas}
                </p>
                <p className="text-xs text-green-700 mt-0.5">Concluidas</p>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${
                  tienePendientes ? 'bg-amber-50' : 'bg-gray-50'
                }`}
              >
                <p
                  className={`text-2xl font-bold ${
                    tienePendientes ? 'text-amber-700' : 'text-gray-800'
                  }`}
                >
                  {stats.pendientes}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    tienePendientes ? 'text-amber-700' : 'text-gray-500'
                  }`}
                >
                  Pendientes
                </p>
              </div>
            </div>
          )}

          {/* Advertencia si hay pendientes */}
          {tienePendientes && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">
                  Hay {stats!.pendientes} hoja(s) de ruta sin concluir
                </p>
                <p className="text-xs mt-0.5">
                  Quedarán en modo solo lectura. No podrás derivarlas ni
                  concluirlas después.
                </p>
              </div>
            </div>
          )}

          {!tienePendientes && stats && stats.total > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                Todas las hojas de ruta están concluidas. Excelente trabajo.
              </p>
            </div>
          )}

          {/* Qué sucede */}
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1">
              ¿Qué sucede al cerrar?
            </p>
            <ul className="space-y-0.5 list-disc pl-4">
              <li>
                Las HR de la gestión {gestion.anio} quedan en{' '}
                <strong>modo solo lectura</strong>
              </li>
              <li>No se podrán derivar ni modificar</li>
              <li>Sí se podrán consultar y descargar</li>
              <li>Se puede reabrir si es necesario</li>
            </ul>
          </div>

          {/* Confirmación */}
          <label className="flex items-start gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(e) => setConfirmado(e.target.checked)}
              className="w-4 h-4 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Confirmo que deseo cerrar la gestión <strong>{gestion.anio}</strong>
              {tienePendientes && ' aunque haya hojas de ruta pendientes'}
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !confirmado}
              className="btn-danger flex items-center gap-2 disabled:opacity-50"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Cerrar gestión
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}