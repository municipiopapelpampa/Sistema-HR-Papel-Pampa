import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  FileText,
  Bell,
  BarChart3,
  Settings,
  Users,
  Calendar,
  LogOut,
  X,
  ChevronRight,
  ChevronsLeft,
  Building2,
  ChevronsRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useContadorNoLeidas } from '../../hooks/useNotificaciones'

interface Props {
  abierto: boolean
  onCerrar: () => void
  colapsado: boolean
  onToggleColapsar: () => void
}

interface MenuItem {
  label: string
  to: string
  icono: any
  badge?: number
}

export default function Sidebar({
  abierto,
  onCerrar,
  colapsado,
  onToggleColapsar
}: Props) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: noLeidas = 0 } = useContadorNoLeidas(user?.id)

  if (!user) return null

  const esAdmin = user.rol?.puede_admin === true
  const puedeConcluir = user.rol?.puede_concluir === true

  const menuPrincipal: MenuItem[] = [
    { label: 'Inicio', to: '/', icono: Home },
    { label: 'Hojas de Ruta', to: '/hojas-ruta', icono: FileText },
    {
      label: 'Notificaciones',
      to: '/notificaciones',
      icono: Bell,
      badge: noLeidas
    },
    ...(puedeConcluir
      ? [{ label: 'Reportes', to: '/reportes', icono: BarChart3 }]
      : [])
  ]

  const menuAdmin: MenuItem[] = esAdmin
    ? [
        { label: 'Usuarios', to: '/admin/usuarios', icono: Users },
        { label: 'Direcciones', to: '/admin/direcciones', icono: Building2 },
        { label: 'Gestiones', to: '/admin/gestiones', icono: Calendar }
      ]
    : []

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleClick = (to: string) => {
    onCerrar()
    navigate(to)
  }

  // Item de menú (adaptado para colapsado/expandido)
  const MenuLink = ({ item }: { item: MenuItem }) => {
    const Icono = item.icono
    const activo = isActive(item.to)

    return (
      <button
        onClick={() => handleClick(item.to)}
        className={`group relative w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
          colapsado ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
        } ${
          activo
            ? 'bg-white/15 text-white shadow-sm'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
        title={colapsado ? item.label : undefined}
      >
        <Icono
          className={`w-5 h-5 flex-shrink-0 transition-transform ${
            activo ? 'scale-110' : 'group-hover:scale-110'
          }`}
        />

        {!colapsado && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
            {activo && <ChevronRight className="w-4 h-4 opacity-70" />}
          </>
        )}

        {/* Badge en modo colapsado */}
        {colapsado && item.badge !== undefined && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}

        {/* Tooltip en modo colapsado */}
        {colapsado && (
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
            {item.label}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      {/* Overlay en móvil */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onCerrar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-primary-800 to-primary-900 text-white z-50 flex flex-col shadow-2xl transition-all duration-300 ${
          colapsado ? 'w-[72px]' : 'w-72'
        } ${
          abierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header del sidebar */}
        <div
          className={`flex items-center border-b border-white/10 ${
            colapsado ? 'justify-center px-2 py-4' : 'px-4 py-4'
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center ${colapsado ? '' : 'gap-3 flex-1 min-w-0'}`}
            onClick={onCerrar}
            title="Sistema HR - Papel Pampa"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-lg flex-shrink-0">
              <img
                src="/logo-circular.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!colapsado && (
              <div className="min-w-0">
                <h1 className="font-bold text-base leading-tight truncate">
                  Sistema HR
                </h1>
                <p className="text-[10px] text-white/60 uppercase tracking-wider truncate">
                  Papel Pampa
                </p>
              </div>
            )}
          </Link>

          {/* Botón colapsar (solo desktop, al lado del logo) */}
          {!colapsado && (
            <button
              onClick={onToggleColapsar}
              className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg flex-shrink-0"
              title="Comprimir menú"
            >
              <ChevronsLeft className="w-5 h-5 text-white/70" />
            </button>
          )}

          {/* Botón cerrar en móvil */}
          {!colapsado && (
            <button
              onClick={onCerrar}
              className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg ml-1 flex-shrink-0"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Botón expandir (cuando está colapsado) - debajo del logo */}
        {colapsado && (
          <button
            onClick={onToggleColapsar}
            className="hidden lg:flex mx-auto mt-2 p-2 hover:bg-white/10 rounded-lg"
            title="Expandir menú"
          >
            <ChevronsRight className="w-5 h-5 text-white/70" />
          </button>
        )}

        {/* Usuario */}
        <Link
          to="/mi-perfil"
          onClick={onCerrar}
          className={`group transition-colors ${
            colapsado ? 'mx-2 mt-4 p-2 flex justify-center' : 'mx-3 mt-4 p-3'
          } bg-white/5 hover:bg-white/10 rounded-xl`}
          title={colapsado ? user.nombre_completo : undefined}
        >
          {colapsado ? (
            <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center shadow-md">
              <span className="font-bold text-sm">
                {user.nombre_completo.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="font-bold text-sm">
                  {user.nombre_completo.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {user.nombre_completo}
                </p>
                <p className="text-[10px] text-white/60 capitalize truncate leading-tight">
                  {user.rol?.nombre} • {user.direccion_principal?.codigo || 'MAE'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </div>
          )}
        </Link>

        {/* Navegación */}
        <nav
          className={`flex-1 overflow-y-auto scrollbar-thin py-4 space-y-1 ${
            colapsado ? 'px-2' : 'px-3'
          }`}
        >
          {/* Menu principal */}
          {!colapsado && (
            <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Principal
            </p>
          )}
          {colapsado && <div className="h-1" />}
          {menuPrincipal.map((item) => (
            <MenuLink key={item.to} item={item} />
          ))}

          {/* Menu admin */}
          {menuAdmin.length > 0 && (
            <>
              {!colapsado ? (
                <p className="px-3 py-2 mt-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  Administración
                </p>
              ) : (
                <div className="h-px bg-white/10 my-3 mx-2" />
              )}
              {menuAdmin.map((item) => (
                <MenuLink key={item.to} item={item} />
              ))}
            </>
          )}

          {/* Cerrar sesión */}
          {!colapsado ? (
            <p className="px-3 py-2 mt-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Cuenta
            </p>
          ) : (
            <div className="h-px bg-white/10 my-3 mx-2" />
          )}
          <button
            onClick={handleSignOut}
            className={`group relative w-full flex items-center rounded-lg text-sm font-medium text-white/70 hover:bg-accent-500/20 hover:text-white transition-all ${
              colapsado ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
            }`}
            title={colapsado ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {!colapsado && <span className="flex-1 text-left">Cerrar sesión</span>}

            {/* Tooltip en modo colapsado */}
            {colapsado && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                Cerrar sesión
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
              </span>
            )}
          </button>
        </nav>

        {/* Footer del sidebar */}
        {!colapsado && (
          <div className="px-5 py-3 border-t border-white/10">
            <p className="text-[10px] text-white/40 text-center">
              © {new Date().getFullYear()} Municipio de Papel Pampa
            </p>
          </div>
        )}
      </aside>
    </>
  )
}