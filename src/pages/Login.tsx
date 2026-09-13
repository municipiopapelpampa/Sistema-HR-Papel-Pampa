import { useState, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    const { error } = await signIn(email.trim().toLowerCase(), password)

    if (error) {
      setError(error)
      toast.error(error)
      setCargando(false)
      return
    }

    toast.success('Bienvenido al Sistema HR')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900">
      {/* Contenido centrado */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logos + Título */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img
                src="/escudo.png"
                alt="Escudo"
                className="h-20 w-20 object-contain drop-shadow-lg"
              />
              <img
                src="/logo-circular.png"
                alt="Logo Papel Pampa"
                className="h-20 w-20 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="font-bold text-2xl text-white tracking-tight">
              Sistema de Hoja de Ruta
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Municipio de Papel Pampa
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-accent-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field" htmlFor="email">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@papelpampa.gob.bo"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label-field" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="btn-primary w-full py-3"
              >
                {cargando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Ingresar
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Pie */}
          <p className="text-center text-xs text-white/60 mt-6">
            Sistema HR © {new Date().getFullYear()} — Municipio de Papel Pampa
          </p>
        </div>
      </main>
    </div>
  )
}