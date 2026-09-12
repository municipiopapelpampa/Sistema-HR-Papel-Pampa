import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { Calendar, AlertCircle, Loader2 } from 'lucide-react'
import { useCrearGestion } from '../../hooks/useGestiones'

interface Props {
  anioSugerido: number
  onClose: () => void
}

export default function ModalNuevaGestion({ anioSugerido, onClose }: Props) {
  const [anio, setAnio] = useState(anioSugerido)
  const [enviando, setEnviando] = useState(false)
  const mutation = useCrearGestion()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (anio < 2020 || anio > 2100) {
      toast.error('El año debe estar entre 2020 y 2100')
      return
    }

    setEnviando(true)
    try {
      await mutation.mutateAsync(anio)
      toast.success(`Gestión ${anio} creada y activada`)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Nueva gestión</h2>
              <p className="text-sm text-white/80">
                Crear y activar una nueva gestión fiscal
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Asegúrate de que <strong>no haya otra gestión activa</strong>. Si
              la hay, ciérrala primero.
            </p>
          </div>

          <div>
            <label className="label-field">Año de la gestión *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={2020}
                max={2100}
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value) || anioSugerido)}
                className="input-field pl-10 text-lg font-bold"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Se sugiere el año {anioSugerido} (el siguiente al último)
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1">¿Qué sucede al crear?</p>
            <ul className="space-y-0.5 list-disc pl-4">
              <li>Se activa automáticamente</li>
              <li>
                Todas las <strong>nuevas HR</strong> se crearán con el año{' '}
                {anio}
              </li>
              <li>Los correlativos se reinician (HR-{anio}-0001)</li>
            </ul>
          </div>

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
              disabled={enviando}
              className="btn-primary flex items-center gap-2"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Crear gestión {anio}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}