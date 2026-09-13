import { ReactNode, useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import CampanaNotificaciones from '../notificaciones/CampanaNotificaciones'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: ReactNode
  titulo?: string
}

const STORAGE_KEY = 'hr-sidebar-colapsado'

export default function Layout({ children, titulo }: Props) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [sidebarColapsado, setSidebarColapsado] = useState(() => {
    // Persistir estado en localStorage
    const guardado = localStorage.getItem(STORAGE_KEY)
    return guardado === 'true'
  })
  const { user } = useAuth()
  const location = useLocation()

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sidebarColapsado))
  }, [sidebarColapsado])

  if (!user) return null

  const tituloMostrar = titulo || obtenerTitulo(location.pathname)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        colapsado={sidebarColapsado}
        onToggleColapsar={() => setSidebarColapsado(!sidebarColapsado)}
      />

      {/* Contenido principal */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarColapsado ? 'lg:pl-[72px]' : 'lg:pl-72'
        }`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
            {/* Botón hamburguesa (solo móvil) */}
            <button
              onClick={() => setSidebarAbierto(true)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5 text-neutral-700" />
            </button>

            {/* Título */}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-neutral-900 truncate">
                {tituloMostrar}
              </h2>
            </div>

            {/* Campana de notificaciones */}
            <CampanaNotificaciones />
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  )
}

// Mapeo de rutas a títulos
function obtenerTitulo(pathname: string): string {
  if (pathname === '/') return 'Inicio'
  if (pathname === '/hojas-ruta') return 'Hojas de Ruta'
  if (pathname === '/hojas-ruta/nueva') return 'Nueva Hoja de Ruta'
  if (pathname.startsWith('/hojas-ruta/')) return 'Detalle de Hoja de Ruta'
  if (pathname === '/notificaciones') return 'Notificaciones'
  if (pathname === '/reportes') return 'Reportes'
  if (pathname === '/mi-perfil') return 'Mi Perfil'
  if (pathname === '/admin/usuarios') return 'Usuarios'
  if (pathname === '/admin/usuarios/nuevo') return 'Nuevo Usuario'
  if (pathname === '/admin/gestiones') return 'Gestiones'
  return 'Sistema HR'
}