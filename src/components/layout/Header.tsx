import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, FileText, Home, User } from 'lucide-react'
import CampanaNotificaciones from '../notificaciones/CampanaNotificaciones'

export default function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo + Título */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <img
            src="/logo-circular.png"
            alt="Logo"
            className="h-12 w-12 object-contain bg-white rounded-full p-1"
          />
          <div className="hidden sm:block">
            <h1 className="font-serif font-bold text-lg leading-tight">
              Sistema HR
            </h1>
            <p className="text-xs text-white/80">Papel Pampa</p>
          </div>
        </Link>

        {/* Navegación */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive('/') && location.pathname === '/'
                ? 'bg-white/20'
                : 'hover:bg-white/10'
            }`}
          >
            <Home className="w-4 h-4" />
            Inicio
          </Link>
          <Link
            to="/hojas-ruta"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive('/hojas-ruta') ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            Hojas de Ruta
          </Link>
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-2">
          {/* Campana de notificaciones */}
          <CampanaNotificaciones />

          {/* Bloque usuario → clickeable a Mi Perfil */}
          <Link
            to="/mi-perfil"
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/mi-perfil')
                ? 'bg-white/20'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Mi Perfil"
          >
            <User className="w-4 h-4" />
            <div className="text-xs">
              <p className="font-medium leading-tight">{user.nombre_completo}</p>
              <p className="text-white/70 capitalize leading-tight">
                {user.rol?.nombre}
              </p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}