import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  Briefcase,
  Building2,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import Header from '../../components/layout/Header'
import { useRoles, useDireccionesAdmin, useCrearUsuario } from '../../hooks/useUsuarios'
import { useAuth } from '../../hooks/useAuth'

export default function NuevoUsuario() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: roles = [] } = useRoles()
  const { data: direcciones = [] } = useDireccionesAdmin()
  const crearMutation = useCrearUsuario()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('PapelPampa2026!')
  const [cargo, setCargo] = useState('')
  const [rolId, setRolId] = useState('')
  const [direccionId, setDireccionId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)

  if (!user?.rol?.puede_admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Sin permisos</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!nombre || !email || !password || !cargo || !rolId || !direccionId) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setEnviando(true)
    try {
      await crearMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
        nombre_completo: nombre.trim(),
        cargo: cargo.trim(),
        rol_id: rolId,
        direccion_id: direccionId,
        cargo_direccion: cargo.trim()
      })
      toast.success(`Usuario ${nombre} creado correctamente`)
      navigate('/admin/usuarios')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/admin/usuarios"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            Nuevo Usuario
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Crea un nuevo usuario en el sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label-field">Nombre completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez Choque"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-field">Correo electrónico *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: jperez@papelpampa.gob.bo"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-field">
              Contraseña temporal *
              <span className="text-xs text-gray-500 ml-2">(mínimo 8 caracteres)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PapelPampa2026!"
                className="input-field pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Se recomienda usar <code className="bg-gray-100 px-1 rounded">PapelPampa2026!</code> y pedir al usuario que la cambie
            </p>
          </div>

          <div>
            <label className="label-field">Cargo *</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej: Director de Unidad Técnica"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-field">Rol *</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={rolId}
                onChange={(e) => setRolId(e.target.value)}
                className="input-field pl-10"
                required
              >
                <option value="">-- Selecciona un rol --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1)}
                    {r.puede_concluir ? ' (puede concluir HR)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">Dirección *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={direccionId}
                onChange={(e) => setDireccionId(e.target.value)}
                className="input-field pl-10"
                required
              >
                <option value="">-- Selecciona una dirección --</option>
                {direcciones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.codigo} - {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Link to="/admin/usuarios" className="btn-outline">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {enviando ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}