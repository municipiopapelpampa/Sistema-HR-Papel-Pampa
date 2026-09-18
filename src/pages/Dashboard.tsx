import { useAuth } from '../hooks/useAuth'
import Layout from '../components/layout/Layout'
import TarjetaEstadistica from '../components/dashboard/TarjetaEstadistica'
import GraficoEstados from '../components/dashboard/GraficoEstados'
import ListaHRRecientes from '../components/dashboard/ListaHRRecientes'
import {
  useEstadisticas,
  useConteoEstados,
  useHRRecientes
} from '../hooks/useEstadisticas'
import { Clock, Send, CheckCircle2, FileText } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading: loadingStats } = useEstadisticas(user)
  const { data: estados, isLoading: loadingEstados } = useConteoEstados(user)
  const { data: recientes, isLoading: loadingRecientes } = useHRRecientes(
    user,
    5
  )

  if (!user) return null

  const esAdmin = user.rol?.puede_admin === true
  const alcance = esAdmin ? 'todo el municipio' : 'tu dirección'

  const hora = new Date().getHours()
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const primerNombre = user.nombre_completo.split(' ')[0]

  return (
    <Layout titulo="Inicio">
      <div className="max-w-7xl mx-auto">
        {/* Bienvenida */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-1 tracking-tight">
            {saludo}, {primerNombre} 👋
          </h1>
          <p className="text-sm text-neutral-500">
            Bienvenido al Sistema de Hoja de Ruta — Mostrando información de{' '}
            <strong>{alcance}</strong>
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <TarjetaEstadistica
            titulo="Pendientes"
            valor={loadingStats ? 0 : stats?.pendientes || 0}
            subtitulo="Esperan tu confirmación"
            icono={Clock}
            color="amber"
            to="/hojas-ruta?estado=PENDIENTE_CONFIRMACION"
          />
          <TarjetaEstadistica
            titulo="En tu poder"
            valor={loadingStats ? 0 : stats?.enMiPoder || 0}
            subtitulo="Confirmadas por ti"
            icono={FileText}
            color="blue"
          />
          <TarjetaEstadistica
            titulo="Derivadas"
            valor={loadingStats ? 0 : stats?.derivadasPorMi || 0}
            subtitulo="Enviadas a otras áreas"
            icono={Send}
            color="purple"
          />
          <TarjetaEstadistica
            titulo="Concluidas"
            valor={loadingStats ? 0 : stats?.concluidas || 0}
            subtitulo="Trámites finalizados"
            icono={CheckCircle2}
            color="green"
          />
        </div>

        {/* Gráfico + Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoEstados datos={estados || []} isLoading={loadingEstados} />
          <ListaHRRecientes
            datos={recientes || []}
            isLoading={loadingRecientes}
          />
        </div>

        {/* Aviso inferior */}
        <div className="card mt-6 p-4 bg-primary-50 border-primary-200">
          <p className="text-center text-sm text-primary-800">
            Los contadores se actualizan automáticamente cada 60 segundos
          </p>
        </div>
      </div>
    </Layout>
  )
}