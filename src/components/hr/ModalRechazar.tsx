import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import ModalBase from './ModalBase'
import { useRechazarHR } from '../../hooks/useDerivaciones'

interface Props {
  derivacionId: string
  hrId: string
  hrNumero: string
  usuarioId: string
  onClose: () => void
}

export default function ModalRechazar({
  derivacionId,
  hrId,
  hrNumero,
  usuarioId,
  onClose
}: Props) {
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mutation = useRechazarHR()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (motivo.trim().length < 5) {
      toast.error('El motivo debe tener al menos 5 caracteres')
      return
    }
    setEnviando(true)
    try {
      await mutation.mutateAsync({ derivacionId, hrId, usuarioId, motivo })
      toast.success('Hoja de ruta devuelta al remitente anterior')
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo="Rechazar / Devolver"
      subtitulo={hrNumero}
      onClose={onClose}
      ancho="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-accent-50 rounded-lg border border-accent-200">
          <AlertTriangle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-700">
            La hoja de ruta <strong>volverá al remitente anterior</strong>. El
            remitente podrá corregirla y reenviarla.
          </p>
        </div>

        <div>
          <label className="label-field">Motivo del rechazo *</label>
          <textarea
            rows={5}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Explica por qué devuelves esta hoja de ruta..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-danger">
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Devolviendo...
              </>
            ) : (
              'Rechazar y devolver'
            )}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}