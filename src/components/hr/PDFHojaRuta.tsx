import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font
} from '@react-pdf/renderer'
import type { HojaRutaConRelaciones, Derivacion } from '../../types'

// ============================================
// ESTILOS (colores oficiales del formato físico)
// ============================================
const COLORS = {
  border: '#2E7D6B',      // verde teal de los bordes
  borderLight: '#6BA89A', // verde claro
  titleRed: '#C0392B',    // rojo del título HOJA DE RUTA
  textBlack: '#000000',
  bgWatermark: '#F0F0F0'
}

const styles = StyleSheet.create({
  // Página
  page: {
    padding: 20,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: COLORS.textBlack
  },

  // Encabezado
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
    width: 55,
    height: 55,
    objectFit: 'contain'
  },
  headerTitulo1: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 1
  },
  headerTitulo2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: COLORS.titleRed,
    letterSpacing: 2,
    marginTop: 2
  },
  headerSubtitulo: {
    fontSize: 7,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5
  },
  headerHojaRuta: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: COLORS.titleRed,
    letterSpacing: 4,
    marginTop: 6
  },
  headerControl: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 2
  },

  // Tabla principal
  tabla: {
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6
  },
  filaTabla: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  filaTablaUltima: {
    flexDirection: 'row'
  },
  celdaLabel: {
    padding: 3,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    justifyContent: 'center'
  },
  celdaValor: {
    padding: 3,
    fontSize: 7,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: COLORS.border
  },
  celdaValorUltima: {
    padding: 3,
    fontSize: 7,
    flex: 1
  },

  // Bloques laterales (Original/Urgente/Copia/Fax)
  sidebar: {
    width: 60,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    padding: 3,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  checkboxFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  checkbox: {
    width: 7,
    height: 7,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginRight: 3
  },
  checkboxMarcado: {
    width: 7,
    height: 7,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.border,
    marginRight: 3
  },
  checkboxLabel: {
    fontSize: 6
  },

  // Bloque de destinatario
  bloqueDestinatario: {
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4
  },
  headerDestinatario: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 3
  },
  headerDestinatarioLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    flex: 2
  },
  headerDestinatarioCampo: {
    fontSize: 6,
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    paddingLeft: 3
  },
  headerDestinatarioValor: {
    fontSize: 7,
    paddingLeft: 3
  },

  // Checkboxes horizontales
  checkboxesHorizontal: {
    flexDirection: 'row',
    padding: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10
  },
  checkboxH: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  checkboxBox: {
    width: 8,
    height: 8,
    borderWidth: 0.7,
    borderColor: COLORS.border
  },
  checkboxBoxChecked: {
    width: 8,
    height: 8,
    borderWidth: 0.7,
    borderColor: COLORS.border,
    backgroundColor: COLORS.border
  },

  // Instrucciones
  instrucciones: {
    padding: 4,
    minHeight: 55,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  instruccionesLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 3,
    letterSpacing: 1
  },
  instruccionesTexto: {
    fontSize: 7,
    lineHeight: 1.3
  },

  // Firma + CITE
  firmaRow: {
    flexDirection: 'row',
    padding: 4,
    minHeight: 30
  },
  firmaCol: {
    flex: 1,
    paddingRight: 5
  },
  firmaColRight: {
    flex: 1,
    paddingLeft: 5
  },
  firmaLinea: {
    borderTopWidth: 0.7,
    borderTopColor: COLORS.textBlack,
    marginTop: 18,
    paddingTop: 2
  },
  firmaLabel: {
    fontSize: 6,
    textAlign: 'center'
  },
  firmaDatos: {
    fontSize: 6,
    marginBottom: 2
  },

  // Estado de conclusión
  estadoConcluido: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 60,
    fontFamily: 'Helvetica-Bold',
    color: '#1F5C4A',
    opacity: 0.08,
    transform: 'rotate(-30deg)'
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
  // Separar derivaciones en grupos de máximo 3 por página
  const derivacionesPorPagina = chunkArray(derivaciones, 3)

  return (
    <Document
      title={`Hoja de Ruta ${hr.numero_unico}`}
      author="Gobierno Autónomo Municipal de Papel Pampa"
      subject="Control de Trámites Municipales"
    >
      {/* Página 1: Datos principales + primeras derivaciones */}
      <Page size="LETTER" style={styles.page}>
        <Encabezado />

        {hr.estado === 'CONCLUIDA' && (
          <Text style={styles.estadoConcluido}>CONCLUIDO</Text>
        )}

        {/* Datos de recepción */}
        <View style={styles.tabla}>
          <View style={styles.filaTabla}>
            <View style={[styles.celdaLabel, { width: 110 }]}>
              <Text>DATOS DE RECEPCION:</Text>
            </View>
            <View style={[styles.celdaValor, { width: 70 }]}>
              <Text>N° Correlativo:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {hr.numero_correlativo}
              </Text>
            </View>
            <View style={[styles.celdaValor, { width: 70 }]}>
              <Text>Fecha:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {formatearFecha(hr.fecha_recepcion)}
              </Text>
            </View>
            <View style={[styles.celdaValor, { width: 55 }]}>
              <Text>Hora:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {hr.hora_recepcion.substring(0, 5)}
              </Text>
            </View>
            <View style={[styles.celdaValor, { width: 55 }]}>
              <Text>N° de Fojas:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {hr.numero_fojas}
              </Text>
            </View>
            <View style={styles.sidebar}>
              <CheckboxItem label="Original" checked={hr.tipo_original} />
              <CheckboxItem label="Urgente" checked={hr.tipo_urgente} />
              <CheckboxItem label="Copia" checked={hr.tipo_copia} />
              <CheckboxItem label="Fax" checked={hr.tipo_fax} />
            </View>
          </View>

          {/* Remitente */}
          <View style={styles.filaTabla}>
            <View style={[styles.celdaLabel, { width: 110 }]}>
              <Text>DATOS DEL REMITENTE:</Text>
            </View>
            <View style={[styles.celdaValor, { flex: 1 }]}>
              <Text>Nombre:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {hr.remitente_nombre}
              </Text>
            </View>
            <View style={[styles.celdaValorUltima, { flex: 1 }]}>
              <Text>Cargo / Institución:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {hr.remitente_cargo || '-'}
              </Text>
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.filaTabla}>
            <View style={[styles.celdaLabel, { width: 110 }]}>
              <Text>DESCRIPCIÓN DEL</Text>
              <Text>CONTENIDO</Text>
            </View>
            <View style={[styles.celdaValorUltima, { flex: 1, minHeight: 35 }]}>
              <Text style={{ fontSize: 7.5, lineHeight: 1.3 }}>
                {hr.descripcion_contenido}
              </Text>
            </View>
          </View>

          {/* Destinatario */}
          <View style={styles.filaTablaUltima}>
            <View style={[styles.celdaLabel, { width: 110 }]}>
              <Text>DESTINATARIO</Text>
            </View>
            <View style={[styles.celdaValor, { flex: 1 }]}>
              <Text>Nombre:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {hr.destinatario_nombre || '-'}
              </Text>
            </View>
            <View style={[styles.celdaValorUltima, { flex: 1 }]}>
              <Text>Cargo:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                {hr.destinatario_cargo || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bloque de adjuntos */}
        {hr.documentos && hr.documentos.length > 0 && (
          <View
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 4,
              marginBottom: 6
            }}
          >
            <Text
              style={{
                fontSize: 7,
                fontFamily: 'Helvetica-Bold',
                marginBottom: 2
              }}
            >
              DOCUMENTOS ADJUNTOS ({hr.documentos.length}):
            </Text>
            {hr.documentos.map((doc, i) => (
              <Text key={doc.id} style={{ fontSize: 6.5, marginLeft: 5 }}>
                {i + 1}. {doc.nombre_original}
                {doc.tamano_bytes
                  ? ` (${formatearTamano(doc.tamano_bytes)})`
                  : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Bloques de derivaciones (primeros 3) */}
        {derivacionesPorPagina[0]?.map((deriv, index) => (
          <BloqueDestinatario
            key={deriv.id}
            derivacion={deriv}
            numeroOrden={index + 1}
          />
        ))}

        <PiePagina numeroPagina={1} />
      </Page>

      {/* Páginas adicionales (derivaciones 4-6, 7-9, etc.) */}
      {derivacionesPorPagina.slice(1).map((grupo, pageIndex) => (
        <Page key={pageIndex} size="LETTER" style={styles.page}>
          <Encabezado />

          {hr.estado === 'CONCLUIDA' && (
            <Text style={styles.estadoConcluido}>CONCLUIDO</Text>
          )}

          {grupo.map((deriv, index) => (
            <BloqueDestinatario
              key={deriv.id}
              derivacion={deriv}
              numeroOrden={(pageIndex + 1) * 3 + index + 1}
            />
          ))}

          <PiePagina numeroPagina={pageIndex + 2} />
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
        <Text style={styles.headerTitulo1}>
          GOBIERNO AUTÓNOMO MUNICIPAL
        </Text>
        <Text style={styles.headerTitulo2}>PAPEL PAMPA</Text>
        <Text style={styles.headerSubtitulo}>
          SEGUNDA SECCIÓN - PROVINCIA GUALBERTO VILLARROEL
        </Text>
        <Text style={styles.headerSubtitulo}>LA PAZ - BOLIVIA</Text>
        <Text style={styles.headerHojaRuta}>HOJA DE RUTA</Text>
        <Text style={styles.headerControl}>
          CONTROL DE TRAMITES MUNICIPALES
        </Text>
      </View>
      <Image src="/logo-circular.png" style={styles.logo} />
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
      <Text style={{ fontSize: 7 }}>{label}</Text>
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
    <View style={styles.bloqueDestinatario}>
      {/* Header del destinatario */}
      <View style={styles.headerDestinatario}>
        <Text style={styles.headerDestinatarioLabel}>
          {ordinal} DESTINATARIO:
        </Text>
        <View style={styles.headerDestinatarioCampo}>
          <Text style={{ fontSize: 6 }}>N° de Registro Interno:</Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.numero_registro_interno || '-'}
          </Text>
        </View>
        <View style={styles.headerDestinatarioCampo}>
          <Text style={{ fontSize: 6 }}>Fecha de Ingreso</Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.fecha_ingreso
              ? formatearFecha(derivacion.fecha_ingreso)
              : '__/__/____'}
          </Text>
        </View>
        <View style={styles.headerDestinatarioCampo}>
          <Text style={{ fontSize: 6 }}>Fecha de Remisión</Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.fecha_remision
              ? formatearFecha(derivacion.fecha_remision)
              : '__/__/____'}
          </Text>
        </View>
        <View style={styles.headerDestinatarioCampo}>
          <Text style={{ fontSize: 6 }}>Hora</Text>
          <Text style={styles.headerDestinatarioValor}>
            {derivacion.hora ? derivacion.hora.substring(0, 5) : '__:__'}
          </Text>
        </View>
      </View>

      {/* Destinatario */}
      <View
        style={{
          padding: 3,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border
        }}
      >
        <Text style={{ fontSize: 7 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>
            {derivacion.destinatario_nombre}
          </Text>
          {derivacion.destinatario_cargo
            ? ` - ${derivacion.destinatario_cargo}`
            : ''}
        </Text>
      </View>

      {/* Checkboxes horizontales */}
      <View style={styles.checkboxesHorizontal}>
        <CheckboxHorizontal label="Original" checked={derivacion.tipo_original} />
        <CheckboxHorizontal label="Urgente" checked={derivacion.tipo_urgente} />
        <CheckboxHorizontal label="Copia" checked={derivacion.tipo_copia} />
        <CheckboxHorizontal label="Fax" checked={derivacion.tipo_fax} />
      </View>

      {/* Instrucciones */}
      <View style={styles.instrucciones}>
        <Text style={styles.instruccionesLabel}>INSTRUCCIONES:</Text>
        <Text style={styles.instruccionesTexto}>
          {derivacion.instrucciones || ''}
        </Text>
      </View>

      {/* Firma + CITE */}
      <View style={styles.firmaRow}>
        <View style={styles.firmaCol}>
          <View style={styles.firmaLinea}>
            <Text style={styles.firmaLabel}>FIRMA</Text>
          </View>
          <View style={{ marginTop: 8 }}>
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

          {/* Sello (espacio en blanco) */}
          <View
            style={{
              borderWidth: 0.5,
              borderStyle: 'dashed',
              borderColor: '#999',
              height: 30,
              marginTop: 6,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 5, color: '#999' }}>
              (Espacio para sello)
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

function PiePagina({ numeroPagina }: { numeroPagina: number }) {
  return (
    <Text
      style={{
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 6,
        color: '#888'
      }}
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