import { useState, useMemo } from 'react'
import {
  Plus,
  Building2,
  Search,
  Users as UsersIcon,
  FileText,
  Edit2,
  Power,
  PowerOff,
  Shield,
  Mail,
  Info
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import ModalNuevaDireccion from '../../components/admin/ModalNuevaDireccion'
import ModalEditarDireccion from '../../components/admin/ModalEditarDireccion'
import { useTodasDirecciones, useToggleActivoDireccion } from '../../hooks/useUsuarios'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'sonner'
import type { Direccion } from '../../types'

export default function Direcciones() {
  const { user } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [modalNueva, setModalNueva] = useState(false)
  const [editar, setEditar] = useState<Direccion | null>(null)
  const [confirmarToggle, setConfirmarToggle] = useState<Direccion | null>(null)
  const toggleMutation = useToggleActivoDireccion()

  const { data: direcciones = [], isLoading } = useTodasDirecciones()

  const filtradas = useMemo(
    () =>
      direcciones.filter(
        (d) =>
          d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          d.codigo.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [direcciones, busqueda]
  )

  if (!user?.rol?.puede_admin) {
    return (
      <Layout titulo="Direcciones">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-accent-500 mx-auto mb-3" />
            <p className="text-neutral-700 font-medium">Sin permisos</p>
            <p className="text-sm text-neutral-500 mt-1">
              Solo el Alcalde y la Secretaria pueden gestionar las direcciones
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  const handleToggle = async (d: Direccion) => {
    try {
      await toggleMutation.mutateAsync({ id: d.id, activo: !d.activo })
      toast.success(d.activo ? `Dirección ${d.codigo} desactivada` : `Dirección ${d.codigo} activada`)
      setConfirmarToggle(null)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const activas = filtradas.filter((d) => d.activo)
  const inactivas = filtradas.filter((d) => !d.activo)

  return (
    <Layout titulo="Direcciones">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary-700" />
              Gestión de Direcciones
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {direcciones.length}{' '}
              {direcciones.length === 1 ? 'dirección registrada' : 'direcciones registradas'}
            </p>
          </div>
          <button
            onClick={() => setModalNueva(true)}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Nueva Dirección
          </button>
        </div>

        {/* Info */}
        <div className="card p-4 mb-6 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-primary-700" />
            </div>
            <div className="text-sm text-primary-800">
              <p className="font-semibold mb-0.5">
                Sobre la gestión de direcciones
              </p>
              <ul className="text-xs space-y-0.5 list-disc pl-4">
                <li>El <strong>código</strong> (ej. DUT) es inmutable una vez creado.</li>
                <li>Al <strong>desactivar</strong> una dirección, no aparecerá en los formularios de nueva HR ni al derivar.</li>
                <li>Las HR históricas y los usuarios de esa dirección <strong>se mantienen intactos</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="card p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código o nombre..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-700 mx-auto" />
            <p className="mt-4 text-neutral-500">Cargando direcciones...</p>
          </div>
        ) : (
          <>
            {/* Direcciones activas */}
            {activas.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Activas ({activas.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activas.map((d) => (
                    <CardDireccion
                      key={d.id}
                      direccion={d}
                      onEditar={() => setEditar(d)}
                      onToggle={() => setConfirmarToggle(d)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Direcciones inactivas */}
            {inactivas.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full"></span>
                  Inactivas ({inactivas.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactivas.map((d) => (
                    <CardDireccion
                      key={d.id}
                      direccion={d}
                      onEditar={() => setEditar(d)}
                      onToggle={() => setConfirmarToggle(d)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filtradas.length === 0 && (
              <div className="card text-center py-12">
                <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-700 font-medium">
                  No se encontraron direcciones
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {modalNueva && <ModalNuevaDireccion onClose={() => setModalNueva(false)} />}

      {editar && (
        <ModalEditarDireccion
          direccion={editar}
          onClose={() => setEditar(null)}
        />
      )}

      {/* Confirmación de toggle */}
      {confirmarToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  confirmarToggle.activo
                    ? 'bg-accent-100'
                    : 'bg-green-100'
                }`}
              >
                {confirmarToggle.activo ? (
                  <PowerOff className="w-5 h-5 text-accent-600" />
                ) : (
                  <Power className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-900">
                  {confirmarToggle.activo
                    ? `¿Desactivar dirección ${confirmarToggle.codigo}?`
                    : `¿Activar dirección ${confirmarToggle.codigo}?`}
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  {confirmarToggle.activo
                    ? 'La dirección ya no aparecerá en los formularios de nueva HR ni al derivar. Los datos históricos se mantienen.'
                    : 'La dirección volverá a estar disponible en los formularios.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmarToggle(null)}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleToggle(confirmarToggle)}
                className={confirmarToggle.activo ? 'btn-danger' : 'btn-primary'}
              >
                {confirmarToggle.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

// ============================================
// SUBCOMPONENTE: CARD DE DIRECCIÓN
// ============================================
function CardDireccion({
  direccion,
  onEditar,
  onToggle
}: {
  direccion: Direccion
  onEditar: () => void
  onToggle: () => void
}) {
  return (
    <div
      className={`card p-5 ${
        !direccion.activo ? 'opacity-70 border-dashed' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${
            direccion.activo
              ? 'bg-gradient-to-br from-primary-600 to-primary-800'
              : 'bg-neutral-400'
          }`}
        >
          {direccion.codigo}
        </div>
        <span
          className={`badge ${
            direccion.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {direccion.activo ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      <h3 className="font-bold text-neutral-800 mb-1 line-clamp-2">
        {direccion.nombre}
      </h3>

      {direccion.descripcion && (
        <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
          {direccion.descripcion}
        </p>
      )}

      <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100">
        <button
          onClick={onEditar}
          className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center gap-1 font-medium text-neutral-700 transition-colors"
        >
          <Edit2 className="w-3 h-3" /> Editar
        </button>
        <button
          onClick={onToggle}
          className={`flex-1 text-xs py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 font-medium transition-colors ${
            direccion.activo
              ? 'border-accent-200 text-accent-600 hover:bg-accent-50'
              : 'border-green-200 text-green-600 hover:bg-green-50'
          }`}
        >
          {direccion.activo ? (
            <>
              <PowerOff className="w-3 h-3" /> Desactivar
            </>
          ) : (
            <>
              <Power className="w-3 h-3" /> Activar
            </>
          )}
        </button>
      </div>
    </div>
  )
}