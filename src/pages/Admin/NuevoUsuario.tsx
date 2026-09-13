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
import Layout from '../../components/layout/Layout'
import {
  useRoles,
  useDireccionesAdmin,
  useCrearUsuario
} from '../../hooks/useUsuarios'
import { useAuth } from '../../hooks/useAuth'

function SeccionTitulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4">
      {children}
    </h2>
  )
}

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
      <Layout titulo="Nuevo Usuario">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-accent-500 mx-auto mb-3" />
            <p className="text-neutral-700 font-medium">Sin permisos</p>
          </div>
        </div>
      </Layout>
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
    <Layout titulo="Nuevo Usuario">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/admin/usuarios"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary-700" />
            Nuevo Usuario
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Crea un nuevo usuario en el sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-8">
          {/* Datos personales */}
          <div className="card p-6">
            <SeccionTitulo>Datos del Usuario</SeccionTitulo>

            <div className="space-y-4">
              <div>
                <label className="label-field">Nombre completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                  <span className="text-neutral-400 font-normal normal-case ml-2">
                    (mínimo 8 caracteres)
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-1.5 flex items-start gap-1.5">
                  <span>💡</span>
                  <span>
                    Se recomienda usar{' '}
                    <code className="bg-neutral-100 px-1 rounded text-[11px]">
                      PapelPampa2026!
                    </code>{' '}
                    y pedir al usuario que la cambie en su primer ingreso.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Rol y dirección */}
          <div className="card p-6">
            <SeccionTitulo>Rol y Asignación</SeccionTitulo>

            <div className="space-y-4">
              <div>
                <label className="label-field">Cargo *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Link to="/admin/usuarios" className="btn-outline justify-center">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando}
              className="btn-primary justify-center"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Crear usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}