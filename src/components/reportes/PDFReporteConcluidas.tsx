import { Text, View } from '@react-pdf/renderer'
import { ReporteBase, commonStyles } from './PDFReporteBase'
import type { HRReporte } from '../../services/reportes'

interface Props {
  datos: HRReporte[]
  filtros: { label: string; valor: string }[]
  usuarioGenerador: string
  nombreUsuario: string
}

export default function PDFReporteConcluidas({
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

  return (
    <ReporteBase
      titulo="REPORTE DE HOJAS DE RUTA CONCLUIDAS"
      subtitulo={`Total: ${datos.length} hoja(s) de ruta concluida(s)`}
      filtros={filtros}
      usuarioGenerador={usuarioGenerador}
      nombreUsuario={nombreUsuario}
    >
      {datos.length === 0 ? (
        <View style={{ padding: 20, textAlign: 'center' }}>
          <Text style={{ fontSize: 10, color: '#666' }}>
            No se encontraron hojas de ruta concluidas con los filtros aplicados.
          </Text>
        </View>
      ) : (
        <View style={commonStyles.tabla}>
          <View style={commonStyles.tablaHeader}>
            <Text style={[commonStyles.tablaHeaderCell, { width: '15%' }]}>
              N° HR
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '12%' }]}>
              Creada
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '12%' }]}>
              Concluida
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '20%' }]}>
              Remitente
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '13%' }]}>
              Dir. Final
            </Text>
            <Text style={[commonStyles.tablaHeaderCell, { width: '28%' }]}>
              Asunto
            </Text>
          </View>

          {datos.map((hr, i) => (
            <View
              key={hr.id}
              style={i % 2 === 0 ? commonStyles.tablaRow : commonStyles.tablaRowAlt}
              wrap={false}
            >
              <Text
                style={[
                  commonStyles.tablaCell,
                  { width: '15%', fontFamily: 'Helvetica-Bold' }
                ]}
              >
                {hr.numero_unico}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '12%' }]}>
                {formatoFecha(hr.fecha_recepcion)}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '12%' }]}>
                {hr.fecha_conclusion
                  ? new Date(hr.fecha_conclusion).toLocaleDateString('es-BO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : '-'}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '20%' }]}>
                {hr.remitente_nombre}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '13%' }]}>
                {hr.direccion_actual?.codigo || '-'}
              </Text>
              <Text style={[commonStyles.tablaCell, { width: '28%' }]}>
                {hr.descripcion_contenido.substring(0, 60)}
                {hr.descripcion_contenido.length > 60 ? '...' : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ReporteBase>
  )
}