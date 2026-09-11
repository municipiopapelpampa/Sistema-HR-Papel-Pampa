import { useAuth } from '../hooks/useAuth'
import { LogOut, FileText, Bell, User, Settings } from 'lucide-react'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-circular.png"
              alt="Logo"
              className="h-12 w-12 object-contain bg-white rounded-full p-1"
            />
            <div>
              <h1 className="font-serif font-bold text-lg">
                Sistema HR - Papel Pampa
              </h1>
              <p className="text-xs text-white/80">
                Control de Trámites Municipales
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <User className="w-4 h-4" />
              <div className="text-sm">
                <p className="font-medium">{user.nombre_completo}</p>
                <p className="text-xs text-white/70 capitalize">
                  {user.rol?.nombre}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Hojas de Ruta</h3>
            <p className="text-sm text-gray-600">
              Crear, derivar y hacer seguimiento de hojas de ruta
            </p>
          </div>

          <div className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Notificaciones</h3>
            <p className="text-sm text-gray-600">
              Revisa las notificaciones pendientes
            </p>
          </div>

          <div className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
              <Settings className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold text-lg mb-1">Administración</h3>
            <p className="text-sm text-gray-600">
              Gestión de usuarios, direcciones y configuraciones
            </p>
          </div>
        </div>

        <div className="card mt-6">
          <p className="text-center text-sm text-gray-500">
            🚧 Módulos en desarrollo. Pronto verás aquí las hojas de ruta pendientes, tus notificaciones y más.
          </p>
        </div>
      </main>
    </div>
  )
}