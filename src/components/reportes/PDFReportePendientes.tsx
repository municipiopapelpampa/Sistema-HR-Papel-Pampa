import { Text, View } from '@react-pdf/renderer'
import { ReporteBase, commonStyles } from './PDFReporteBase'
import { diasTranscurridos, type HRReporte } from '../../services/reportes'

interface Props {
  datos: HRReporte[]
  filtros: { label: string; valor: string }[]
  usuarioGenerador: string
  nombreUsuario: string
  diasMinimo: number
}

export default function PDFReportePendientes({
  datos,
  filtros,
  usuarioGenerador,
  nombreUsuario,
  diasMinimo
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
      titulo="REPORTE DE HOJAS DE RUTA PENDIENTES"
      subtitulo={`Hojas de ruta sin concluir hace ${diasMinimo} días o más`}
      filtros={filtros}
      usuarioGenerador={usuarioGenerador}
      nombreUsuario={nombreUsuario}
    >
      {datos.length === 0 ? (
        <View style={{ padding: 20, textAlign: 'center' }}>
          <Text style={{ fontSize: 10, color: '#666' }}>
            No hay hojas de ruta pendientes hace {diasMinimo} días o más. ¡Todo
            al día!
          </Text>
        </View>
      ) : (
        <>
          {/* Alerta */}
          <View
            style={{
              padding: 8,
              backgroundColor: '#FEF2F2',
              borderLeftWidth: 3,
              borderLeftColor: '#C0392B',
              marginBottom: 12
            }}
          >
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#C0392B' }}>
              ⚠ {datos.length} hoja(s) de ruta llevan {diasMinimo}+ días sin concluirse
            </Text>
          </View>

          <View style={commonStyles.tabla}>
            <View style={commonStyles.tablaHeader}>
              <Text style={[commonStyles.tablaHeaderCell, { width: '15%' }]}>
                N° HR
              </Text>
              <Text style={[commonStyles.tablaHeaderCell, { width: '12%' }]}>
                Fecha
              </Text>
              <Text
                style={[
                  commonStyles.tablaHeaderCell,
                  { width: '10%', textAlign: 'center' }
                ]}
              >
                Días
              </Text>
              <Text style={[commonStyles.tablaHeaderCell, { width: '18%' }]}>
                Remitente
              </Text>
              <Text style={[commonStyles.tablaHeaderCell, { width: '13%' }]}>
                Actual en
              </Text>
              <Text style={[commonStyles.tablaHeaderCell, { width: '12%' }]}>
                Estado
              </Text>
              <Text style={[commonStyles.tablaHeaderCell, { width: '20%' }]}>
                Asunto
              </Text>
            </View>

            {datos.map((hr, i) => {
              const dias = diasTranscurridos(hr.fecha_recepcion)
              return (
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
                  <Text
                    style={[
                      commonStyles.tablaCell,
                      {
                        width: '10%',
                        textAlign: 'center',
                        fontFamily: 'Helvetica-Bold',
                        color: dias > 15 ? '#C0392B' : '#000'
                      }
                    ]}
                  >
                    {dias}
                  </Text>
                  <Text style={[commonStyles.tablaCell, { width: '18%' }]}>
                    {hr.remitente_nombre}
                  </Text>
                  <Text style={[commonStyles.tablaCell, { width: '13%' }]}>
                    {hr.direccion_actual?.codigo || '-'}
                  </Text>
                  <Text style={[commonStyles.tablaCell, { width: '12%' }]}>
                    {estadoLabel(hr.estado)}
                  </Text>
                  <Text style={[commonStyles.tablaCell, { width: '20%' }]}>
                    {hr.descripcion_contenido.substring(0, 40)}
                    {hr.descripcion_contenido.length > 40 ? '...' : ''}
                  </Text>
                </View>
              )
            })}
          </View>
        </>
      )}
    </ReporteBase>
  )
}