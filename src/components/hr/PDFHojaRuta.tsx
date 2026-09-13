import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer'
import type { HojaRutaConRelaciones, Derivacion } from '../../types'

// ============================================
// ESTILOS OPTIMIZADOS PARA TAMAÑO CARTA
// ============================================
const COLORS = {
  border: '#2E7D6B',
  borderLight: '#6BA89A',
  titleRed: '#C0392B',
  textBlack: '#000000'
}

const styles = StyleSheet.create({
  // Página
  page: {
    paddingTop: 14,
    paddingBottom: 22,
    paddingHorizontal: 16,
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: COLORS.textBlack
  },

  // ============ ENCABEZADO ============
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 4
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10
  },
  logo: {
    width: 62,
    height: 62,
    objectFit: 'contain'
  },
  headerTitulo1: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 1
  },
  headerTitulo2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: COLORS.titleRed,
    letterSpacing: 2.5,
    marginTop: 1
  },
  headerSubtitulo: {
    fontSize: 6,
    textAlign: 'center',
    marginTop: 1.5,
    letterSpacing: 0.4
  },
  headerHojaRuta: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: COLORS.titleRed,
    letterSpacing: 3.5,
    marginTop: 5
  },
  headerControl: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginTop: 1
  },

  // ============ TABLA PRINCIPAL ============
  tabla: {
    borderWidth: 0.7,
    borderColor: COLORS.border,
    marginBottom: 5
  },
  filaTabla: {
    flexDirection: 'row',
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.border
  },
  filaTablaUltima: {
    flexDirection: 'row'
  },
  celdaLabel: {
    padding: 4,
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 0.7,
    borderRightColor: COLORS.border,
    justifyContent: 'center'
  },
  celdaValor: {
    padding: 4,
    fontSize: 6.5,
    flex: 1,
    borderRightWidth: 0.7,
    borderRightColor: COLORS.border
  },
  celdaValorUltima: {
    padding: 4,
    fontSize: 6.5,
    flex: 1
  },
  celdaValorTexto: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginTop: 1
  },
  celdaLabelTexto: {
    fontSize: 5.5
  },

  // Sidebar de la tabla
  sidebar: {
    width: 60,
    borderLeftWidth: 0.7,
    borderLeftColor: COLORS.border,
    padding: 4,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  checkboxFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1.5
  },
  checkbox: {
    width: 7,
    height: 7,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginRight: 2.5
  },
  checkboxMarcado: {
    width: 7,
    height: 7,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.border,
    marginRight: 2.5
  },
  checkboxLabel: {
    fontSize: 6
  },

  // ============ BLOQUE DERIVACIÓN ============
  bloqueDestinatario: {
    borderWidth: 0.7,
    borderColor: COLORS.border,
    marginBottom: 4
  },
  headerDestinatario: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.border
  },
  headerDestinatarioLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    padding: 4,
    width: '18%',
    borderRightWidth: 0.7,
    borderRightColor: COLORS.border,
    justifyContent: 'center'
  },
  headerDestinatarioCampo: {
    flex: 1,
    padding: 4,
    borderRightWidth: 0.7,
    borderRightColor: COLORS.border,
    justifyContent: 'center'
  },
  headerDestinatarioCampoUltimo: {
    flex: 1,
    padding: 4,
    justifyContent: 'center'
  },
  headerDestinatarioLabelMini: {
    fontSize: 5.5,
    color: '#333'
  },
  headerDestinatarioValor: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    marginTop: 1
  },

  // Destinatario info
  destinatarioInfo: {
    padding: 4,
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.border
  },
  destinatarioInfoTexto: {
    fontSize: 7
  },

  // Checkboxes horizontales
  checkboxesHorizontal: {
    flexDirection: 'row',
    padding: 3,
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.border,
    gap: 14
  },
  checkboxH: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5
  },
  checkboxBox: {
    width: 7,
    height: 7,
    borderWidth: 0.6,
    borderColor: COLORS.border
  },
  checkboxBoxChecked: {
    width: 7,
    height: 7,
    borderWidth: 0.6,
    borderColor: COLORS.border,
    backgroundColor: COLORS.border
  },
  checkboxHLabel: {
    fontSize: 6.5
  },

  // Instrucciones
  instrucciones: {
    padding: 4,
    minHeight: 44,
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.border
  },
  instruccionesLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 1
  },
  instruccionesTexto: {
    fontSize: 6.5,
    lineHeight: 1.35
  },

  // Firma + CITE
  firmaRow: {
    flexDirection: 'row',
    padding: 4,
    minHeight: 34
  },
  firmaCol: {
    flex: 1,
    paddingRight: 6
  },
  firmaColRight: {
    flex: 1,
    paddingLeft: 6,
    borderLeftWidth: 0.5,
    borderLeftColor: '#CCC'
  },
  firmaLinea: {
    borderTopWidth: 0.6,
    borderTopColor: COLORS.textBlack,
    marginTop: 16,
    paddingTop: 2
  },
  firmaLabel: {
    fontSize: 6,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold'
  },
  firmaDatos: {
    fontSize: 6,
    marginBottom: 2,
    lineHeight: 1.35
  },

  // Sello
  selloBox: {
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderColor: '#999',
    height: 28,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selloTexto: {
    fontSize: 5.5,
    color: '#999'
  },

  // ============ PIE DE PÁGINA ============
  piePagina: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    textAlign: 'center',
    fontSize: 6,
    color: '#888'
  }
})

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
interface Props {
  hr: HojaRutaConRelaciones
  derivaciones: Derivacion[]
}

