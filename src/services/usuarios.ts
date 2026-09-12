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