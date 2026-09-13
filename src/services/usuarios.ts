import { supabase } from '../lib/supabase'
import type { UsuarioConRol, Rol, Direccion } from '../types'

export interface CrearUsuarioInput {
  email: string
  password: string
  nombre_completo: string
  cargo: string
  rol_id: string
  direccion_id: string
  cargo_direccion?: string
}

export async function listarUsuarios(): Promise<UsuarioConRol[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      rol:roles(*),
      direccion_principal:usuario_direcciones!inner(
        es_principal,
        cargo_direccion,
        direccion:direcciones(*)
      )
    `)
    .eq('usuario_direcciones.es_principal', true)
    .order('nombre_completo')

  if (error) {
    console.error('Error al listar usuarios:', error)
    return []
  }

  // @ts-ignore
  return (data || []).map((u) => ({
    ...u,
    direccion_principal: u.direccion_principal?.[0]?.direccion || null
  }))
}

export async function crearUsuario(
  input: CrearUsuarioInput
): Promise<{ data: any; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('crear-usuario', {
    body: input,
  })

  if (error) return { data: null, error: error.message }
  if (data?.error) return { data: null, error: data.error }
  return { data: data.usuario, error: null }
}

export async function eliminarUsuario(
  usuarioId: string
): Promise<{ error: string | null }> {
  const { data, error } = await supabase.functions.invoke('eliminar-usuario', {
    body: { usuario_id: usuarioId },
  })

  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return { error: null }
}

export async function listarRoles(): Promise<Rol[]> {
  const { data, error } = await supabase.from('roles').select('*').order('nombre')
  if (error) return []
  return data || []
}

export async function listarDirecciones(): Promise<Direccion[]> {
  const { data, error } = await supabase
    .from('direcciones')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  if (error) return []
  return data || []
}

export async function toggleActivoUsuario(
  usuarioId: string,
  activo: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('usuarios')
    .update({ activo })
    .eq('id', usuarioId)
  return { error: error?.message || null }
}

// ============================================
// GESTIÓN DE DIRECCIONES
// ============================================

export interface CrearDireccionInput {
  nombre: string
  codigo: string
  descripcion?: string
}

export interface EditarDireccionInput {
  id: string
  nombre: string
  descripcion?: string
}

// Crear dirección
export async function crearDireccion(
  input: CrearDireccionInput
): Promise<{ data: Direccion | null; error: string | null }> {
  // Verificar que el código no exista
  const { data: existente } = await supabase
    .from('direcciones')
    .select('id')
    .eq('codigo', input.codigo.toUpperCase())
    .maybeSingle()

  if (existente) {
    return { data: null, error: `Ya existe una dirección con el código "${input.codigo}"` }
  }

  const { data, error } = await supabase
    .from('direcciones')
    .insert({
      nombre: input.nombre.trim(),
      codigo: input.codigo.trim().toUpperCase(),
      descripcion: input.descripcion?.trim() || null,
      activo: true
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: 'Error al crear dirección: ' + error.message }
  }
  return { data, error: null }
}

// Editar dirección (no permite cambiar código)
export async function editarDireccion(
  input: EditarDireccionInput
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('direcciones')
    .update({
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || null
    })
    .eq('id', input.id)

  if (error) {
    return { error: 'Error al editar dirección: ' + error.message }
  }
  return { error: null }
}

// Activar/Desactivar dirección
export async function toggleActivoDireccion(
  direccionId: string,
  activo: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('direcciones')
    .update({ activo })
    .eq('id', direccionId)

  return { error: error?.message || null }
}

// Contar usuarios y HR asociadas
export async function contarAsociadosDireccion(direccionId: string): Promise<{
  usuarios: number
  hojasRuta: number
}> {
  const { count: usuariosCount } = await supabase
    .from('usuario_direcciones')
    .select('*', { count: 'exact', head: true })
    .eq('direccion_id', direccionId)
    .eq('activo', true)

  const { count: hrCount } = await supabase
    .from('hojas_ruta')
    .select('*', { count: 'exact', head: true })
    .eq('direccion_actual_id', direccionId)

  return {
    usuarios: usuariosCount || 0,
    hojasRuta: hrCount || 0
  }
}

// Listar TODAS las direcciones (incluidas inactivas)
export async function listarTodasDirecciones(): Promise<Direccion[]> {
  const { data, error } = await supabase
    .from('direcciones')
    .select('*')
    .order('activo', { ascending: false })
    .order('codigo')

  if (error) return []
  return data || []
}
// ============================================
// VERIFICAR SI UN USUARIO PUEDE SER ELIMINADO
// ============================================
export interface ActividadUsuario {
  creoHR: number
  confirmoDerivaciones: number
  fueDestinoHR: number
  subioDocumentos: number
  registrosHistorial: number
  totalActividad: number
  puedeEliminar: boolean
}

export async function verificarActividadUsuario(
  usuarioId: string
): Promise<ActividadUsuario> {
  // 1. ¿Creó hojas de ruta?
  const { count: creoHR } = await supabase
    .from('hojas_ruta')
    .select('*', { count: 'exact', head: true })
    .eq('remitente_usuario_id', usuarioId)

  // 2. ¿Firmó derivaciones?
  const { count: confirmoDerivaciones } = await supabase
    .from('derivaciones')
    .select('*', { count: 'exact', head: true })
    .eq('firma_usuario_id', usuarioId)

  // 3. ¿Fue destino actual de alguna HR?
  const { count: fueDestinoHR } = await supabase
    .from('hojas_ruta')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_actual_id', usuarioId)

  // 4. ¿Subió documentos?
  const { count: subioDocumentos } = await supabase
    .from('documentos')
    .select('*', { count: 'exact', head: true })
    .eq('subido_por', usuarioId)

  // 5. ¿Tiene registros en historial?
  const { count: registrosHistorial } = await supabase
    .from('historial')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)

  const total =
    (creoHR || 0) +
    (confirmoDerivaciones || 0) +
    (fueDestinoHR || 0) +
    (subioDocumentos || 0) +
    (registrosHistorial || 0)

  return {
    creoHR: creoHR || 0,
    confirmoDerivaciones: confirmoDerivaciones || 0,
    fueDestinoHR: fueDestinoHR || 0,
    subioDocumentos: subioDocumentos || 0,
    registrosHistorial: registrosHistorial || 0,
    totalActividad: total,
    puedeEliminar: total === 0
  }
}