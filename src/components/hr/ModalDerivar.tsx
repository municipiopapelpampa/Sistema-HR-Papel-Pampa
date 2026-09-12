import { useState, FormEvent, useEffect } from 'react'
import { toast } from 'sonner'
import { Send, Info } from 'lucide-react'
import ModalBase from './ModalBase'
import { useDerivarHR } from '../../hooks/useDerivaciones'
import { useDirecciones, useUsuariosDeDireccion } from '../../hooks/useDirecciones'
import type { TipoDestinatario } from '../../types'

interface Props {
  hrId: string
  hrNumero: string
  usuarioId: string
  direccionOrigenId: string
  onClose: () => void
}

export default function ModalDerivar({
  hrId,
  hrNumero,
  usuarioId,
  direccionOrigenId,
  onClose
}: Props) {
  const [direccionDestino, setDireccionDestino] = useState('')
  const [tipoDest, setTipoDest] = useState<TipoDestinatario>('DIRECCION')
  const [usuarioDest, setUsuarioDest] = useState('')
  const [cite, setCite] = useState('')
  const [respondiendoCon, setRespondiendoCon] = useState('')
  const [instrucciones, setInstrucciones] = useState('')
  const [tipoOriginal, setTipoOriginal] = useState(true)
  const [tipoUrgente, setTipoUrgente] = useState(false)
  const [tipoCopia, setTipoCopia] = useState(false)
  const [tipoFax, setTipoFax] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const { data: direcciones = [] } = useDirecciones()
  const { data: usuariosDir = [] } = useUsuariosDeDireccion(
    tipoDest === 'PERSONA' ? direccionDestino : undefined
  )
  const mutation = useDerivarHR()

  // Excluir la dirección actual
  const direccionesDisponibles = direcciones.filter(
    (d) => d.id !== direccionOrigenId
  )

  useEffect(() => {
    if (tipoDest === 'DIRECCION') setUsuarioDest('')
  }, [tipoDest])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!direccionDestino) {
      toast.error('Selecciona una dirección de destino')
      return
    }
    if (!cite.trim()) {
      toast.error('El CITE es obligatorio')
      return
    }
    if (instrucciones.trim().length < 5) {
      toast.error('Las instrucciones deben tener al menos 5 caracteres')
      return
    }
    if (tipoDest === 'PERSONA' && !usuarioDest) {
      toast.error('Selecciona una persona específica')
      return
    }

    setEnviando(true)
    try {
      await mutation.mutateAsync({
        hrId,
        usuarioId,
        direccionOrigenId,
        form: {
          direccion_destino_id: direccionDestino,
          tipo_destinatario: tipoDest,
          destinatario_usuario_id: tipoDest === 'PERSONA' ? usuarioDest : undefined,
          instrucciones,
          cite,
          respondiendo_con: respondiendoCon,
          tipo_original: tipoOriginal,
          tipo_urgente: tipoUrgente,
          tipo_copia: tipoCopia,
          tipo_fax: tipoFax
        }
      })
      toast.success('Hoja de ruta derivada correctamente')
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo="Derivar a otra dirección"
      subtitulo={hrNumero}
      onClose={onClose}
      ancho="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Dirección de destino *</label>
          <select
            value={direccionDestino}
            onChange={(e) => setDireccionDestino(e.target.value)}
            className="input-field"
          >
            <option value="">-- Selecciona --</option>
            {direccionesDisponibles.map((d) => (
              <option key={d.id} value={d.id}>
                {d.codigo} - {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Tipo de destinatario</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={tipoDest === 'DIRECCION'}
                onChange={() => setTipoDest('DIRECCION')}
                className="w-4 h-4"
              />
              <span className="text-sm">Dirección completa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={tipoDest === 'PERSONA'}
                onChange={() => setTipoDest('PERSONA')}
                className="w-4 h-4"
              />
              <span className="text-sm">Persona específica</span>
            </label>
          </div>
        </div>

        {tipoDest === 'PERSONA' && (
          <div>
            <label className="label-field">Persona *</label>
            <select
              value={usuarioDest}
              onChange={(e) => setUsuarioDest(e.target.value)}
              className="input-field"
              disabled={!direccionDestino}
            >
              <option value="">-- Selecciona --</option>
              {usuariosDir.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo} {u.cargo ? `(${u.cargo})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">El CITE es obligatorio</p>
            <p className="text-xs">
              Escríbelo tal como está en tu libro de registro físico.
              Ej: <code className="bg-white px-1 rounded">DAF/0001/2026</code>
            </p>
          </div>
        </div>

        <div>
          <label className="label-field">CITE *</label>
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

        <div>
          <label className="label-field">Instrucciones *</label>
          <textarea
            rows={3}
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            placeholder="Instrucciones para el destinatario..."
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="label-field">Tipo de envío</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tipoOriginal}
                onChange={(e) => setTipoOriginal(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Original</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tipoUrgente}
                onChange={(e) => setTipoUrgente(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Urgente</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tipoCopia}
                onChange={(e) => setTipoCopia(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Copia</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tipoFax}
                onChange={(e) => setTipoFax(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Fax</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {enviando ? 'Derivando...' : 'Derivar'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}