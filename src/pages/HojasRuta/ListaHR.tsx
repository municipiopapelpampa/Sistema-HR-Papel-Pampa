import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Header from '../../components/layout/Header'
import { useHojasRuta } from '../../hooks/useHojasRuta'
import { useDirecciones } from '../../hooks/useDirecciones'
import type { EstadoHR } from '../../types'

const ESTADOS: { value: string; label: string; color: string }[] = [
  { value: '', label: 'Todos', color: 'bg-gray-100 text-gray-700' },
  { value: 'PENDIENTE_CONFIRMACION', label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
  { value: 'CONFIRMADA', label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  { value: 'OBSERVADA', label: 'Observada', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DERIVADA', label: 'Derivada', color: 'bg-purple-100 text-purple-800' },
  { value: 'RECHAZADA', label: 'Rechazada', color: 'bg-red-100 text-red-800' },
  { value: 'CONCLUIDA', label: 'Concluida', color: 'bg-green-100 text-green-800' }
]

export default function ListaHR() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [direccionId, setDireccionId] = useState('')

  const { data: hojas = [], isLoading } = useHojasRuta({
    estado: estado || undefined,
    direccionId: direccionId || undefined,
    busqueda: busqueda || undefined
  })
  const { data: direcciones = [] } = useDirecciones()

  const getEstadoBadge = (est: EstadoHR) => {
    const found = ESTADOS.find((e) => e.value === est)
    return found || { label: est, color: 'bg-gray-100 text-gray-700' }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Hojas de Ruta
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {hojas.length} {hojas.length === 1 ? 'hoja registrada' : 'hojas registradas'}
            </p>
          </div>
          <Link to="/hojas-ruta/nueva" className="btn-primary flex items-center gap-2 w-fit">
            <Plus className="w-4 h-4" />
            Nueva Hoja de Ruta
          </Link>
        </div>

        {/* Filtros */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="N° correlativo, remitente o descripción..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label-field">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="input-field"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-500">Cargando hojas de ruta...</p>
          </div>
        ) : hojas.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">
              No hay hojas de ruta
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {busqueda || estado
                ? 'No se encontraron resultados con los filtros aplicados'
                : 'Aún no se han creado hojas de ruta'}
            </p>
            <Link to="/hojas-ruta/nueva" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear la primera
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {hojas.map((hr) => {
              const badge = getEstadoBadge(hr.estado)
              return (
                <Link
                  key={hr.id}
                  to={`/hojas-ruta/${hr.id}`}
                  className="card hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono font-bold text-primary">
                          {hr.numero_unico}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        {hr.tipo_urgente && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Urgente
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 truncate">
                        {hr.descripcion_contenido.substring(0, 100)}
                        {hr.descripcion_contenido.length > 100 ? '...' : ''}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                        <span>
                          <strong>De:</strong> {hr.remitente_nombre}
                        </span>
                        {hr.destinatario_direccion && (
                          <span>
                            <strong>Para:</strong> {hr.destinatario_direccion.codigo}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatFecha(hr.fecha_recepcion)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      {hr.estado === 'CONCLUIDA' && (
                        <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto" />
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}