import { Text, View } from '@react-pdf/renderer'
import { ReporteBase, commonStyles, COLORS } from './PDFReporteBase'

interface Props {
  datos: { estado: string; total: number }[]
  filtros: { label: string; valor: string }[]
  usuarioGenerador: string
  nombreUsuario: string
}

export default function PDFReporteEstado({
  datos,
  filtros,
  usuarioGenerador,
  nombreUsuario
}: Props) {
  const totalGeneral = datos.reduce((sum, d) => sum + d.total, 0)

  const estadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      CREADA: 'Creada',
      ENVIADA: 'Enviada',
      PENDIENTE_CONFIRMACION: 'Pendiente de confirmación',
      CONFIRMADA: 'Confirmada',
      OBSERVADA: 'Observada',
      RECHAZADA: 'Rechazada',
      DERIVADA: 'Derivada',
      CONCLUIDA: 'Concluida'
    }
    return labels[estado] || estado
  }

  const porcentaje = (total: number) =>
    totalGeneral > 0 ? ((total / totalGeneral) * 100).toFixed(1) : '0.0'

  return (
    <ReporteBase
      titulo="REPORTE DE HOJAS DE RUTA POR ESTADO"
      subtitulo={`Total general: ${totalGeneral} hoja(s) de ruta`}
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
        <>
          {/* Resumen */}
          <View style={commonStyles.resumenBox}>
            <Text style={commonStyles.resumenTexto}>
              Total de hojas de ruta: {totalGeneral}
            </Text>
          </View>

          {/* Tabla */}
          <View style={commonStyles.tabla}>
            <View style={commonStyles.tablaHeader}>
              <Text style={[commonStyles.tablaHeaderCell, { width: '50%' }]}>
                Estado
              </Text>
              <Text
                style={[
                  commonStyles.tablaHeaderCell,
                  { width: '25%', textAlign: 'center' }
                ]}
              >
                Cantidad
              </Text>
              <Text
                style={[
                  commonStyles.tablaHeaderCell,
                  { width: '25%', textAlign: 'center' }
                ]}
              >
                Porcentaje
              </Text>
            </View>

            {datos.map((d, i) => (
              <View
                key={d.estado}
                style={i % 2 === 0 ? commonStyles.tablaRow : commonStyles.tablaRowAlt}
                wrap={false}
              >
                <Text style={[commonStyles.tablaCell, { width: '50%' }]}>
                  {estadoLabel(d.estado)}
                </Text>
                <Text
                  style={[
                    commonStyles.tablaCell,
                    { width: '25%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }
                  ]}
                >
                  {d.total}
                </Text>
                <Text
                  style={[commonStyles.tablaCell, { width: '25%', textAlign: 'center' }]}
                >
                  {porcentaje(d.total)}%
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ReporteBase>
  )
}