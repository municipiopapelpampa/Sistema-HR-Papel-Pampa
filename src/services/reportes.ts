import { supabase } from '../lib/supabase'
import type { HojaRuta, Direccion } from '../types'

// ============================================
// TIPOS DE REPORTES
// ============================================
export type TipoReporte =
  | 'POR_DIRECCION'
  | 'POR_ESTADO'
  | 'CONCLUIDAS'
  | 'PENDIENTES'

export interface FiltrosReporte {
  fechaDesde?: string
  fechaHasta?: string
  direccionId?: string
  estado?: string
  diasPendiente?: number
}

// ============================================
// HOJA DE RUTA CON RELACIONES
// ============================================
export interface HRReporte extends HojaRuta {
  destinatario_direccion?: Pick<Direccion, 'codigo' | 'nombre'> | null
  direccion_actual?: Pick<Direccion, 'codigo' | 'nombre'> | null
  remitente?: { nombre_completo: string } | null
}

// ============================================
// REPORTE 1: HR POR DIRECCIÓN
// ============================================
export async function reporteHrPorDireccion(
  filtros: FiltrosReporte
): Promise<HRReporte[]> {
  let query = supabase
    .from('hojas_ruta')
    .select(`
      *,
      destinatario_direccion:direcciones!hojas_ruta_destinatario_direccion_id_fkey(codigo, nombre),
      direccion_actual:direcciones!hojas_ruta_direccion_actual_id_fkey(codigo, nombre),
      remitente:usuarios!hojas_ruta_remitente_usuario_id_fkey(nombre_completo)
    `)
    .order('fecha_recepcion', { ascending: false })

  if (filtros.fechaDesde) query = query.gte('fecha_recepcion', filtros.fechaDesde)
  if (filtros.fechaHasta) query = query.lte('fecha_recepcion', filtros.fechaHasta)
  if (filtros.direccionId) query = query.eq('direccion_actual_id', filtros.direccionId)
  if (filtros.estado) query = query.eq('estado', filtros.estado)

  const { data, error } = await query.limit(500)
  if (error) {
    console.error('Error reporte dirección:', error)
    return []
  }
  return (data || []) as HRReporte[]
}

// ============================================
// REPORTE 2: HR POR ESTADO
// ============================================
export async function reporteHrPorEstado(
  filtros: FiltrosReporte
): Promise<{ estado: string; total: number }[]> {
  let query = supabase
    .from('hojas_ruta')
    .select('estado')
    .gte('fecha_recepcion', filtros.fechaDesde || '2020-01-01')
    .lte('fecha_recepcion', filtros.fechaHasta || '2099-12-31')

  if (filtros.direccionId) query = query.eq('direccion_actual_id', filtros.direccionId)

  const { data, error } = await query
  if (error || !data) return []

  const conteo: Record<string, number> = {}
  data.forEach((hr: any) => {
    conteo[hr.estado] = (conteo[hr.estado] || 0) + 1
  })

  return Object.entries(conteo)
    .map(([estado, total]) => ({ estado, total }))
    .sort((a, b) => b.total - a.total)
}

// ============================================
// REPORTE 3: HR CONCLUIDAS
// ============================================
export async function reporteHrConcluidas(
  filtros: FiltrosReporte
): Promise<HRReporte[]> {
  let query = supabase
    .from('hojas_ruta')
    .select(`
      *,
      destinatario_direccion:direcciones!hojas_ruta_destinatario_direccion_id_fkey(codigo, nombre),
      direccion_actual:direcciones!hojas_ruta_direccion_actual_id_fkey(codigo, nombre),
      remitente:usuarios!hojas_ruta_remitente_usuario_id_fkey(nombre_completo)
    `)
    .eq('estado', 'CONCLUIDA')
    .order('fecha_conclusion', { ascending: false })

  if (filtros.fechaDesde) query = query.gte('fecha_conclusion', filtros.fechaDesde)
  if (filtros.fechaHasta) query = query.lte('fecha_conclusion', filtros.fechaHasta)
  if (filtros.direccionId) query = query.eq('direccion_actual_id', filtros.direccionId)

  const { data, error } = await query.limit(500)
  if (error) return []
  return (data || []) as HRReporte[]
}

// ============================================
// REPORTE 4: HR PENDIENTES
// ============================================
export async function reporteHrPendientes(
  filtros: FiltrosReporte
): Promise<HRReporte[]> {
  const dias = filtros.diasPendiente || 7

  let query = supabase
    .from('hojas_ruta')
    .select(`
      *,
      destinatario_direccion:direcciones!hojas_ruta_destinatario_direccion_id_fkey(codigo, nombre),
      direccion_actual:direcciones!hojas_ruta_direccion_actual_id_fkey(codigo, nombre),
      remitente:usuarios!hojas_ruta_remitente_usuario_id_fkey(nombre_completo)
    `)
    .neq('estado', 'CONCLUIDA')
    .neq('estado', 'RECHAZADA')
    .order('fecha_recepcion', { ascending: true })

  if (filtros.direccionId) query = query.eq('direccion_actual_id', filtros.direccionId)

  const { data, error } = await query
  if (error || !data) return []

  // Filtrar por días transcurridos
  const hoy = new Date()
  const filtradas = (data as HRReporte[]).filter((hr) => {
    const fechaHR = new Date(hr.fecha_recepcion + 'T00:00:00')
    const diffDias = Math.floor((hoy.getTime() - fechaHR.getTime()) / 86400000)
    return diffDias >= dias
  })

  return filtradas
}

// ============================================
// CALCULAR DÍAS TRANSCURRIDOS
// ============================================
export function diasTranscurridos(fecha: string): number {
  const hoy = new Date()
  const f = new Date(fecha + 'T00:00:00')
  return Math.floor((hoy.getTime() - f.getTime()) / 86400000)
}