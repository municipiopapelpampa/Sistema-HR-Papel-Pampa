import { toast } from 'sonner'
import {
  Trash2,
  AlertTriangle,
  Loader2,
  PowerOff,
  FileText,
  Send,
  Paperclip,
  History,
  Info
} from 'lucide-react'
import { useActividadUsuario } from '../../hooks/useUsuarios'

interface Props {
  usuarioId: string
  usuarioNombre: string
  onClose: () => void
  onEliminar: () => void
}

export default function ModalConfirmarEliminarUsuario({
  usuarioId,
  usuarioNombre,
  onClose,
  onEliminar
}: Props) {
  const { data: actividad, isLoading } = useActividadUsuario(usuarioId)

  // Mientras carga
  if (isLoading || !actividad) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <Loader2 className="w-8 h-8 text-primary-700 animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-600">
            Verificando actividad del usuario...
          </p>
        </div>
      </div>
    )
  }

  // Sin actividad → se puede eliminar
  if (actividad.puedeEliminar) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900">
                ¿Eliminar a {usuarioNombre}?
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Este usuario <strong>no tiene actividad registrada</strong> en
                el sistema. Se puede eliminar de forma segura.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button onClick={onEliminar} className="btn-danger">
              <Trash2 className="w-4 h-4" />
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Con actividad → NO se puede eliminar
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-700 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">No se puede eliminar</h2>
              <p className="text-sm text-white/90">
                {usuarioNombre} tiene actividad en el sistema
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Para mantener la <strong>integridad del historial</strong>, los
              usuarios con actividad no se pueden eliminar. En su lugar, se
              pueden <strong>desactivar</strong> para que no puedan iniciar
              sesión.
            </p>
          </div>

          {/* Detalle de actividad */}
          <div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Actividad registrada:
            </p>
            <ul className="space-y-2">
              {actividad.creoHR > 0 && (
                <li className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg text-sm">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <FileText className="w-4 h-4 text-primary-700" />
                    Hojas de ruta creadas
                  </span>
                  <span className="font-bold text-neutral-900">
                    {actividad.creoHR}
                  </span>
                </li>
              )}
              {actividad.confirmoDerivaciones > 0 && (
                <li className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg text-sm">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <Send className="w-4 h-4 text-secondary-700" />
                    Derivaciones firmadas
                  </span>
                  <span className="font-bold text-neutral-900">
                    {actividad.confirmoDerivaciones}
                  </span>
                </li>
              )}
              {actividad.fueDestinoHR > 0 && (
                <li className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg text-sm">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <FileText className="w-4 h-4 text-green-600" />
                    HR asignadas actualmente
                  </span>
                  <span className="font-bold text-neutral-900">
                    {actividad.fueDestinoHR}
                  </span>
                </li>
              )}
              {actividad.subioDocumentos > 0 && (
                <li className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg text-sm">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <Paperclip className="w-4 h-4 text-accent-600" />
                    Documentos subidos
                  </span>
                  <span className="font-bold text-neutral-900">
                    {actividad.subioDocumentos}
                  </span>
                </li>
              )}
              {actividad.registrosHistorial > 0 && (
                <li className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg text-sm">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <History className="w-4 h-4 text-neutral-500" />
                    Registros de historial
                  </span>
                  <span className="font-bold text-neutral-900">
                    {actividad.registrosHistorial}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="pt-2 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 mb-3">
              💡 <strong>Recomendación</strong>: desactiva al usuario. Seguirá
              apareciendo en el historial pero no podrá iniciar sesión.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="btn-outline">
                Entendido
              </button>
              <button
                onClick={() => {
                  onClose()
                  toast.info(
                    'Usa el botón "Desactivar" para inhabilitar al usuario'
                  )
                }}
                className="btn-danger"
              >
                <PowerOff className="w-4 h-4" />
                Desactivar en su lugar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}