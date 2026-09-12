import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'
import ModalBase from './ModalBase'
import { useConcluirHR } from '../../hooks/useDerivaciones'

interface Props {
  hrId: string
  hrNumero: string
  usuarioId: string
  onClose: () => void
}

export default function ModalConcluir({
  hrId,
  hrNumero,
  usuarioId,
  onClose
}: Props) {
  const [observacion, setObservacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mutation = useConcluirHR()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (observacion.trim().length < 5) {
      toast.error('La observación debe tener al menos 5 caracteres')
      return
    }
    setEnviando(true)
    try {
      await mutation.mutateAsync({ hrId, usuarioId, observacion })
      toast.success(`${hrNumero} concluida correctamente`)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo="Concluir Hoja de Ruta"
      subtitulo={hrNumero}
      onClose={onClose}
      ancho="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Al concluir, la hoja de ruta quedará <strong>finalizada</strong> y
            no podrá seguir derivándose.
          </p>
        </div>

        <div>
          <label className="label-field">Observación de conclusión *</label>
          <textarea
            rows={5}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Resumen o resultado final del trámite..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="btn-primary"
          >
            {enviando ? 'Concluyendo...' : 'Concluir hoja de ruta'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}