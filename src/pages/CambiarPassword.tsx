import { useState, FormEvent, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  LogOut
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

// ============================================
// VALIDACIONES DE CONTRASEÑA
// ============================================
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

export default function CambiarPassword() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')

  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requisitos = useMemo(() => validarPassword(passwordNueva), [passwordNueva])
  const passwordValida = todosCumplidos(requisitos)
  const coinciden = passwordNueva === passwordConfirmar && passwordConfirmar.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordActual) {
      setError('Debes ingresar tu contraseña actual')
      return
    }
    if (!passwordValida) {
      setError('La nueva contraseña no cumple los requisitos')
      return
    }
    if (!coinciden) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (passwordActual === passwordNueva) {
      setError('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setEnviando(true)
    try {
      // 1. Verificar contraseña actual re-autenticando
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordActual
      })

      if (signInError) {
        setError('La contraseña actual es incorrecta')
        setEnviando(false)
        return
      }

      // 2. Actualizar la contraseña en Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordNueva
      })

      if (updateError) {
        setError('Error al cambiar contraseña: ' + updateError.message)
        setEnviando(false)
        return
      }

      // 3. Marcar debe_cambiar_password = false en el perfil
      const { error: profileError } = await supabase
        .from('usuarios')
        .update({ debe_cambiar_password: false })
        .eq('id', user?.id)

      if (profileError) {
        console.error('Error al actualizar perfil:', profileError)
      }

      // 4. Mostrar pantalla de éxito
      setExito(true)

      // 5. Cerrar sesión automáticamente y redirigir al login tras 3 segundos
      setTimeout(async () => {
        await signOut()
        toast.success('Inicia sesión con tu nueva contraseña')
        navigate('/login', { replace: true })
      }, 2500)
    } catch (e: any) {
      setError(e.message || 'Error inesperado')
      setEnviando(false)
    }
  }

  const handleSalir = async () => {
    await signOut()
    navigate('/login')
  }

  const RequisitoItem = ({
    cumplido,
    texto
  }: {
    cumplido: boolean
    texto: string
  }) => (
    <li className="flex items-center gap-2 text-sm">
      {cumplido ? (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={cumplido ? 'text-green-700' : 'text-gray-500'}>
        {texto}
      </span>
    </li>
  )

  // ============================================
  // PANTALLA DE ÉXITO
  // ============================================
  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-secondary flex flex-col">
        <header className="text-center pt-8 px-4">
          <div className="flex items-center justify-center gap-6 mb-4">
            <img
              src="/escudo.png"
              alt="Escudo"
              className="h-16 w-16 object-contain drop-shadow-lg"
            />
            <div className="text-white">
              <h1 className="font-serif font-bold text-base md:text-lg tracking-wide">
                GOBIERNO AUTÓNOMO MUNICIPAL
              </h1>
              <h2 className="font-serif font-bold text-xl md:text-2xl text-accent-light tracking-wider">
                PAPEL PAMPA
              </h2>
            </div>
            <img
              src="/logo-circular.png"
              alt="Logo Papel Pampa"
              className="h-16 w-16 object-contain drop-shadow-lg"
            />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                ¡Contraseña cambiada!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Tu contraseña se actualizó correctamente.
                <br />
                Redirigiendo al inicio de sesión...
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Redirigiendo...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ============================================
  // PANTALLA DE CAMBIO
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-secondary flex flex-col">
      <header className="text-center pt-8 px-4">
        <div className="flex items-center justify-center gap-6 mb-4">
          <img
            src="/escudo.png"
            alt="Escudo"
            className="h-16 w-16 object-contain drop-shadow-lg"
          />
          <div className="text-white">
            <h1 className="font-serif font-bold text-base md:text-lg tracking-wide">
              GOBIERNO AUTÓNOMO MUNICIPAL
            </h1>
            <h2 className="font-serif font-bold text-xl md:text-2xl text-accent-light tracking-wider">
              PAPEL PAMPA
            </h2>
          </div>
          <img
            src="/logo-circular.png"
            alt="Logo Papel Pampa"
            className="h-16 w-16 object-contain drop-shadow-lg"
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent to-accent-dark px-6 py-5 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Cambio de contraseña</h2>
                  <p className="text-sm text-white/80">
                    Por seguridad, debes cambiar tu contraseña antes de continuar
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Es tu <strong>primer ingreso</strong> al sistema. Cambia la
                  contraseña temporal por una personal y segura.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="label-field">Contraseña actual *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showActual ? 'text' : 'password'}
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    placeholder="Tu contraseña temporal"
                    className="input-field pl-10 pr-10"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowActual(!showActual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showActual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">Nueva contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNueva ? 'text' : 'password'}
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNueva(!showNueva)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNueva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">Confirmar nueva contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmar ? 'text' : 'password'}
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmar(!showConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordConfirmar.length > 0 && !coinciden && (
                  <p className="text-xs text-red-500 mt-1">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase">
                  Requisitos de la contraseña:
                </p>
                <ul className="space-y-1">
                  <RequisitoItem
                    cumplido={requisitos.longitud}
                    texto="Al menos 8 caracteres"
                  />
                  <RequisitoItem
                    cumplido={requisitos.mayuscula}
                    texto="Al menos 1 letra mayúscula"
                  />
                  <RequisitoItem
                    cumplido={requisitos.minuscula}
                    texto="Al menos 1 letra minúscula"
                  />
                  <RequisitoItem
                    cumplido={requisitos.numero}
                    texto="Al menos 1 número"
                  />
                  <RequisitoItem
                    cumplido={requisitos.especial}
                    texto="Al menos 1 carácter especial (!@#$...)"
                  />
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSalir}
                  disabled={enviando}
                  className="btn-outline flex-1 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
                <button
                  type="submit"
                  disabled={enviando || !passwordValida || !coinciden}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Cambiar contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-white/70 mt-4">
            Sistema HR - Municipio de Papel Pampa
          </p>
        </div>
      </main>
    </div>
  )
}