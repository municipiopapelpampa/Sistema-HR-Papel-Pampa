import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { Building2, Loader2, Info } from 'lucide-react'
import { useCrearDireccion } from '../../hooks/useUsuarios'

interface Props {
  onClose: () => void
}

export default function ModalNuevaDireccion({ onClose }: Props) {
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mutation = useCrearDireccion()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (nombre.trim().length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres')
      return
    }
    if (codigo.trim().length < 2 || codigo.trim().length > 10) {
      toast.error('El código debe tener entre 2 y 10 caracteres')
      return
    }

    setEnviando(true)
    try {
      await mutation.mutateAsync({
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        descripcion: descripcion.trim()
      })
      toast.success(`Dirección ${codigo.toUpperCase()} creada correctamente`)
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
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Nueva Dirección</h2>
              <p className="text-sm text-white/80">
                Registra una nueva área o unidad municipal
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label-field">Código *</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: DRRHH"
              maxLength={10}
              className="input-field uppercase font-mono"
              autoFocus
              required
            />
            <p className="text-xs text-neutral-500 mt-1 flex items-start gap-1">
              <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
              Siglas cortas (máx. 10 caracteres). <strong>No se podrá cambiar
              después.</strong>
            </p>
          </div>

          <div>
            <label className="label-field">Nombre completo *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Dirección de Recursos Humanos"
              className="input-field"
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
              className="btn-primary"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Crear dirección
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}