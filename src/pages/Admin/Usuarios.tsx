import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Building2,
  Shield,
  Trash2
} from 'lucide-react'
import Header from '../../components/layout/Header'
import { useUsuarios, useEliminarUsuario, useToggleActivoUsuario } from '../../hooks/useUsuarios'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'sonner'

export default function Usuarios() {
  const { user } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)
  const { data: usuarios = [], isLoading } = useUsuarios()
  const eliminarMutation = useEliminarUsuario()
  const toggleMutation = useToggleActivoUsuario()

  if (!user?.rol?.puede_admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Sin permisos</p>
            <p className="text-sm text-gray-500 mt-1">
              Solo el Alcalde y la Secretaria pueden gestionar usuarios
            </p>
          </div>
        </div>
      </div>
    )
  }

  const filtrados = usuarios.filter(
    (u) =>
      u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleEliminar = async (id: string) => {
    try {
      await eliminarMutation.mutateAsync(id)
      toast.success('Usuario eliminado')
      setConfirmarEliminar(null)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleToggle = async (id: string, activo: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, activo: !activo })
      toast.success(activo ? 'Usuario desactivado' : 'Usuario activado')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Users className="w-6 h-6" />
              Gestión de Usuarios
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} registrados
            </p>
          </div>
          <Link
            to="/admin/usuarios/nuevo"
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Link>
        </div>

        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-500">Cargando usuarios...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">No hay usuarios</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((u) => (
              <div key={u.id} className="card">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary text-lg">
                      {u.nombre_completo.charAt(0)}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{u.nombre_completo}</h3>
                <p className="text-xs text-gray-500 mb-3">{u.cargo}</p>

                <div className="space-y-1.5 text-xs">
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{u.email}</span>
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    <span className="capitalize">{u.rol?.nombre}</span>
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>{u.direccion_principal?.codigo || 'Sin asignar'}</span>
                  </p>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggle(u.id, u.activo)}
                    className="flex-1 text-xs py-1.5 px-2 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    {u.activo ? (
                      <>
                        <UserX className="w-3 h-3" /> Desactivar
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3" /> Activar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmarEliminar(u.id)}
                    disabled={u.id === user.id}
                    className="text-xs py-1.5 px-2 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-30 flex items-center justify-center gap-1"
                    title={u.id === user.id ? 'No puedes eliminarte' : 'Eliminar'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">¿Eliminar usuario?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Esta acción eliminará permanentemente al usuario del sistema.
                  No se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmarEliminar)}
                className="btn-danger"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}