export default function PDFHojaRuta({ hr, derivaciones }: Props) {
  // Primera página: hasta 3 derivaciones
  // Páginas extra: 3 derivaciones por página
  const primeraPagina = derivaciones.slice(0, 3)
  const paginasExtra = chunkArray(derivaciones.slice(3), 3)

  return (
    <Document
      title={`Hoja de Ruta ${hr.numero_unico}`}
      author="Gobierno Autónomo Municipal de Papel Pampa"
      subject="Control de Trámites Municipales"
    >
      {/* Página 1 */}
      <Page size="LETTER" style={styles.page}>
        <Encabezado />
        <DatosPrincipales hr={hr} />

        {hr.documentos && hr.documentos.length > 0 && (
          <View
            style={{
              borderWidth: 0.7,
              borderColor: COLORS.border,
              padding: 3.5,
              marginBottom: 4
            }}
          >
            <Text
              style={{
                fontSize: 6.5,
                fontFamily: 'Helvetica-Bold',
                marginBottom: 2
              }}
            >
              DOCUMENTOS ADJUNTOS ({hr.documentos.length}):
            </Text>
            {hr.documentos.map((doc, i) => (
              <Text key={doc.id} style={{ fontSize: 6, marginLeft: 4 }}>
                {i + 1}. {doc.nombre_original}
                {doc.tamano_bytes ? ` (${formatearTamano(doc.tamano_bytes)})` : ''}
              </Text>
            ))}
          </View>
        )}

        {primeraPagina.map((deriv, index) => (
          <BloqueDestinatario
            key={deriv.id}
            derivacion={deriv}
            numeroOrden={index + 1}
          />
        ))}

        <PiePagina />
      </Page>

      {/* Páginas extra */}
      {paginasExtra.map((grupo, pageIndex) => (
        <Page key={pageIndex} size="LETTER" style={styles.page}>
          <Encabezado />
          {grupo.map((deriv, index) => (
            <BloqueDestinatario
              key={deriv.id}
              derivacion={deriv}
              numeroOrden={(pageIndex + 1) * 3 + index + 1}
            />
          ))}
          <PiePagina />
        </Page>
      ))}
    </Document>
  )
}

// ============================================
// SUBCOMPONENTES
// ============================================

function Encabezado() {
  return (
    <View style={styles.header}>
      <Image src="/escudo.png" style={styles.logo} />
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitulo1}>GOBIERNO AUTÓNOMO MUNICIPAL</Text>
        <Text style={styles.headerTitulo2}>PAPEL PAMPA</Text>
        <Text style={styles.headerSubtitulo}>
          SEGUNDA SECCIÓN - PROVINCIA GUALBERTO VILLARROEL
        </Text>
        <Text style={styles.headerSubtitulo}>LA PAZ - BOLIVIA</Text>
        <Text style={styles.headerHojaRuta}>HOJA DE RUTA</Text>
        <Text style={styles.headerControl}>CONTROL DE TRAMITES MUNICIPALES</Text>
      </View>
      <Image src="/logo-circular.png" style={styles.logo} />
    </View>
  )
}

