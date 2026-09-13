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
  Printer,
  Building2,
  Users as UsersIcon,
  User as UserIcon,
  MapPin
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
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
import { useUsuariosDeDireccionAdmin } from '../../hooks/useUsuarios'
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

  // Usuarios de la dirección actual (para saber quién tiene la HR)
  const { data: usuariosDireccionActual = [] } = useUsuariosDeDireccionAdmin(
    hr?.direccion_actual_id || undefined
  )

  if (isLoading) {
    return (
      <Layout titulo="Detalle de Hoja de Ruta">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-700 mx-auto" />
            <p className="mt-4 text-neutral-500">Cargando hoja de ruta...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!hr || !user) {
    return (
      <Layout titulo="Detalle de Hoja de Ruta">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-accent-500 mx-auto mb-3" />
            <p className="text-neutral-700">Hoja de ruta no encontrada</p>
            <Link to="/hojas-ruta" className="btn-primary mt-4 inline-flex">
              Volver a la lista
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const derivacionActual = derivaciones[derivaciones.length - 1]
  const gestionCerrada = hr.gestion?.estado === 'CERRADA'
  const esDeMiDireccion = hr.direccion_actual_id === user.direccion_principal?.id
  const esAsignadaAMi = hr.usuario_actual_id === user.id
  const puedeActuar =
    hr.estado !== 'CONCLUIDA' &&
    !gestionCerrada &&
    (hr.usuario_actual_id ? esAsignadaAMi : esDeMiDireccion)

  const puedeConcluir =
    user.rol?.puede_concluir === true &&
    puedeActuar &&
    hr.estado !== 'CONCLUIDA' &&
    !gestionCerrada

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
      CREADA: 'bg-neutral-100 text-neutral-700',
      ENVIADA: 'bg-blue-100 text-blue-800',
      PENDIENTE_CONFIRMACION: 'bg-amber-100 text-amber-800',
      CONFIRMADA: 'bg-blue-100 text-blue-800',
      OBSERVADA: 'bg-yellow-100 text-yellow-800',
      RECHAZADA: 'bg-red-100 text-red-800',
      DERIVADA: 'bg-purple-100 text-purple-800',
      CONCLUIDA: 'bg-green-100 text-green-800'
    }
    return colores[hr.estado] || 'bg-neutral-100 text-neutral-700'
  }

  const estadoLabel = hr.estado.replace(/_/g, ' ')

  // ¿Ya está confirmada por alguien?
  const yaConfirmada =
    derivacionActual?.estado === 'CONFIRMADA' ||
    derivacionActual?.estado === 'OBSERVADA'
  const confirmadaPor = yaConfirmada
    ? usuariosDireccionActual.find((u) => u.id === hr.usuario_actual_id) || null
    : null

  return (
    <Layout titulo="Detalle de Hoja de Ruta">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/hojas-ruta"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Link>

        {/* Encabezado */}
        <div className="card mb-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-primary-700 font-mono">
                  {hr.numero_unico}
                </h1>
                <span className={`badge ${estadoBadge()}`}>{estadoLabel}</span>
                {hr.tipo_urgente && (
                  <span className="badge bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3" /> Urgente
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 flex items-center gap-2">
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
                className="btn-outline"
                title="Ver PDF e imprimir"
              >
                <Printer className="w-4 h-4" />
                Ver PDF
              </button>
            </div>
          </div>

          {gestionCerrada && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">
                  Hoja de ruta de gestión cerrada ({hr.gestion?.anio})
                </p>
                <p className="text-xs mt-0.5">
                  Solo se puede consultar y descargar el PDF.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================
            UBICACIÓN ACTUAL (mejorada)
            ============================================ */}
        {hr.estado !== 'CONCLUIDA' && (
          <div
            className={`card mb-6 p-6 border-l-4 ${
              puedeActuar
                ? 'border-l-primary-600 bg-gradient-to-r from-primary-50 to-white'
                : 'border-l-amber-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-700" />
              <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider">
                Ubicación actual
              </h2>
            </div>

            {/* Dirección */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase font-semibold">
                  Dirección
                </p>
                <p className="font-semibold text-neutral-900">
                  {hr.destinatario_nombre || 'Sin asignar'}
                </p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {hr.destinatario_cargo || ''}
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="mb-4">
              {!yaConfirmada && derivacionActual?.estado === 'PENDIENTE' && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 font-medium">
                    Pendiente de confirmación
                  </span>
                </div>
              )}
              {yaConfirmada && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Confirmada y en manos de:
                  </span>
                </div>
              )}
              {derivacionActual?.estado === 'OBSERVADA' && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700 font-medium">Con observaciones</span>
                </div>
              )}
            </div>

            {/* Usuario confirmado */}
            {confirmadaPor && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {confirmadaPor.nombre_completo.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-green-900">
                    {confirmadaPor.nombre_completo}
                  </p>
                  <p className="text-xs text-green-700">
                    {confirmadaPor.cargo || 'Sin cargo'}
                  </p>
                </div>
              </div>
            )}

            {/* Usuarios disponibles */}
            {!yaConfirmada && usuariosDireccionActual.length > 0 && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UsersIcon className="w-4 h-4 text-neutral-500" />
                  <p className="text-xs font-semibold text-neutral-600 uppercase">
                    Usuarios disponibles ({usuariosDireccionActual.length})
                  </p>
                </div>
                <ul className="space-y-1">
                  {usuariosDireccionActual.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-2 text-sm text-neutral-700"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-medium">{u.nombre_completo}</span>
                      {u.cargo && (
                        <span className="text-neutral-400 text-xs">
                          — {u.cargo}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-neutral-500 mt-2 italic">
                  Cualquiera de ellos puede confirmar la recepción.
                </p>
              </div>
            )}

            {/* Aviso si es mi dirección */}
            {puedeActuar && (
              <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-700 flex-shrink-0" />
                <p className="text-sm text-primary-800 font-medium">
                  Esta HR está en tu área. Puedes actuar sobre ella.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Datos de recepción */}
        <div className="card mb-6 p-6">
          <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4">
            Datos de Recepción
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase">N° Correlativo</p>
              <p className="font-mono font-medium">{hr.numero_correlativo}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase">Fecha</p>
              <p className="font-medium">
                {new Date(hr.fecha_recepcion + 'T00:00:00').toLocaleDateString(
                  'es-BO'
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase">Hora</p>
              <p className="font-medium">{hr.hora_recepcion.substring(0, 5)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase">N° Fojas</p>
              <p className="font-medium">{hr.numero_fojas}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
            {hr.tipo_original && (
              <span className="badge bg-primary-100 text-primary-800">Original</span>
            )}
            {hr.tipo_urgente && (
              <span className="badge bg-accent-100 text-accent-800">Urgente</span>
            )}
            {hr.tipo_copia && (
              <span className="badge bg-secondary-100 text-secondary-800">Copia</span>
            )}
            {hr.tipo_fax && (
              <span className="badge bg-neutral-100 text-neutral-700">Fax</span>
            )}
          </div>
        </div>

        {/* Remitente */}
        <div className="card mb-6 p-6">
          <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4">
            Datos del Remitente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase">Nombre</p>
              <p className="font-medium">{hr.remitente_nombre}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase">Cargo</p>
              <p className="font-medium">{hr.remitente_cargo || '-'}</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="card mb-6 p-6">
          <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4">
            Descripción del Contenido
          </h2>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">
            {hr.descripcion_contenido}
          </p>
        </div>

        {/* Documentos */}
        {hr.documentos && hr.documentos.length > 0 && (
          <div className="card mb-6 p-6">
            <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4">
              Documentos Adjuntos ({hr.documentos.length})
            </h2>
            <ul className="space-y-2">
              {hr.documentos.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Paperclip className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.nombre_original}
                      </p>
                      {doc.tamano_bytes && (
                        <p className="text-xs text-neutral-500">
                          {formatearTamano(doc.tamano_bytes)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleDescargar(doc.nombre_storage, doc.nombre_original)
                    }
                    className="text-primary-700 hover:bg-primary-50 p-2 rounded-lg transition-colors"
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
        <div className="card mb-6 p-6">
          <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4">
            Historial de Derivaciones
          </h2>
          <TimelineDerivaciones
            derivaciones={derivaciones}
            hrCreada={{
              numero_unico: hr.numero_unico,
              fecha_recepcion: hr.fecha_recepcion,
              hora_recepcion: hr.hora_recepcion,
              remitente_nombre: hr.remitente_nombre,
              remitente_cargo: hr.remitente_cargo,
              creadaPor: hr.remitente
                ? {
                    nombre_completo: hr.remitente.nombre_completo,
                    cargo: hr.remitente.cargo
                  }
                : null
            }}
            direccionActualId={hr.direccion_actual_id}
            estadoActual={hr.estado}
          />
        </div>

        {/* Acciones */}
        {puedeActuar && derivacionActual && (
          <div className="card bg-primary-50 border-primary-200 p-6">
            <h3 className="font-semibold text-primary-700 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Acciones disponibles para ti
            </h3>
            <div className="flex flex-wrap gap-2">
              {derivacionActual.estado === 'PENDIENTE' && (
                <button
                  onClick={() => setModalAbierto('confirmar')}
                  className="btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar recepción
                </button>
              )}

              {derivacionActual.estado === 'CONFIRMADA' && (
                <>
                  <button
                    onClick={() => setModalAbierto('observar')}
                    className="btn-outline"
                  >
                    <Eye className="w-4 h-4" />
                    Observar
                  </button>
                  <button
                    onClick={() => setModalAbierto('derivar')}
                    className="btn-secondary"
                  >
                    <Send className="w-4 h-4" />
                    Derivar
                  </button>
                  <button
                    onClick={() => setModalAbierto('rechazar')}
                    className="btn-danger"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                  {puedeConcluir && (
                    <button
                      onClick={() => setModalAbierto('concluir')}
                      className="btn-primary"
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
                    className="btn-secondary"
                  >
                    <Send className="w-4 h-4" />
                    Derivar
                  </button>
                  {puedeConcluir && (
                    <button
                      onClick={() => setModalAbierto('concluir')}
                      className="btn-primary"
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

        {!puedeActuar && hr.estado !== 'CONCLUIDA' && !gestionCerrada && (
          <div className="card bg-amber-50 border-amber-200 p-4">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Esta hoja de ruta está en{' '}
              <strong>{hr.destinatario_nombre}</strong> y no en tu dirección.
              No puedes actuar sobre ella.
            </p>
          </div>
        )}
      </div>

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
    </Layout>
  )
}