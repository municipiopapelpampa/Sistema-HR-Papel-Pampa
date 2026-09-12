import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import ModalBase from './ModalBase'
import { useConfirmarRecepcion } from '../../hooks/useDerivaciones'

interface Props {
  derivacionId: string
  hrId: string
  hrNumero: string
  usuarioId: string
  onClose: () => void
}

export default function ModalConfirmar({
  derivacionId,
  hrId,
  hrNumero,
  usuarioId,
  onClose
}: Props) {
  const [cite, setCite] = useState('')
  const [respondiendoCon, setRespondiendoCon] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mutation = useConfirmarRecepcion()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    try {
      await mutation.mutateAsync({
        derivacionId,
        hrId,
        usuarioId,
        datos: { cite, respondiendo_con: respondiendoCon }
      })
      toast.success(`Recepción confirmada: ${hrNumero}`)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo="Confirmar Recepción"
      subtitulo={hrNumero}
      onClose={onClose}
      ancho="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Confirmas la recepción de esta hoja de ruta. Quedará en tu poder.
          </p>
        </div>

        <div>
          <label className="label-field">CITE (opcional)</label>
          <input
            type="text"
            value={cite}
            onChange={(e) => setCite(e.target.value)}
            placeholder="Ej: DAF/0001/2026"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-field">Respondiendo con (opcional)</label>
          <input
            type="text"
            value={respondiendoCon}
            onChange={(e) => setRespondiendoCon(e.target.value)}
            placeholder="Ej: Informe técnico"
            className="input-field"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-primary">
            {enviando ? 'Confirmando...' : 'Confirmar recepción'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}