function DatosPrincipales({ hr }: { hr: HojaRutaConRelaciones }) {
  return (
    <View style={styles.tabla}>
      <View style={styles.filaTabla}>
        <View style={[styles.celdaLabel, { width: 105 }]}>
          <Text style={{ fontSize: 6.5 }}>DATOS DE RECEPCION:</Text>
        </View>
        <View style={[styles.celdaValor, { width: 70 }]}>
          <Text style={styles.celdaLabelTexto}>N° Correlativo:</Text>
          <Text style={styles.celdaValorTexto}>{hr.numero_correlativo}</Text>
        </View>
        <View style={[styles.celdaValor, { width: 70 }]}>
          <Text style={styles.celdaLabelTexto}>Fecha:</Text>
          <Text style={styles.celdaValorTexto}>
            {formatearFecha(hr.fecha_recepcion)}
          </Text>
        </View>
        <View style={[styles.celdaValor, { width: 55 }]}>
          <Text style={styles.celdaLabelTexto}>Hora:</Text>
          <Text style={styles.celdaValorTexto}>
            {hr.hora_recepcion.substring(0, 5)}
          </Text>
        </View>
        <View style={[styles.celdaValor, { width: 50 }]}>
          <Text style={styles.celdaLabelTexto}>N° Fojas:</Text>
          <Text style={styles.celdaValorTexto}>{hr.numero_fojas}</Text>
        </View>
        <View style={styles.sidebar}>
          <CheckboxItem label="Original" checked={hr.tipo_original} />
          <CheckboxItem label="Urgente" checked={hr.tipo_urgente} />
          <CheckboxItem label="Copia" checked={hr.tipo_copia} />
          <CheckboxItem label="Fax" checked={hr.tipo_fax} />
        </View>
      </View>

      <View style={styles.filaTabla}>
        <View style={[styles.celdaLabel, { width: 105 }]}>
          <Text style={{ fontSize: 6.5 }}>DATOS DEL REMITENTE:</Text>
        </View>
        <View style={[styles.celdaValor, { flex: 1 }]}>
          <Text style={styles.celdaLabelTexto}>Nombre:</Text>
          <Text style={styles.celdaValorTexto}>{hr.remitente_nombre}</Text>
        </View>
        <View style={[styles.celdaValorUltima, { flex: 1 }]}>
          <Text style={styles.celdaLabelTexto}>Cargo / Institución:</Text>
          <Text style={styles.celdaValorTexto}>{hr.remitente_cargo || '-'}</Text>
        </View>
      </View>

      <View style={styles.filaTabla}>
        <View style={[styles.celdaLabel, { width: 105 }]}>
          <Text style={{ fontSize: 6.5 }}>DESCRIPCIÓN DEL</Text>
          <Text style={{ fontSize: 6.5 }}>CONTENIDO</Text>
        </View>
        <View style={[styles.celdaValorUltima, { flex: 1, minHeight: 30 }]}>
          <Text style={{ fontSize: 7, lineHeight: 1.35 }}>
            {hr.descripcion_contenido}
          </Text>
        </View>
      </View>

      <View style={styles.filaTablaUltima}>
        <View style={[styles.celdaLabel, { width: 105 }]}>
          <Text style={{ fontSize: 6.5 }}>DESTINATARIO</Text>
        </View>
        <View style={[styles.celdaValor, { flex: 1 }]}>
          <Text style={styles.celdaLabelTexto}>Nombre:</Text>
          <Text style={styles.celdaValorTexto}>
            {hr.destinatario_nombre || '-'}
          </Text>
        </View>
        <View style={[styles.celdaValorUltima, { flex: 1 }]}>
          <Text style={styles.celdaLabelTexto}>Cargo:</Text>
          <Text style={styles.celdaValorTexto}>{hr.destinatario_cargo || '-'}</Text>
        </View>
      </View>
    </View>
  )
}

function CheckboxItem({
  label,
  checked
}: {
  label: string
  checked: boolean
}) {
  return (
    <View style={styles.checkboxFila}>
      <View style={checked ? styles.checkboxMarcado : styles.checkbox} />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
  )
}

function CheckboxHorizontal({
  label,
  checked
}: {
  label: string
  checked: boolean
}) {
  return (
    <View style={styles.checkboxH}>
      <View
        style={checked ? styles.checkboxBoxChecked : styles.checkboxBox}
      />
      <Text style={styles.checkboxHLabel}>{label}</Text>
    </View>
  )
}

