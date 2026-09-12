import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/layout/Header'
import {
  FileText,
  Bell,
  Settings,
  Plus,
  List,
  BarChart3,
  Calendar as CalendarIcon
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Bienvenida */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Bienvenido, {user.nombre_completo}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rol</p>
              <p className="font-medium text-gray-800 capitalize">
                {user.rol?.nombre}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Dirección
              </p>
              <p className="font-medium text-gray-800">
                {user.direccion_principal?.nombre || 'Sin asignar'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Cargo</p>
              <p className="font-medium text-gray-800">{user.cargo || '-'}</p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <h3 className="font-semibold text-gray-700 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/hojas-ruta/nueva"
            className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Crear Hoja de Ruta</h3>
            <p className="text-sm text-gray-600">
              Registrar una nueva hoja de ruta con adjuntos
            </p>
          </Link>

          <Link
            to="/hojas-ruta"
            className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-secondary"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
              <List className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Ver Hojas de Ruta</h3>
            <p className="text-sm text-gray-600">
              Listado completo con filtros y búsqueda
            </p>
          </Link>

          <Link
            to="/notificaciones"
            className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-accent"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold text-lg mb-1">Notificaciones</h3>
            <p className="text-sm text-gray-600">
              Revisa las notificaciones del sistema
            </p>
          </Link>
        </div>

        {/* Administración (solo admin) */}
        {user.rol?.puede_admin && (
          <>
            <h3 className="font-semibold text-gray-700 mb-3 mt-8">
              Administración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/usuarios"
                className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-accent"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <Settings className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-1">Usuarios</h3>
                <p className="text-sm text-gray-600">
                  Crear, editar y gestionar usuarios del sistema
                </p>
              </Link>

              <Link
                to="/admin/gestiones"
                className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-accent"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <CalendarIcon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-1">Gestiones</h3>
                <p className="text-sm text-gray-600">
                  Cerrar y crear años fiscales
                </p>
              </Link>
            </div>
          </>
        )}

        {/* Reportes (solo Alcalde, Secretaria y Directores) */}
        {user.rol?.puede_concluir && (
          <>
            <h3 className="font-semibold text-gray-700 mb-3 mt-8">
              Análisis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/reportes"
                className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-secondary"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-bold text-lg mb-1">Reportes</h3>
                <p className="text-sm text-gray-600">
                  Genera reportes en PDF para análisis
                </p>
              </Link>
            </div>
          </>
        )}

        <div className="card mt-8">
          <p className="text-center text-sm text-gray-500">
            🚧 Sistema en desarrollo. Módulo de búsqueda avanzada próximamente.
          </p>
        </div>
      </main>
    </div>
  )
} 