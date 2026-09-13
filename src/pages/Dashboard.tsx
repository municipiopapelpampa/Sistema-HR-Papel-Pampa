import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/layout/Layout'
import {
  FileText,
  Bell,
  Settings,
  Plus,
  List,
  BarChart3,
  Calendar as CalendarIcon,
  ArrowRight,
  Building2,
  TrendingUp,
  Users as UsersIcon
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  const esAdmin = user.rol?.puede_admin === true
  const puedeConcluir = user.rol?.puede_concluir === true

  const hora = new Date().getHours()
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <Layout titulo="Inicio">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-1 tracking-tight">
          {saludo}, {user.nombre_completo.split(' ')[0]} 👋
        </h1>
        <p className="text-neutral-500">
          Bienvenido al Sistema de Hoja de Ruta del Municipio de Papel Pampa
        </p>
      </div>

      {/* Info usuario */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Rol
          </p>
          <p className="font-semibold text-neutral-900 capitalize">
            {user.rol?.nombre}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Dirección
          </p>
          <p className="font-semibold text-neutral-900 truncate">
            {user.direccion_principal?.nombre || 'Sin asignar'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Cargo
          </p>
          <p className="font-semibold text-neutral-900 truncate">
            {user.cargo || '-'}
          </p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-700" />
          <h2 className="text-lg font-bold text-neutral-900">
            Acciones rápidas
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/hojas-ruta/nueva"
            className="card card-hover p-6 group border-l-4 border-l-primary-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-700" />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-neutral-900 mb-1">
              Crear Hoja de Ruta
            </h3>
            <p className="text-sm text-neutral-500">
              Registrar una nueva HR con adjuntos
            </p>
          </Link>

          <Link
            to="/hojas-ruta"
            className="card card-hover p-6 group border-l-4 border-l-secondary-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center">
                <List className="w-6 h-6 text-secondary-700" />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-secondary-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-neutral-900 mb-1">
              Ver Hojas de Ruta
            </h3>
            <p className="text-sm text-neutral-500">
              Listado con filtros y búsqueda avanzada
            </p>
          </Link>

          <Link
            to="/notificaciones"
            className="card card-hover p-6 group border-l-4 border-l-accent-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-accent-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-accent-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-neutral-900 mb-1">
              Notificaciones
            </h3>
            <p className="text-sm text-neutral-500">
              Revisa tus notificaciones pendientes
            </p>
          </Link>
        </div>
      </div>

      {/* Administración (solo admin) */}
      {esAdmin && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary-700" />
            <h2 className="text-lg font-bold text-neutral-900">
              Administración
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/usuarios"
              className="card card-hover p-6 group border-l-4 border-l-primary-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-primary-700" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-1">Usuarios</h3>
              <p className="text-sm text-neutral-500">
                Crear, editar y gestionar usuarios
              </p>
            </Link>

            <Link
              to="/admin/direcciones"
              className="card card-hover p-6 group border-l-4 border-l-primary-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-700" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-1">
                Direcciones
              </h3>
              <p className="text-sm text-neutral-500">
                Gestionar áreas y unidades municipales
              </p>
            </Link>

            <Link
              to="/admin/gestiones"
              className="card card-hover p-6 group border-l-4 border-l-primary-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-primary-700" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-1">Gestiones</h3>
              <p className="text-sm text-neutral-500">
                Cerrar y crear años fiscales
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Reportes (Alcalde, Secretaria, Directores) */}
      {puedeConcluir && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-700" />
            <h2 className="text-lg font-bold text-neutral-900">Análisis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/reportes"
              className="card card-hover p-6 group border-l-4 border-l-secondary-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-secondary-700" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-secondary-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-1">Reportes</h3>
              <p className="text-sm text-neutral-500">
                Genera reportes en PDF para análisis
              </p>
            </Link>
          </div>
        </div>
      )}
    </Layout>
  )
}