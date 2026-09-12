import { useEffect, useState } from 'react'
import { X, Download, Loader2, FileText, AlertCircle, Filter } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { useAuth } from '../../hooks/useAuth'
import { useDirecciones } from '../../hooks/useDirecciones'
import {
  reporteHrPorDireccion,
  reporteHrPorEstado,
  reporteHrConcluidas,
  reporteHrPendientes,
  type TipoReporte,
  type HRReporte
} from '../../services/reportes'
import PDFReporteDireccion from './PDFReporteDireccion'
import PDFReporteEstado from './PDFReporteEstado'
import PDFReporteConcluidas from './PDFReporteConcluidas'
import PDFReportePendientes from './PDFReportePendientes'
import { toast } from 'sonner'

interface Props {
  tipo: TipoReporte
  titulo: string
  onClose: () => void
}

const HOY = new Date().toISOString().split('T')[0]
const INICIO_ANIO = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]

export default function ModalGenerarReporte({ tipo, titulo, onClose }: Props) {
  const { user } = useAuth()
  const { data: direcciones = [] } = useDirecciones()

  // Filtros
  const [fechaDesde, setFechaDesde] = useState(INICIO_ANIO)
  const [fechaHasta, setFechaHasta] = useState(HOY)
  const [direccionId, setDireccionId] = useState('')
  const [diasPendiente, setDiasPendiente] = useState(7)

  // Estado
  const [generando, setGenerando] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [datos, setDatos] = useState<any>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Generar datos automáticamente al abrir el modal
  useEffect(() => {
    generarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo])

  const generarDatos = async () => {
    setGenerando(true)
    setError(null)
    setDatos(null)
    setBlobUrl(null)
    setBlob(null)

    try {
      const filtros = {
        fechaDesde,
        fechaHasta,
        direccionId: direccionId || undefined,
        diasPendiente
      }

      let resultado: any
      switch (tipo) {
        case 'POR_DIRECCION':
          resultado = await reporteHrPorDireccion(filtros)
          break
        case 'POR_ESTADO':
          resultado = await reporteHrPorEstado(filtros)
          break
        case 'CONCLUIDAS':
          resultado = await reporteHrConcluidas(filtros)
          break
        case 'PENDIENTES':
          resultado = await reporteHrPendientes(filtros)
          break
      }

      setDatos(resultado)
    } catch (e: any) {
      setError(e.message || 'Error al generar datos')
    } finally {
      setGenerando(false)
    }
  }

  const construirFiltros = () => {
    const arr: { label: string; valor: string }[] = []

    if (tipo === 'POR_DIRECCION' || tipo === 'CONCLUIDAS' || tipo === 'POR_ESTADO') {
      arr.push({
        label: 'Desde',
        valor: new Date(fechaDesde + 'T00:00:00').toLocaleDateString('es-BO')
      })
      arr.push({
        label: 'Hasta',
        valor: new Date(fechaHasta + 'T00:00:00').toLocaleDateString('es-BO')
      })
    }

    if (direccionId) {
      const dir = direcciones.find((d) => d.id === direccionId)
      if (dir) {
        arr.push({ label: 'Dirección', valor: `${dir.codigo} - ${dir.nombre}` })
      }
    }

    if (tipo === 'PENDIENTES') {
      arr.push({ label: 'Días mínimo sin concluir', valor: `${diasPendiente} días` })
    }

    return arr
  }

  const generarPDF = async () => {
    if (!datos || !user) return
    setGenerandoPDF(true)

    try {
      const filtros = construirFiltros()
      const usuarioGenerador = user.rol?.nombre || 'Usuario'
      const nombreUsuario = user.nombre_completo

      let doc: any
      switch (tipo) {
        case 'POR_DIRECCION':
          doc = (
            <PDFReporteDireccion
              datos={datos as HRReporte[]}
              filtros={filtros}
              usuarioGenerador={usuarioGenerador}
              nombreUsuario={nombreUsuario}
            />
          )
          break
        case 'POR_ESTADO':
          doc = (
            <PDFReporteEstado
              datos={datos as { estado: string; total: number }[]}
              filtros={filtros}
              usuarioGenerador={usuarioGenerador}
              nombreUsuario={nombreUsuario}
            />
          )
          break
        case 'CONCLUIDAS':
          doc = (
            <PDFReporteConcluidas
              datos={datos as HRReporte[]}
              filtros={filtros}
              usuarioGenerador={usuarioGenerador}
              nombreUsuario={nombreUsuario}
            />
          )
          break
        case 'PENDIENTES':
          doc = (
            <PDFReportePendientes
              datos={datos as HRReporte[]}
              filtros={filtros}
              usuarioGenerador={usuarioGenerador}
              nombreUsuario={nombreUsuario}
              diasMinimo={diasPendiente}
            />
          )
          break
      }

      const blobGenerado = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blobGenerado)
      setBlob(blobGenerado)
      setBlobUrl(url)
    } catch (e: any) {
      toast.error('Error al generar PDF: ' + e.message)
    } finally {
      setGenerandoPDF(false)
    }
  }

  const descargarPDF = () => {
    if (!blob || !blobUrl) return
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalRegistros = Array.isArray(datos) ? datos.length : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-secondary font-serif text-lg">
                {titulo}
              </h2>
              <p className="text-xs text-gray-500">
                Configura los filtros y genera el PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filtros */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(tipo === 'POR_DIRECCION' ||
              tipo === 'CONCLUIDAS' ||
              tipo === 'POR_ESTADO') && (
              <>
                <div>
                  <label className="label-field text-xs">Desde</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="label-field text-xs">Hasta</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </>
            )}

            {tipo === 'PENDIENTES' && (
              <div>
                <label className="label-field text-xs">Días mínimo sin concluir</label>
                <input
                  type="number"
                  min={1}
                  value={diasPendiente}
                  onChange={(e) => setDiasPendiente(parseInt(e.target.value) || 7)}
                  className="input-field text-sm"
                />
              </div>
            )}

            <div>
              <label className="label-field text-xs">Dirección (opcional)</label>
              <select
                value={direccionId}
                onChange={(e) => setDireccionId(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Todas las direcciones</option>
                {direcciones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.codigo} - {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generarDatos}
                disabled={generando}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                {generando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>Aplicar filtros</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-gray-100 overflow-hidden relative">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="font-medium text-gray-800 mb-1">
                  Error al generar el reporte
                </p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          )}

          {!error && generando && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">Consultando datos...</p>
              </div>
            </div>
          )}

          {!error && !generando && !blobUrl && datos && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-800 mb-1">
                  {totalRegistros} registro(s) encontrado(s)
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Click en "Generar PDF" para ver la vista previa y descargar
                </p>
                <button
                  onClick={generarPDF}
                  disabled={generandoPDF}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {generandoPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!error && blobUrl && (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title="Vista previa del reporte"
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {datos && Array.isArray(datos) && (
              <span>{totalRegistros} registro(s) encontrado(s)</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-outline text-sm">
              Cerrar
            </button>
            {blobUrl && (
              <button
                onClick={descargarPDF}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}