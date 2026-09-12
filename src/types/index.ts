// ============================================
// TIPOS DEL SISTEMA
// ============================================

export type RolNombre = 'alcalde' | 'secretaria' | 'director' | 'personal'

export type EstadoHR =
  | 'CREADA'
  | 'ENVIADA'
  | 'PENDIENTE_CONFIRMACION'
  | 'CONFIRMADA'
  | 'OBSERVADA'
  | 'RECHAZADA'
  | 'DERIVADA'
  | 'CONCLUIDA'

export type EstadoDerivacion =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'OBSERVADA'
  | 'RECHAZADA'

export type TipoDestinatario = 'DIRECCION' | 'PERSONA'

// ============================================
// ENTIDADES
// ============================================

export interface Rol {
  id: string
  nombre: RolNombre
  descripcion: string | null
  puede_concluir: boolean
  puede_admin: boolean
  puede_crear: boolean
  puede_derivar: boolean
}

export interface Direccion {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  activo: boolean
}

export interface Usuario {
  id: string
  auth_user_id: string | null
  nombre_completo: string
  email: string
  cargo: string | null
  rol_id: string | null
  activo: boolean
  debe_cambiar_password: boolean
  ultimo_acceso: string | null
  created_at: string
}

export interface UsuarioConRol extends Usuario {
  rol: Rol | null
  direccion_principal: Direccion | null
}

export interface Gestion {
  id: string
  anio: number
  estado: 'ACTIVA' | 'CERRADA'
  fecha_inicio: string
  fecha_cierre: string | null
}

export interface HojaRuta {
  id: string
  gestion_id: string | null
  numero_correlativo: string
  numero_unico: string
  fecha_recepcion: string
  hora_recepcion: string
  numero_fojas: number
  remitente_nombre: string
  remitente_cargo: string | null
  remitente_usuario_id: string | null
  descripcion_contenido: string
  destinatario_nombre: string | null
  destinatario_cargo: string | null
  destinatario_direccion_id: string | null
  tipo_destinatario: TipoDestinatario
  tipo_original: boolean
  tipo_urgente: boolean
  tipo_copia: boolean
  tipo_fax: boolean
  estado: EstadoHR
  direccion_actual_id: string | null
  usuario_actual_id: string | null
  fecha_conclusion: string | null
  concluida_por: string | null
  observacion_conclusion: string | null
  created_at: string
  updated_at: string
}

export interface HojaRutaConRelaciones extends HojaRuta {
  remitente?: Usuario | null
  direccion_actual?: Direccion | null
  destinatario_direccion?: Direccion | null
  usuario_actual?: Usuario | null
  documentos?: Documento[]
}

export interface Derivacion {
  id: string
  hoja_ruta_id: string
  numero_orden: number
  destinatario_nombre: string
  destinatario_cargo: string | null
  destinatario_direccion_id: string | null
  destinatario_usuario_id: string | null
  tipo_destinatario: TipoDestinatario
  numero_registro_interno: string | null
  fecha_ingreso: string | null
  fecha_remision: string | null
  hora: string | null
  tipo_original: boolean
  tipo_urgente: boolean
  tipo_copia: boolean
  tipo_fax: boolean
  instrucciones: string | null
  firma_usuario_id: string | null
  respondiendo_con: string | null
  cite: string | null
  fecha_respuesta: string | null
  estado: EstadoDerivacion
  created_at: string
}

export interface Documento {
  id: string
  hoja_ruta_id: string
  derivacion_id: string | null
  nombre_original: string
  nombre_storage: string
  tipo_mime: string | null
  tamano_bytes: number | null
  subido_por: string | null
  created_at: string
}

export interface Notificacion {
  id: string
  usuario_id: string
  hoja_ruta_id: string
  tipo: string
  mensaje: string
  leida: boolean
  requiere_modal: boolean
  created_at: string
}

// ============================================
// FORMULARIOS
// ============================================

export interface NuevaHRForm {
  // Recepción
  numero_fojas: number
  
  // Remitente
  remitente_nombre: string
  remitente_cargo: string
  
  // Contenido
  descripcion_contenido: string
  
  // Destinatario
  tipo_destinatario: TipoDestinatario
  destinatario_direccion_id: string
  destinatario_usuario_id?: string
  destinatario_nombre?: string
  destinatario_cargo?: string
  
  // Tipo de envío
  tipo_original: boolean
  tipo_urgente: boolean
  tipo_copia: boolean
  tipo_fax: boolean
  
  // Instrucciones para el destinatario
  instrucciones: string
}

// ============================================
// CONTEXTO DE AUTENTICACIÓN
// ============================================

export interface AuthContextType {
  user: UsuarioConRol | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// ============================================
// TIPOS ADICIONALES PARA DERIVACIONES
// ============================================

export interface DerivacionConRelaciones extends Derivacion {
  destinatario_direccion?: Direccion | null
  destinatario_usuario?: Usuario | null
  firma_usuario?: Usuario | null
}

export interface AccionDerivarForm {
  direccion_destino_id: string
  tipo_destinatario: TipoDestinatario
  destinatario_usuario_id?: string
  instrucciones: string
  cite: string
  respondiendo_con?: string
  tipo_original: boolean
  tipo_urgente: boolean
  tipo_copia: boolean
  tipo_fax: boolean
}

export interface AccionResponderForm {
  cite?: string
  respondiendo_con?: string
  observaciones?: string
}