import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  ArrowUpDown,
  Tag,
  RefreshCw
} from 'lucide-react'
import Header from '../../components/layout/Header'
import { useHojasRuta } from '../../hooks/useHojasRuta'
import { useDirecciones } from '../../hooks/useDirecciones'
import type { EstadoHR } from '../../types'

// ============================================
// CONSTANTES
// ============================================
const ESTADOS = [
  { value: '', label: 'Todos los estados', color: 'bg-gray-100 text-gray-700' },
  { value: 'CREADA', label: 'Creada', color: 'bg-gray-100 text-gray-700' },
  { value: 'ENVIADA', label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  {
    value: 'PENDIENTE_CONFIRMACION',
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-800'
  },
  { value: 'CONFIRMADA', label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  { value: 'OBSERVADA', label: 'Observada', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DERIVADA', label: 'Derivada', color: 'bg-purple-100 text-purple-800' },
  { value: 'RECHAZADA', label: 'Rechazada', color: 'bg-red-100 text-red-800' },
  { value: 'CONCLUIDA', label: 'Concluida', color: 'bg-green-100 text-green-800' }
]

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ORIGINAL', label: 'Original' },
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'COPIA', label: 'Copia' },
  { value: 'FAX', label: 'Fax' }
]

const ORDENES = [
  { value: 'RECIENTES', label: 'Más recientes primero' },
  { value: 'ANTIGUAS', label: 'Más antiguas primero' },
  { value: 'NUMERO_ASC', label: 'N° HR ascendente' },
  { value: 'NUMERO_DESC', label: 'N° HR descendente' }
]

const POR_PAGINA = 10

// ============================================
// COMPONENTE
// ============================================
export default function ListaHR() {
  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [direccionId, setDireccionId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [tipo, setTipo] = useState('')
  const [orden, setOrden] = useState('RECIENTES')
  const [pagina, setPagina] = useState(1)

  // UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Hooks
  const { data: direcciones = [] } = useDirecciones()

  const filtros = useMemo(
    () => ({
      busqueda: busqueda.trim() || undefined,
      estado: estado || undefined,
      direccionId: direccionId || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      tipo: (tipo || undefined) as any,
      orden: orden as any,
      pagina,
      porPagina: POR_PAGINA
    }),
    [busqueda, estado, direccionId, fechaDesde, fechaHasta, tipo, orden, pagina]
  )

  const { data, isLoading, isFetching, refetch } = useHojasRuta(filtros)

  const hojas = data?.datos || []
  const total = data?.total || 0
  const totalPaginas = data?.totalPaginas || 0

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPagina(1)
  }, [busqueda, estado, direccionId, fechaDesde, fechaHasta, tipo, orden])

  // Contar filtros activos
  const filtrosActivos = useMemo(() => {
    let count = 0
    if (busqueda.trim()) count++
    if (estado) count++
    if (direccionId) count++
    if (fechaDesde) count++
    if (fechaHasta) count++
    if (tipo) count++
    return count
  }, [busqueda, estado, direccionId, fechaDesde, fechaHasta, tipo])

  const limpiarFiltros = () => {
    setBusqueda('')
    setEstado('')
    setDireccionId('')
    setFechaDesde('')
    setFechaHasta('')
    setTipo('')
    setOrden('RECIENTES')
    setPagina(1)
  }

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

  // Rango de paginación
  const desde = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1
  const hasta = Math.min(pagina * POR_PAGINA, total)

  // Botones de página
  const paginas = useMemo(() => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    }
    const arr: (number | string)[] = []
    if (pagina > 3) arr.push(1)
    if (pagina > 4) arr.push('...')
    const start = Math.max(1, pagina - 2)
    const end = Math.min(totalPaginas, pagina + 2)
    for (let i = start; i <= end; i++) arr.push(i)
    if (pagina < totalPaginas - 3) arr.push('...')
    if (pagina < totalPaginas - 2) arr.push(totalPaginas)
    return arr
  }, [pagina, totalPaginas])

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
              {isLoading ? (
                'Cargando...'
              ) : (
                <>
                  {total}{' '}
                  {total === 1 ? 'hoja registrada' : 'hojas registradas'}
                  {filtrosActivos > 0 && (
                    <span className="ml-2 text-primary">
                      ({filtrosActivos} filtro
                      {filtrosActivos > 1 ? 's' : ''} aplicado
                      {filtrosActivos > 1 ? 's' : ''})
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <Link
            to="/hojas-ruta/nueva"
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Nueva Hoja de Ruta
          </Link>
        </div>

        {/* Panel de filtros */}
        <div className="card mb-6">
          {/* Búsqueda principal + botón filtros */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por N° HR, remitente o asunto..."
                  className="input-field pl-10"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`btn-outline flex items-center gap-2 ${
                  mostrarFiltros ? 'bg-primary/10 border-primary text-primary' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {filtrosActivos > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {filtrosActivos}
                  </span>
                )}
              </button>
              <button
                onClick={() => refetch()}
                className="btn-outline flex items-center gap-2"
                disabled={isFetching}
                title="Actualizar"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filtros expandibles */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Rango de fechas */}
                <div>
                  <label className="label-field flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="label-field flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Estado
                  </label>
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

                {/* Dirección */}
                <div>
                  <label className="label-field flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Dirección actual
                  </label>
                  <select
                    value={direccionId}
                    onChange={(e) => setDireccionId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todas las direcciones</option>
                    {direcciones.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.codigo} - {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className="label-field flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Tipo
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="input-field"
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Orden */}
                <div>
                  <label className="label-field flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Ordenar por
                  </label>
                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    className="input-field"
                  >
                    {ORDENES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón limpiar */}
              {filtrosActivos > 0 && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={limpiarFiltros}
                    className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          )}
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
              {filtrosActivos > 0
                ? 'No se encontraron resultados con los filtros aplicados'
                : 'Aún no se han creado hojas de ruta'}
            </p>
            {filtrosActivos > 0 ? (
              <button onClick={limpiarFiltros} className="btn-outline">
                Limpiar filtros
              </button>
            ) : (
              <Link
                to="/hojas-ruta/nueva"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear la primera
              </Link>
            )}
          </div>
        ) : (
          <>
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
                          {hr.gestion?.estado === 'CERRADA' && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 text-gray-700">
                              Gestión {hr.gestion.anio} cerrada
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
                              <strong>Para:</strong>{' '}
                              {hr.destinatario_direccion.codigo}
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

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Mostrando <strong>{desde}</strong>-<strong>{hasta}</strong> de{' '}
                  <strong>{total}</strong> hojas de ruta
                </p>

                <div className="flex items-center gap-1">
                  {/* Anterior */}
                  <button
                    onClick={() => setPagina(pagina - 1)}
                    disabled={pagina === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Números */}
                  {paginas.map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`dots-${i}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPagina(p)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                          p === pagina
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Siguiente */}
                  <button
                    onClick={() => setPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}