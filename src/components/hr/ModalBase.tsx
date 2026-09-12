import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  titulo: string
  subtitulo?: string
  children: ReactNode
  onClose: () => void
  ancho?: 'sm' | 'md' | 'lg'
}

export default function ModalBase({
  titulo,
  subtitulo,
  children,
  onClose,
  ancho = 'md'
}: Props) {
  const anchos = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${anchos[ancho]} my-8`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-secondary font-serif">{titulo}</h2>
            {subtitulo && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg ml-4"
            title="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}