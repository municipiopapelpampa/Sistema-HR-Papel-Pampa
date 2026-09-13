import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { Eye } from 'lucide-react'
import ModalBase from './ModalBase'
import { useObservarHR } from '../../hooks/useDerivaciones'

interface Props {
  derivacionId: string
  hrId: string
  hrNumero: string
  usuarioId: string
  onClose: () => void
}

export default function ModalObservar({
  derivacionId,
  hrId,
  hrNumero,
  usuarioId,
  onClose
}: Props) {
  const [observaciones, setObservaciones] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mutation = useObservarHR()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (observaciones.trim().length < 5) {
      toast.error('La observación debe tener al menos 5 caracteres')
      return
    }
    setEnviando(true)
    try {
      await mutation.mutateAsync({ derivacionId, hrId, usuarioId, observaciones })
      toast.success('Observación registrada')
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo="Observar Hoja de Ruta"
      subtitulo={hrNumero}
      onClose={onClose}
      ancho="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <Eye className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-700">
            Registra una observación.
          </p>
        </div>

        <div>
          <label className="label-field">Observaciones *</label>
          <textarea
            rows={5}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Describe tus observaciones..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-primary">
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              'Registrar observación'
            )}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}