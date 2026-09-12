import { supabase } from '../lib/supabase'
import type { Gestion } from '../types'

// ============================================
// LISTAR TODAS LAS GESTIONES
// ============================================
export async function listarGestiones(): Promise<Gestion[]> {
  const { data, error } = await supabase
    .from('gestiones')
    .select('*')
    .order('anio', { ascending: false })

  if (error) {
    console.error('Error al listar gestiones:', error)
    return []
  }
  return data || []
}

// ============================================
// OBTENER GESTIÓN ACTIVA
// ============================================
export async function obtenerGestionActiva(): Promise<Gestion | null> {
  const { data, error } = await supabase
    .from('gestiones')
    .select('*')
    .eq('estado', 'ACTIVA')
    .maybeSingle()

  if (error) return null
  return data
}

// ============================================
// CONTAR HR POR GESTIÓN
// ============================================
export async function contarHRPorGestion(gestionId: string): Promise<{
  total: number
  concluidas: number
  pendientes: number
}> {
  const { data, error } = await supabase
    .from('hojas_ruta')
    .select('estado')
    .eq('gestion_id', gestionId)

  if (error || !data) return { total: 0, concluidas: 0, pendientes: 0 }

  const total = data.length
  const concluidas = data.filter((hr) => hr.estado === 'CONCLUIDA').length
  const pendientes = total - concluidas

  return { total, concluidas, pendientes }
}

// ============================================
// CREAR NUEVA GESTIÓN
// ============================================
export async function crearGestion(anio: number): Promise<{
  data: Gestion | null
  error: string | null
}> {
  // Verificar que no exista una gestión activa
  const activa = await obtenerGestionActiva()
  if (activa) {
    return {
      data: null,
      error: `Ya existe una gestión activa (${activa.anio}). Ciérrala antes de crear una nueva.`
    }
  }

  // Verificar que no exista ya ese año
  const { data: existente } = await supabase
    .from('gestiones')
    .select('id')
    .eq('anio', anio)
    .maybeSingle()

  if (existente) {
    return { data: null, error: `La gestión ${anio} ya existe en el sistema.` }
  }

  // Crear la nueva gestión
  const { data, error } = await supabase
    .from('gestiones')
    .insert({
      anio,
      estado: 'ACTIVA',
      fecha_inicio: `${anio}-01-01`
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: 'Error al crear gestión: ' + error.message }
  }

  return { data, error: null }
}

// ============================================
// CERRAR GESTIÓN
// ============================================
export async function cerrarGestion(gestionId: string): Promise<{
  error: string | null
}> {
  const { error } = await supabase
    .from('gestiones')
    .update({
      estado: 'CERRADA',
      fecha_cierre: new Date().toISOString().split('T')[0]
    })
    .eq('id', gestionId)

  if (error) {
    return { error: 'Error al cerrar gestión: ' + error.message }
  }
  return { error: null }
}

// ============================================
// REABRIR GESTIÓN (solo por si acaso)
// ============================================
export async function reabrirGestion(gestionId: string): Promise<{
  error: string | null
}> {
  // Verificar que no haya otra activa
  const activa = await obtenerGestionActiva()
  if (activa && activa.id !== gestionId) {
    return {
      error: `Ya existe una gestión activa (${activa.anio}). Ciérrala primero.`
    }
  }

  const { error } = await supabase
    .from('gestiones')
    .update({
      estado: 'ACTIVA',
      fecha_cierre: null
    })
    .eq('id', gestionId)

  if (error) {
    return { error: 'Error al reabrir gestión: ' + error.message }
  }
  return { error: null }
}