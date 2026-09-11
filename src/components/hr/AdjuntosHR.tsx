import { useState, useRef } from 'react'
import { Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import { validarArchivo, formatearTamano } from '../../services/storage'
import { toast } from 'sonner'

interface Props {
  archivos: File[]
  onChange: (archivos: File[]) => void
  maxArchivos?: number
}

export default function AdjuntosHR({ archivos, onChange, maxArchivos = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const agregarArchivos = (nuevos: File[]) => {
    if (archivos.length + nuevos.length > maxArchivos) {
      toast.error(`Máximo ${maxArchivos} archivos por hoja de ruta`)
      return
    }

    const validados: File[] = []
    for (const file of nuevos) {
      const v = validarArchivo(file)
      if (!v.valido) {
        toast.error(v.error!)
        continue
      }
      // Evitar duplicados por nombre
      if (archivos.some((a) => a.name === file.name && a.size === file.size)) {
        continue
      }
      validados.push(file)
    }

    if (validados.length > 0) {
      onChange([...archivos, ...validados])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      agregarArchivos(Array.from(e.target.files))
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) {
      agregarArchivos(Array.from(e.dataTransfer.files))
    }
  }

  const quitarArchivo = (index: number) => {
    onChange(archivos.filter((_, i) => i !== index))
  }

  const getIcono = (tipo: string) => {
    if (tipo.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-500" />
    return <FileText className="w-4 h-4 text-red-500" />
  }

  return (
    <div>
      {/* Zona de drop */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-primary">Click para subir</span> o arrastra aquí
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, Word, Excel o imágenes • Máx. 10 MB c/u • Hasta {maxArchivos} archivos
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Lista de archivos */}
      {archivos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {archivos.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              {getIcono(file.type)}
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatearTamano(file.size)}
              </span>
              <button
                type="button"
                onClick={() => quitarArchivo(index)}
                className="p-1 hover:bg-red-100 rounded text-red-500"
                title="Quitar"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}