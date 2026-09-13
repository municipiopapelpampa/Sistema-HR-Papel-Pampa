import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { Building2, Loader2, Lock } from 'lucide-react'
import { useEditarDireccion } from '../../hooks/useUsuarios'
import type { Direccion } from '../../types'

interface Props {
  direccion: Direccion
  onClose: () => void
}

export default function ModalEditarDireccion({ direccion, onClose }: Props) {
  const [nombre, setNombre] = useState(direccion.nombre)
  const [descripcion, setDescripcion] = useState(direccion.descripcion || '')
  const [enviando, setEnviando] = useState(false)
  const mutation = useEditarDireccion()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (nombre.trim().length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres')
      return
    }

    setEnviando(true)
    try {
      await mutation.mutateAsync({
        id: direccion.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim()
      })
      toast.success(`Dirección ${direccion.codigo} actualizada`)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary-700 to-secondary-900 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Editar Dirección</h2>
              <p className="text-sm text-white/80">{direccion.codigo}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label-field">Código</label>
            <div className="relative">
              <input
                type="text"
                value={direccion.codigo}
                disabled
                className="input-field bg-neutral-100 cursor-not-allowed font-mono uppercase pr-10"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              El código no se puede modificar
            </p>
          </div>

          <div>
            <label className="label-field">Nombre completo *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-field"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="label-field">Descripción (opcional)</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción del área..."
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
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
              className="btn-secondary"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>Guardar cambios</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}