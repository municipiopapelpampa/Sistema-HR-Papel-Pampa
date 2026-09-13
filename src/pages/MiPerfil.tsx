import { useState, FormEvent, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/layout/Layout'
import { useActualizarPerfil, useCambiarPassword } from '../hooks/usePerfil'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  Check,
  X,
  Edit2,
  AlertCircle,
  KeyRound,
  Calendar
} from 'lucide-react'

interface Requisitos {
  longitud: boolean
  mayuscula: boolean
  minuscula: boolean
  numero: boolean
  especial: boolean
}

function validarPassword(pwd: string): Requisitos {
  return {
    longitud: pwd.length >= 8,
    mayuscula: /[A-Z]/.test(pwd),
    minuscula: /[a-z]/.test(pwd),
    numero: /[0-9]/.test(pwd),
    especial: /[^A-Za-z0-9]/.test(pwd)
  }
}

function todosCumplidos(req: Requisitos): boolean {
  return Object.values(req).every(Boolean)
}

function SeccionTitulo({
  children,
  icono: Icono
}: {
  children: React.ReactNode
  icono?: any
}) {
  return (
    <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4 flex items-center gap-2">
      {Icono && <Icono className="w-4 h-4" />}
      {children}
    </h2>
  )
}

export default function MiPerfil() {
  const { user, refreshUser } = useAuth()
  const actualizarMutation = useActualizarPerfil()
  const cambiarPwdMutation = useCambiarPassword()

  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(user?.nombre_completo || '')
  const [cargo, setCargo] = useState(user?.cargo || '')
  const [guardandoDatos, setGuardandoDatos] = useState(false)

  const [mostrarCambioPwd, setMostrarCambioPwd] = useState(false)
  const [pwdActual, setPwdActual] = useState('')
  const [pwdNueva, setPwdNueva] = useState('')
  const [pwdConfirmar, setPwdConfirmar] = useState('')
  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [cambiandoPwd, setCambiandoPwd] = useState(false)
  const [errorPwd, setErrorPwd] = useState<string | null>(null)

  const requisitos = useMemo(() => validarPassword(pwdNueva), [pwdNueva])
  const passwordValida = todosCumplidos(requisitos)
  const coinciden = pwdNueva === pwdConfirmar && pwdConfirmar.length > 0

  if (!user) return null

  const handleGuardarDatos = async (e: FormEvent) => {
    e.preventDefault()
    if (nombre.trim().length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres')
      return
    }

    setGuardandoDatos(true)
    try {
      await actualizarMutation.mutateAsync({
        usuarioId: user.id,
        nombre_completo: nombre.trim(),
        cargo: cargo.trim()
      })
      await refreshUser()
      toast.success('Datos actualizados correctamente')
      setEditando(false)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setGuardandoDatos(false)
    }
  }

  const handleCancelarEdicion = () => {
    setNombre(user.nombre_completo)
    setCargo(user.cargo || '')
    setEditando(false)
  }

  const handleCambiarPassword = async (e: FormEvent) => {
    e.preventDefault()
    setErrorPwd(null)

    if (!pwdActual) {
      setErrorPwd('Debes ingresar tu contraseña actual')
      return
    }
    if (!passwordValida) {
      setErrorPwd('La nueva contraseña no cumple los requisitos')
      return
    }
    if (!coinciden) {
      setErrorPwd('Las contraseñas no coinciden')
      return
    }
    if (pwdActual === pwdNueva) {
      setErrorPwd('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setCambiandoPwd(true)
    try {
      await cambiarPwdMutation.mutateAsync({
        email: user.email,
        passwordActual: pwdActual,
        passwordNueva: pwdNueva,
        usuarioId: user.id
      })

      toast.success('Contraseña cambiada correctamente')
      setMostrarCambioPwd(false)
      setPwdActual('')
      setPwdNueva('')
      setPwdConfirmar('')
    } catch (e: any) {
      setErrorPwd(e.message)
    } finally {
      setCambiandoPwd(false)
    }
  }

  const RequisitoItem = ({
    cumplido,
    texto
  }: {
    cumplido: boolean
    texto: string
  }) => (
    <li className="flex items-center gap-2 text-xs">
      {cumplido ? (
        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
      )}
      <span className={cumplido ? 'text-green-700' : 'text-neutral-500'}>
        {texto}
      </span>
    </li>
  )

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca'
    return new Date(fecha).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Layout titulo="Mi Perfil">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <User className="w-6 h-6 text-primary-700" />
            Mi Perfil
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Administra tu información personal y tu contraseña
          </p>
        </div>

        {/* Tarjeta principal del perfil */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center flex-shrink-0 text-white text-3xl font-bold shadow-lg">
              {user.nombre_completo.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">
                {user.nombre_completo}
              </h2>
              <p className="text-sm text-neutral-500 mb-3">
                {user.cargo || 'Sin cargo asignado'}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-primary-100 text-primary-800 capitalize">
                  <Shield className="w-3 h-3" />
                  {user.rol?.nombre}
                </span>
                {user.direccion_principal && (
                  <span className="badge bg-secondary-100 text-secondary-800">
                    <Building2 className="w-3 h-3" />
                    {user.direccion_principal.codigo}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Datos del usuario */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
            <SeccionTitulo>Datos Personales</SeccionTitulo>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-sm text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>
            )}
          </div>

          <form onSubmit={handleGuardarDatos}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={!editando}
                    className={`input-field pl-10 ${
                      !editando ? 'bg-neutral-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Cargo</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    disabled={!editando}
                    placeholder="Sin cargo"
                    className={`input-field pl-10 ${
                      !editando ? 'bg-neutral-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-field pl-10 bg-neutral-100 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  El correo no se puede modificar
                </p>
              </div>

              <div>
                <label className="label-field">Rol</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={user.rol?.nombre || '-'}
                    disabled
                    className="input-field pl-10 bg-neutral-100 cursor-not-allowed capitalize"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  El rol solo lo puede cambiar el Alcalde o la Secretaria
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="label-field">Dirección</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={
                      user.direccion_principal
                        ? `${user.direccion_principal.codigo} - ${user.direccion_principal.nombre}`
                        : 'Sin asignar'
                    }
                    disabled
                    className="input-field pl-10 bg-neutral-100 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  La dirección solo la puede cambiar el Alcalde o la Secretaria
                </p>
              </div>
            </div>

            {editando && (
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleCancelarEdicion}
                  disabled={guardandoDatos}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoDatos}
                  className="btn-primary"
                >
                  {guardandoDatos ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Último acceso */}
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">
                Último acceso
              </p>
              <p className="text-sm font-medium text-neutral-800">
                {formatFecha(user.ultimo_acceso)}
              </p>
            </div>
          </div>
        </div>

        {/* Cambio de contraseña */}
        <div className="card p-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
            <SeccionTitulo icono={KeyRound}>Seguridad</SeccionTitulo>
            {!mostrarCambioPwd && (
              <button
                onClick={() => setMostrarCambioPwd(true)}
                className="text-sm text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Cambiar contraseña
              </button>
            )}
          </div>

          {!mostrarCambioPwd ? (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-neutral-600">
                Tu contraseña está protegida. Si sospechas que alguien más la
                conoce, cámbiala ahora.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              {errorPwd && (
                <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-accent-700">{errorPwd}</p>
                </div>
              )}

              <div>
                <label className="label-field">Contraseña actual *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showActual ? 'text' : 'password'}
                    value={pwdActual}
                    onChange={(e) => setPwdActual(e.target.value)}
                    placeholder="Tu contraseña actual"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowActual(!showActual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showActual ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">Nueva contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showNueva ? 'text' : 'password'}
                    value={pwdNueva}
                    onChange={(e) => setPwdNueva(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNueva(!showNueva)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showNueva ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">Confirmar nueva contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showConfirmar ? 'text' : 'password'}
                    value={pwdConfirmar}
                    onChange={(e) => setPwdConfirmar(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmar(!showConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmar ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {pwdConfirmar.length > 0 && !coinciden && (
                  <p className="text-xs text-accent-600 mt-1">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                  Requisitos:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <RequisitoItem
                    cumplido={requisitos.longitud}
                    texto="Al menos 8 caracteres"
                  />
                  <RequisitoItem
                    cumplido={requisitos.mayuscula}
                    texto="1 letra mayúscula"
                  />
                  <RequisitoItem
                    cumplido={requisitos.minuscula}
                    texto="1 letra minúscula"
                  />
                  <RequisitoItem
                    cumplido={requisitos.numero}
                    texto="1 número"
                  />
                  <RequisitoItem
                    cumplido={requisitos.especial}
                    texto="1 carácter especial"
                  />
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarCambioPwd(false)
                    setPwdActual('')
                    setPwdNueva('')
                    setPwdConfirmar('')
                    setErrorPwd(null)
                  }}
                  disabled={cambiandoPwd}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cambiandoPwd || !passwordValida || !coinciden}
                  className="btn-primary disabled:opacity-50"
                >
                  {cambiandoPwd ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Cambiar contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}