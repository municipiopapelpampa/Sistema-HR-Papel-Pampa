import { useEffect, useState } from 'react'
import { X, Download, Loader2, FileText, AlertCircle } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import PDFHojaRuta from './PDFHojaRuta'
import type { HojaRutaConRelaciones, Derivacion } from '../../types'

interface Props {
  hr: HojaRutaConRelaciones
  derivaciones: Derivacion[]
  onClose: () => void
}

export default function ModalPreviewPDF({ hr, derivaciones, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const nombreArchivo = `${hr.numero_unico}.pdf`

  // Generar el PDF al abrir el modal
  useEffect(() => {
    let cancelado = false
    let urlCreada: string | null = null

    const generarPDF = async () => {
      try {
        setCargando(true)
        setError(null)

        const doc = <PDFHojaRuta hr={hr} derivaciones={derivaciones} />
        const blobGenerado = await pdf(doc).toBlob()

        if (cancelado) return

        urlCreada = URL.createObjectURL(blobGenerado)
        setBlob(blobGenerado)
        setBlobUrl(urlCreada)
      } catch (e: any) {
        console.error('Error al generar PDF:', e)
        if (!cancelado) setError(e.message || 'Error al generar el PDF')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    generarPDF()

    return () => {
      cancelado = true
      if (urlCreada) URL.revokeObjectURL(urlCreada)
    }
  }, [hr, derivaciones])

  // Descargar el PDF
  const handleDescargar = () => {
    if (!blob || !blobUrl) return
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-secondary font-serif text-lg">
                Vista Previa - {hr.numero_unico}
              </h2>
              <p className="text-xs text-gray-500">
                Documento listo para imprimir y adjuntar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDescargar}
              disabled={cargando || !blobUrl}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Cerrar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Vista previa */}
        <div className="flex-1 bg-gray-100 overflow-hidden relative">
          {cargando && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Generando vista previa del PDF...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Esto puede tomar unos segundos
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6">
              <div className="text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="font-medium text-gray-800 mb-1">
                  Error al generar el PDF
                </p>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <button onClick={onClose} className="btn-outline">
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {blobUrl && !cargando && (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title={`Vista previa ${hr.numero_unico}`}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
          <span>
            💡 Imprime y adjunta esta hoja a la carpeta física, luego recoge las
            firmas y sellos
          </span>
          <span>{derivaciones.length} derivación(es)</span>
        </div>
      </div>
    </div>
  )
}