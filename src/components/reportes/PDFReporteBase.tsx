import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer'
import { ReactNode } from 'react'

// ============================================
// COLORES OFICIALES
// ============================================
export const COLORS = {
  primary: '#1F5C4A',
  primaryLight: '#4A8B7A',
  secondary: '#2C5F8A',
  accent: '#C0392B',
  text: '#000000',
  gray: '#666666',
  grayLight: '#F5F5F5',
  border: '#2E7D6B'
}

export const commonStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.text
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain'
  },
  headerTitulo1: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.5
  },
  headerTitulo2: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: COLORS.accent,
    letterSpacing: 1,
    marginTop: 2
  },
  headerSubtitulo: {
    fontSize: 7,
    textAlign: 'center',
    marginTop: 2,
    color: COLORS.gray
  },
  tituloReporte: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
    color: COLORS.primary
  },
  subtituloReporte: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 12,
    color: COLORS.gray
  },
  filtrosBox: {
    backgroundColor: COLORS.grayLight,
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary
  },
  filtrosTitulo: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: COLORS.primary
  },
  filtroItem: {
    fontSize: 8,
    marginBottom: 2
  },
  tabla: {
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    color: 'white'
  },
  tablaHeaderCell: {
    padding: 5,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    borderRightWidth: 1,
    borderRightColor: COLORS.border
  },
  tablaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tablaRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FAFAFA'
  },
  tablaCell: {
    padding: 4,
    fontSize: 7.5,
    borderRightWidth: 1,
    borderRightColor: COLORS.border
  },
  resumenBox: {
    padding: 8,
    backgroundColor: COLORS.primary,
    color: 'white',
    marginBottom: 12,
    borderRadius: 4
  },
  resumenTexto: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textAlign: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.gray
  }
})

// ============================================
// COMPONENTE ENCABEZADO
// ============================================
export function EncabezadoReporte({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <>
      <View style={commonStyles.header}>
        <Image src="/escudo.png" style={commonStyles.logo} />
        <View style={commonStyles.headerCenter}>
          <Text style={commonStyles.headerTitulo1}>
            GOBIERNO AUTÓNOMO MUNICIPAL
          </Text>
          <Text style={commonStyles.headerTitulo2}>PAPEL PAMPA</Text>
          <Text style={commonStyles.headerSubtitulo}>
            SEGUNDA SECCIÓN - PROVINCIA GUALBERTO VILLARROEL
          </Text>
          <Text style={commonStyles.headerSubtitulo}>LA PAZ - BOLIVIA</Text>
        </View>
        <Image src="/logo-circular.png" style={commonStyles.logo} />
      </View>

      <Text style={commonStyles.tituloReporte}>{titulo}</Text>
      {subtitulo && <Text style={commonStyles.subtituloReporte}>{subtitulo}</Text>}
    </>
  )
}

// ============================================
// COMPONENTE FILTROS
// ============================================
export function FiltrosReporte({ filtros }: { filtros: { label: string; valor: string }[] }) {
  if (filtros.length === 0) return null
  return (
    <View style={commonStyles.filtrosBox}>
      <Text style={commonStyles.filtrosTitulo}>FILTROS APLICADOS:</Text>
      {filtros.map((f, i) => (
        <Text key={i} style={commonStyles.filtroItem}>
          • {f.label}: {f.valor}
        </Text>
      ))}
    </View>
  )
}

// ============================================
// COMPONENTE PIE DE PÁGINA
// ============================================
export function PiePagina({
  usuarioGenerador,
  nombreUsuario
}: {
  usuarioGenerador: string
  nombreUsuario: string
}) {
  const fecha = new Date().toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <View style={commonStyles.footer} fixed>
      <Text>
        Generado por: {nombreUsuario} ({usuarioGenerador})
      </Text>
      <Text>{fecha}</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  )
}

// ============================================
// WRAPPER PRINCIPAL
// ============================================
export interface ReporteBaseProps {
  titulo: string
  subtitulo?: string
  filtros?: { label: string; valor: string }[]
  usuarioGenerador: string
  nombreUsuario: string
  children: ReactNode
}

export function ReporteBase({
  titulo,
  subtitulo,
  filtros = [],
  usuarioGenerador,
  nombreUsuario,
  children
}: ReporteBaseProps) {
  return (
    <Document
      title={titulo}
      author="Gobierno Autónomo Municipal de Papel Pampa"
      subject={subtitulo}
    >
      <Page size="LETTER" style={commonStyles.page}>
        <EncabezadoReporte titulo={titulo} subtitulo={subtitulo} />
        <FiltrosReporte filtros={filtros} />
        {children}
        <PiePagina usuarioGenerador={usuarioGenerador} nombreUsuario={nombreUsuario} />
      </Page>
    </Document>
  )
}