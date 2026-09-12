import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ListaHR from './pages/HojasRuta/ListaHR'
import NuevaHR from './pages/HojasRuta/NuevaHR'
import DetalleHR from './pages/HojasRuta/DetalleHR'
import Usuarios from './pages/Admin/Usuarios'
import NuevoUsuario from './pages/Admin/NuevoUsuario'
import Notificaciones from './pages/Notificaciones'
import CambiarPassword from './pages/CambiarPassword'
import ModalNotificaciones from './components/notificaciones/ModalNotificaciones'
import { useRefetchOnFocus } from './hooks/useNotificaciones'

function AppRoutes() {
  const { user, loading } = useAuthContext()

  useRefetchOnFocus()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  // Sin sesión → al login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Con sesión pero debe cambiar contraseña → bloqueado
  if (user.debe_cambiar_password) {
    return (
      <Routes>
        <Route path="*" element={<CambiarPassword />} />
      </Routes>
    )
  }

  // Usuario autenticado normal
  return (
    <>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/hojas-ruta" element={<ListaHR />} />
        <Route path="/hojas-ruta/nueva" element={<NuevaHR />} />
        <Route path="/hojas-ruta/:id" element={<DetalleHR />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/usuarios/nuevo" element={<NuevoUsuario />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ModalNotificaciones />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}