import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Clock,
  Paperclip,
  CheckCircle2,
  Eye,
  XCircle,
  Send,
  FileDown,
  AlertCircle,
  Printer
} from 'lucide-react'
import Header from '../../components/layout/Header'
import TimelineDerivaciones from '../../components/hr/TimelineDerivaciones'
import ModalConfirmar from '../../components/hr/ModalConfirmar'
import ModalObservar from '../../components/hr/ModalObservar'
import ModalRechazar from '../../components/hr/ModalRechazar'
import ModalDerivar from '../../components/hr/ModalDerivar'
import ModalConcluir from '../../components/hr/ModalConcluir'
import ModalPreviewPDF from '../../components/hr/ModalPreviewPDF'
import { useHojaRuta } from '../../hooks/useHojasRuta'
import { useDerivaciones } from '../../hooks/useDerivaciones'
import { useAuth } from '../../hooks/useAuth'
import { obtenerUrlFirmada, formatearTamano } from '../../services/storage'
import { toast } from 'sonner'

type ModalAbierto =
  | 'confirmar'
  | 'observar'
  | 'rechazar'
  | 'derivar'
  | 'concluir'
  | null

export default function DetalleHR() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: hr, isLoading } = useHojaRuta(id)
  const { data: derivaciones = [] } = useDerivaciones(id)
  const [modalAbierto, setModalAbierto] = useState<ModalAbierto>(null)
  const [verPDF, setVerPDF] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-500">Cargando hoja de ruta...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hr || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700">Hoja de ruta no encontrada</p>
            <Link to="/hojas-ruta" className="btn-primary mt-4 inline-block">
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Derivación actual (la última)
  const derivacionActual = derivaciones[derivaciones.length - 1]

  // ¿El usuario puede actuar sobre la HR actual?
  const esDeMiDireccion = hr.direccion_actual_id === user.direccion_principal?.id
  const esAsignadaAMi = hr.usuario_actual_id === user.id
  const puedeActuar =
    hr.estado !== 'CONCLUIDA' &&
    (hr.usuario_actual_id ? esAsignadaAMi : esDeMiDireccion)

  // ¿Puede concluir?
  const puedeConcluir =
    user.rol?.puede_concluir === true && puedeActuar && hr.estado !== 'CONCLUIDA'

  const handleDescargar = async (ruta: string, nombre: string) => {
    const url = await obtenerUrlFirmada(ruta)
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.error(`No se pudo descargar ${nombre}`)
    }
  }

  const estadoBadge = () => {
    const colores: Record<string, string> = {
      CREADA: 'bg-gray-100 text-gray-700',
      ENVIADA: 'bg-blue-100 text-blue-800',
      PENDIENTE_CONFIRMACION: 'bg-amber-100 text-amber-800',
      CONFIRMADA: 'bg-blue-100 text-blue-800',
      OBSERVADA: 'bg-yellow-100 text-yellow-800',
      RECHAZADA: 'bg-red-100 text-red-800',
      DERIVADA: 'bg-purple-100 text-purple-800',
      CONCLUIDA: 'bg-green-100 text-green-800'
    }
    return colores[hr.estado] || 'bg-gray-100 text-gray-700'
  }

  const estadoLabel = hr.estado.replace(/_/g, ' ')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/hojas-ruta"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Link>

        {/* Encabezado */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-primary font-mono">
                  {hr.numero_unico}
                </h1>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${estadoBadge()}`}
                >
                  {estadoLabel}
                </span>
                {hr.tipo_urgente && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Urgente
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Creada el{' '}
                {new Date(hr.fecha_recepcion + 'T00:00:00').toLocaleDateString(
                  'es-BO'
                )}{' '}
                a las {hr.hora_recepcion.substring(0, 5)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hr.estado === 'CONCLUIDA' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Concluida</span>
                </div>
              )}
              <button
                onClick={() => setVerPDF(true)}
                className="btn-outline flex items-center gap-2"
                title="Ver PDF e imprimir"
              >
                <Printer className="w-4 h-4" />
                Ver PDF
              </button>
            </div>
          </div>
        </div>

        {/* Datos de recepción */}
        <div className="card mb-6">
          <h2 className="font-serif font-bold text-secondary border-b border-gray-200 pb-2 mb-4">
            DATOS DE RECEPCIÓN
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">N° Correlativo</p>
              <p className="font-mono font-medium">{hr.numero_correlativo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Fecha</p>
              <p className="font-medium">
                {new Date(hr.fecha_recepcion + 'T00:00:00').toLocaleDateString(
                  'es-BO'
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Hora</p>
              <p className="font-medium">{hr.hora_recepcion.substring(0, 5)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">N° Fojas</p>
              <p className="font-medium">{hr.numero_fojas}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            {hr.tipo_original && (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                Original
              </span>
            )}
            {hr.tipo_urgente && (
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                Urgente
              </span>
            )}
            {hr.tipo_copia && (
              <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded">
                Copia
              </span>
            )}
            {hr.tipo_fax && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                Fax
              </span>
            )}
          </div>
        </div>

        {/* Remitente */}
        <div className="card mb-6">
          <h2 className="font-serif font-bold text-secondary border-b border-gray-200 pb-2 mb-4">
            DATOS DEL REMITENTE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Nombre</p>
              <p className="font-medium">{hr.remitente_nombre}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Cargo</p>
              <p className="font-medium">{hr.remitente_cargo || '-'}</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="card mb-6">
          <h2 className="font-serif font-bold text-secondary border-b border-gray-200 pb-2 mb-4">
            DESCRIPCIÓN DEL CONTENIDO
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {hr.descripcion_contenido}
          </p>
        </div>

        {/* Destinatario actual */}
        <div className="card mb-6">
          <h2 className="font-serif font-bold text-secondary border-b border-gray-200 pb-2 mb-4">
            DESTINATARIO ACTUAL
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Nombre</p>
              <p className="font-medium">
                {hr.destinatario_nombre || 'Sin asignar'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Cargo</p>
              <p className="font-medium">{hr.destinatario_cargo || '-'}</p>
            </div>
          </div>
        </div>

        {/* Documentos */}
        {hr.documentos && hr.documentos.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-serif font-bold text-secondary border-b border-gray-200 pb-2 mb-4">
              DOCUMENTOS ADJUNTOS ({hr.documentos.length})
            </h2>
            <ul className="space-y-2">
              {hr.documentos.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.nombre_original}
                      </p>
                      {doc.tamano_bytes && (
                        <p className="text-xs text-gray-500">
                          {formatearTamano(doc.tamano_bytes)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleDescargar(doc.nombre_storage, doc.nombre_original)
                    }
                    className="text-primary hover:bg-primary/10 p-2 rounded-lg"
                    title="Descargar"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Historial */}
        <div className="card mb-6">
          <h2 className="font-serif font-bold text-secondary border-b border-gray-200 pb-2 mb-4">
            HISTORIAL DE DERIVACIONES
          </h2>
          <TimelineDerivaciones derivaciones={derivaciones} />
        </div>

        {/* Acciones */}
        {puedeActuar && derivacionActual && (
          <div className="card bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-primary mb-3">
              Acciones disponibles
            </h3>
            <div className="flex flex-wrap gap-2">
              {derivacionActual.estado === 'PENDIENTE' && (
                <button
                  onClick={() => setModalAbierto('confirmar')}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar recepción
                </button>
              )}

              {derivacionActual.estado === 'CONFIRMADA' && (
                <>
                  <button
                    onClick={() => setModalAbierto('observar')}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Observar
                  </button>
                  <button
                    onClick={() => setModalAbierto('derivar')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Derivar
                  </button>
                  <button
                    onClick={() => setModalAbierto('rechazar')}
                    className="btn-danger flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                  {puedeConcluir && (
                    <button
                      onClick={() => setModalAbierto('concluir')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Concluir
                    </button>
                  )}
                </>
              )}

              {derivacionActual.estado === 'OBSERVADA' && (
                <>
                  <button
                    onClick={() => setModalAbierto('derivar')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Derivar
                  </button>
                  {puedeConcluir && (
                    <button
                      onClick={() => setModalAbierto('concluir')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Concluir
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {!puedeActuar && hr.estado !== 'CONCLUIDA' && (
          <div className="card bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Esta hoja de ruta está en manos de{' '}
              <strong>{hr.destinatario_nombre}</strong>. No puedes actuar sobre
              ella.
            </p>
          </div>
        )}
      </main>

      {/* Modales */}
      {modalAbierto === 'confirmar' && derivacionActual && (
        <ModalConfirmar
          derivacionId={derivacionActual.id}
          hrId={hr.id}
          hrNumero={hr.numero_unico}
          usuarioId={user.id}
          onClose={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'observar' && derivacionActual && (
        <ModalObservar
          derivacionId={derivacionActual.id}
          hrId={hr.id}
          hrNumero={hr.numero_unico}
          usuarioId={user.id}
          onClose={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'rechazar' && derivacionActual && (
        <ModalRechazar
          derivacionId={derivacionActual.id}
          hrId={hr.id}
          hrNumero={hr.numero_unico}
          usuarioId={user.id}
          onClose={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'derivar' && user.direccion_principal && (
        <ModalDerivar
          hrId={hr.id}
          hrNumero={hr.numero_unico}
          usuarioId={user.id}
          direccionOrigenId={user.direccion_principal.id}
          onClose={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'concluir' && (
        <ModalConcluir
          hrId={hr.id}
          hrNumero={hr.numero_unico}
          usuarioId={user.id}
          onClose={() => setModalAbierto(null)}
        />
      )}

      {verPDF && (
        <ModalPreviewPDF
          hr={hr}
          derivaciones={derivaciones}
          onClose={() => setVerPDF(false)}
        />
      )}
    </div>
  )
}