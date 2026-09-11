import { supabase } from '../lib/supabase'

const BUCKET = 'documentos-hr'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp'
]

// ============================================
// VALIDAR ARCHIVO
// ============================================
export function validarArchivo(file: File): { valido: boolean; error?: string } {
  if (file.size > MAX_SIZE) {
    return {
      valido: false,
      error: `El archivo "${file.name}" excede los 10 MB permitidos`
    }
  }
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return {
      valido: false,
      error: `Tipo de archivo no permitido: "${file.name}". Solo PDF, Word, Excel e imágenes.`
    }
  }
  return { valido: true }
}

// ============================================
// SUBIR ARCHIVO
// ============================================
export async function subirArchivo(
  file: File,
  hrNumeroUnico: string
): Promise<{ path: string; error: string | null }> {
  const validacion = validarArchivo(file)
  if (!validacion.valido) {
    return { path: '', error: validacion.error || 'Archivo inválido' }
  }

  // Generar nombre único: timestamp_nombrelimpio
  const timestamp = Date.now()
  const nombreLimpio = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const nombreStorage = `${timestamp}_${nombreLimpio}`
  const ruta = `${hrNumeroUnico}/${nombreStorage}`

  const { error } = await supabase.storage.from(BUCKET).upload(ruta, file, {
    cacheControl: '3600',
    upsert: false
  })

  if (error) {
    return { path: '', error: 'Error al subir: ' + error.message }
  }

  return { path: ruta, error: null }
}

// ============================================
// ELIMINAR ARCHIVO
// ============================================
export async function eliminarArchivo(ruta: string): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(BUCKET).remove([ruta])
  return { error: error?.message || null }
}

// ============================================
// OBTENER URL FIRMADA (para ver/descargar)
// ============================================
export async function obtenerUrlFirmada(
  ruta: string,
  expiraEnSegundos = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(ruta, expiraEnSegundos)

  if (error || !data) {
    console.error('Error al obtener URL:', error)
    return null
  }
  return data.signedUrl
}

// ============================================
// GUARDAR METADATOS DE DOCUMENTO EN BD
// ============================================
export async function guardarDocumento(params: {
  hoja_ruta_id: string
  derivacion_id?: string | null
  nombre_original: string
  nombre_storage: string
  tipo_mime: string
  tamano_bytes: number
  subido_por: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('documentos').insert(params)
  return { error: error?.message || null }
}

// ============================================
// FORMATEAR TAMAÑO
// ============================================
export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}