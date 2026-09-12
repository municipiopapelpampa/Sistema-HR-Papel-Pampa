import { supabase } from '../lib/supabase'
import type { Notificacion, HojaRuta } from '../types'

export interface NotificacionConHR extends Notificacion {
  hoja_ruta?: Pick<HojaRuta, 'id' | 'numero_unico' | 'estado' | 'descripcion_contenido'>
}

// ============================================
// LISTAR NOTIFICACIONES DEL USUARIO
// ============================================
export async function listarNotificaciones(
  usuarioId: string,
  soloNoLeidas = false
): Promise<NotificacionConHR[]> {
  let query = supabase
    .from('notificaciones')
    .select(`
      *,
      hoja_ruta:hojas_ruta(id, numero_unico, estado, descripcion_contenido)
    `)
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (soloNoLeidas) {
    query = query.eq('leida', false)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error al listar notificaciones:', error)
    return []
  }
  return data || []
}

// ============================================
// CONTAR NO LEÍDAS
// ============================================
export async function contarNoLeidas(usuarioId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .eq('leida', false)

  if (error) return 0
  return count || 0
}

// ============================================
// MARCAR COMO LEÍDA
// ============================================
export async function marcarComoLeida(
  notificacionId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', notificacionId)
  return { error: error?.message || null }
}

// ============================================
// MARCAR TODAS COMO LEÍDAS
// ============================================
export async function marcarTodasComoLeidas(
  usuarioId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('usuario_id', usuarioId)
    .eq('leida', false)
  return { error: error?.message || null }
}

// ============================================
// MARCAR MODAL COMO VISTO (sin marcar leída)
// ============================================
export async function marcarModalVisto(
  notificacionId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notificaciones')
    .update({ requiere_modal: false })
    .eq('id', notificacionId)
  return { error: error?.message || null }
}

// ============================================
// OBTENER NOTIFICACIONES PENDIENTES DE MODAL
// ============================================
export async function notificacionesPendientesModal(
  usuarioId: string
): Promise<NotificacionConHR[]> {
  const { data, error } = await supabase
    .from('notificaciones')
    .select(`
      *,
      hoja_ruta:hojas_ruta(id, numero_unico, estado, descripcion_contenido)
    `)
    .eq('usuario_id', usuarioId)
    .eq('leida', false)
    .eq('requiere_modal', true)
    .order('created_at', { ascending: true })

  if (error) return []
  return data || []
}