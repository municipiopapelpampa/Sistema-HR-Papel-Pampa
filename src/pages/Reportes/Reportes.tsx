import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Header from '../../components/layout/Header'
import ModalGenerarReporte from '../../components/reportes/ModalGenerarReporte'
import type { TipoReporte } from '../../services/reportes'
import {
  FileText,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight
} from 'lucide-react'

interface ReporteConfig {
  tipo: TipoReporte
  titulo: string
  descripcion: string
  icono: any
  color: string
  bg: string
}

const REPORTES: ReporteConfig[] = [
  {
    tipo: 'POR_DIRECCION',
    titulo: 'HR por Dirección',
    descripcion:
      'Listado de hojas de ruta por dirección en un rango de fechas',
    icono: FileText,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    tipo: 'POR_ESTADO',
    titulo: 'HR por Estado',
    descripcion: 'Cantidad de hojas de ruta en cada estado actual',
    icono: BarChart3,
    color: 'text-secondary',
    bg: 'bg-secondary/10'
  },
  {
    tipo: 'CONCLUIDAS',
    titulo: 'HR Concluidas',
    descripcion: 'Listado de hojas de ruta finalizadas en un rango de fechas',
    icono: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    tipo: 'PENDIENTES',
    titulo: 'HR Pendientes',
    descripcion:
      'Hojas de ruta sin concluir hace más de X días (alerta)',
    icono: AlertCircle,
    color: 'text-accent',
    bg: 'bg-accent/10'
  }
]

export default function Reportes() {
  const { user } = useAuth()
  const [modalAbierto, setModalAbierto] = useState<ReporteConfig | null>(null)

  if (!user) return null

  // Solo Alcalde, Secretaria y Directores
  if (!user.rol?.puede_concluir) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Sin permisos</p>
            <p className="text-sm text-gray-500 mt-1">
              Solo el Alcalde, la Secretaria y los Directores pueden generar
              reportes
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Reportes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Genera reportes en PDF para análisis y seguimiento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORTES.map((r) => {
            const Icono = r.icono
            return (
              <button
                key={r.tipo}
                onClick={() => setModalAbierto(r)}
                className="card hover:shadow-md transition-all text-left group border-l-4 border-l-transparent hover:border-l-primary"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${r.bg}`}
                  >
                    <Icono className={`w-6 h-6 ${r.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                      {r.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {r.descripcion}
                    </p>
                    <span className="text-sm text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Generar reporte
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {/* Modal de generación */}
      {modalAbierto && (
        <ModalGenerarReporte
          tipo={modalAbierto.tipo}
          titulo={modalAbierto.titulo}
          onClose={() => setModalAbierto(null)}
        />
      )}
    </div>
  )
}