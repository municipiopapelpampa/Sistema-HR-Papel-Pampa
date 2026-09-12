import { Text, View } from '@react-pdf/renderer'
import { ReporteBase, commonStyles } from './PDFReporteBase'
import type { HRReporte } from '../../services/reportes'

interface Props {
  datos: HRReporte[]
  filtros: { label: string; valor: string }[]
  usuarioGenerador: string
  nombreUsuario: string
}

export default function PDFReporteDireccion({
  datos,
  filtros,
  usuarioGenerador,
  nombreUsuario
}: Props) {
  const formatoFecha = (fecha: string | null) => {
    if (!fecha) return '-'
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const estadoLabel = (estado: string) => estado.replace(/_/g, ' ')

  return (
    <ReporteBase
      titulo="REPORTE DE HOJAS DE RUTA POR DIRECCIÓN"
      subtitulo={`Total: ${datos.length} hoja(s) de ruta`}
      filtros={filtros}
      usuarioGenerador={usuarioGenerador}
      nombreUsuario={nombreUsuario}
    >
      {datos.length === 0 ? (
        <View style={{ padding: 20, textAlign: 'center' }}>
          <Text style={{ fontSize: 10, color: '#666' }}>
            No se encontraron hojas de ruta con los filtros aplicados.
          </Text>
        </View>
      ) : (
        <View style={commonStyles.tabla}>
          {/* Header de la tabla */}
          <View style={commonStyles.tablaHeader}>
            <Text style={[commonStyles.tablaHeaderCell, { width: '15%' }]}>
              N° HR
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '12%' }]}>
              Fecha
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '20%' }]}>
              Remitente
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '13%' }]}>
              Destino
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '13%' }]}>
              Actual en
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '12%' }]}>
              Estado
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '15%' }]}>
              Asunto
            </Text>
          </View>

          {/* Filas */}
          {datos.map((hr, i) => (
            <View
              key={hr.id}
              style={i % 2 === 0 ? commonStyles.tablaRow : commonStyles.tablaRowAlt}
              wrap={false}
            >
              <Text style={[commonStyles.tablaCell, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>
                {hr.numero_unico}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '12%' }]}>
                {formatoFecha(hr.fecha_recepcion)}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '20%' }]}>
                {hr.remitente_nombre}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '13%' }]}>
                {hr.destinatario_direccion?.codigo || '-'}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '13%' }]}>
                {hr.direccion_actual?.codigo || '-'}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '12%' }]}>
                {estadoLabel(hr.estado)}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '15%' }]}>
                {hr.descripcion_contenido.substring(0, 40)}
                {hr.descripcion_contenido.length > 40 ? '...' : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ReporteBase>
  )
}