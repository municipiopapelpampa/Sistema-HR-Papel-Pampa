import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Layout from '../../components/layout/Layout'
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
    color: 'text-primary-700',
    bg: 'bg-primary-50'
  },
  {
    tipo: 'POR_ESTADO',
    titulo: 'HR por Estado',
    descripcion: 'Cantidad de hojas de ruta en cada estado actual',
    icono: BarChart3,
    color: 'text-secondary-700',
    bg: 'bg-secondary-50'
  },
  {
    tipo: 'CONCLUIDAS',
    titulo: 'HR Concluidas',
    descripcion: 'Listado de hojas de ruta finalizadas en un rango de fechas',
    icono: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    tipo: 'PENDIENTES',
    titulo: 'HR Pendientes',
    descripcion: 'Hojas de ruta sin concluir hace más de X días (alerta)',
    icono: AlertCircle,
    color: 'text-accent-600',
    bg: 'bg-accent-50'
  }
]

export default function Reportes() {
  const { user } = useAuth()
  const [modalAbierto, setModalAbierto] = useState<ReporteConfig | null>(null)

  if (!user) return null

  if (!user.rol?.puede_concluir) {
    return (
      <Layout titulo="Reportes">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-accent-500 mx-auto mb-3" />
            <p className="text-neutral-700 font-medium">Sin permisos</p>
            <p className="text-sm text-neutral-500 mt-1">
              Solo el Alcalde, la Secretaria y los Directores pueden generar
              reportes
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout titulo="Reportes">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-700" />
            Reportes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Genera reportes en PDF para análisis y seguimiento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {REPORTES.map((r) => {
            const Icono = r.icono
            return (
              <button
                key={r.tipo}
                onClick={() => setModalAbierto(r)}
                className="card card-hover p-6 text-left group border-l-4 border-l-transparent hover:border-l-primary-600"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${r.bg}`}
                  >
                    <Icono className={`w-6 h-6 ${r.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-neutral-900 mb-1">
                      {r.titulo}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-3">
                      {r.descripcion}
                    </p>
                    <span className="text-sm text-primary-700 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Generar reporte
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {modalAbierto && (
        <ModalGenerarReporte
          tipo={modalAbierto.tipo}
          titulo={modalAbierto.titulo}
          onClose={() => setModalAbierto(null)}
        />
      )}
    </Layout>
  )
}