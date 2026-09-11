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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary-dark to-secondary">
      {/* Encabezado institucional */}
      <header className="text-center pt-8 px-4">
        <div className="flex items-center justify-center gap-6 mb-4">
          <img
            src="/escudo.png"
            alt="Escudo"
            className="h-20 w-20 object-contain drop-shadow-lg"
          />
          <div className="text-white">
            <h1 className="font-serif font-bold text-lg md:text-xl tracking-wide">
              GOBIERNO AUTÓNOMO MUNICIPAL
            </h1>
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-accent-light tracking-wider">
              PAPEL PAMPA
            </h2>
            <p className="text-xs md:text-sm text-white/80 mt-1">
              SEGUNDA SECCIÓN - PROVINCIA GUALBERTO VILLARROEL
            </p>
            <p className="text-xs md:text-sm text-white/80">
              LA PAZ - BOLIVIA
            </p>
          </div>
          <img
            src="/logo-circular.png"
            alt="Logo Papel Pampa"
            className="h-20 w-20 object-contain drop-shadow-lg"
          />
        </div>
        <div className="text-white">
          <h3 className="font-serif font-bold text-3xl md:text-4xl text-accent-light tracking-widest">
            HOJA DE RUTA
          </h3>
          <p className="text-sm md:text-base tracking-wider text-white/90">
            CONTROL DE TRÁMITES MUNICIPALES
          </p>
        </div>
      </header>

      {/* Formulario de login */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field" htmlFor="email">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                {cargando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

          <p className="text-center text-xs text-white/70 mt-6">
            Sistema de Hoja de Ruta © {new Date().getFullYear()} - Municipio de Papel Pampa
          </p>
        </div>
      </main>
    </div>
  )
}