function BloqueDestinatario({
  derivacion,
  numeroOrden
}: {
  derivacion: Derivacion
  numeroOrden: number
}) {
  const ordinales = [
    'PRIMER',
    'SEGUNDO',
    'TERCER',
    'CUARTO',
    'QUINTO',
    'SEXTO',
    'SEPTIMO',
    'OCTAVO',
    'NOVENO',
    'DECIMO'
  ]
  const ordinal = ordinales[numeroOrden - 1] || `${numeroOrden}°`

  return (
    <View style={styles.bloqueDestinatario} wrap={false}>
      <View style={styles.headerDestinatario}>
        <View style={styles.headerDestinatarioLabel}>
          <Text>{ordinal} DESTINATARIO:</Text>
        </View>
        <View style={styles.headerDestinatarioCampo}>
          <Text style={styles.headerDestinatarioLabelMini}>
            N° de Registro Interno:
          </Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.numero_registro_interno || '-'}
          </Text>
        </View>
        <View style={styles.headerDestinatarioCampo}>
          <Text style={styles.headerDestinatarioLabelMini}>Fecha de Ingreso</Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.fecha_ingreso
              ? formatearFecha(derivacion.fecha_ingreso)
              : '__/__/____'}
          </Text>
        </View>
        <View style={styles.headerDestinatarioCampo}>
          <Text style={styles.headerDestinatarioLabelMini}>
            Fecha de Remisión
          </Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.fecha_remision
              ? formatearFecha(derivacion.fecha_remision)
              : '__/__/____'}
          </Text>
        </View>
        <View style={styles.headerDestinatarioCampoUltimo}>
          <Text style={styles.headerDestinatarioLabelMini}>Hora</Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.hora ? derivacion.hora.substring(0, 5) : '__:__'}
          </Text>
        </View>
      </View>

      <View style={styles.destinatarioInfo}>
        <Text style={styles.destinatarioInfoTexto}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>
            {derivacion.destinatario_nombre}
          </Text>
          {derivacion.destinatario_cargo
            ? ` - ${derivacion.destinatario_cargo}`
            : ''}
        </Text>
      </View>

      <View style={styles.checkboxesHorizontal}>
        <CheckboxHorizontal label="Original" checked={derivacion.tipo_original} />
        <CheckboxHorizontal label="Urgente" checked={derivacion.tipo_urgente} />
        <CheckboxHorizontal label="Copia" checked={derivacion.tipo_copia} />
        <CheckboxHorizontal label="Fax" checked={derivacion.tipo_fax} />
      </View>

      <View style={styles.instrucciones}>
        <Text style={styles.instruccionesLabel}>INSTRUCCIONES:</Text>
        <Text style={styles.instruccionesTexto}>
          {derivacion.instrucciones || ''}
        </Text>
      </View>

      <View style={styles.firmaRow}>
        <View style={styles.firmaCol}>
          <View style={styles.firmaLinea}>
            <Text style={styles.firmaLabel}>FIRMA</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            <Text style={styles.firmaDatos}>
              Nombre: {derivacion.destinatario_nombre}
            </Text>
            <Text style={styles.firmaDatos}>
              Cargo: {derivacion.destinatario_cargo || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.firmaColRight}>
          <Text style={styles.firmaDatos}>
            Respondiendo con:{' '}
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>
              {derivacion.respondiendo_con || ''}
            </Text>
          </Text>
          <Text style={styles.firmaDatos}>
            CITE:{' '}
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>
              {derivacion.cite || ''}
            </Text>
          </Text>
          <Text style={styles.firmaDatos}>
            Fecha:{' '}
            {derivacion.fecha_respuesta
              ? formatearFecha(derivacion.fecha_respuesta)
              : ''}
          </Text>

          <View style={styles.selloBox}>
            <Text style={styles.selloTexto}>(Espacio para sello)</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

function PiePagina() {
  return (
    <Text
      style={styles.piePagina}
      render={({ pageNumber, totalPages }) =>
        `Página ${pageNumber} de ${totalPages}`
      }
      fixed
    />
  )
}

// ============================================
// UTILIDADES
// ============================================
function formatearFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00')
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  return `${dia}/${mes}/${anio}`
}

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}