import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { UsuarioConRol } from '../types'

// ============================================
// TIPOS
// ============================================
export interface EstadisticasUsuario {
  pendientes: number      // Esperando mi confirmación
  enMiPoder: number       // Confirmadas por mí (o mi dirección)
  derivadasPorMi: number  // Derivadas desde mi dirección
  concluidas: number      // Concluidas (por mí o mi dirección)
}

export interface ConteoEstado {
  estado: string
  label: string
  total: number
  color: string
}

export interface HRReciente {
  id: string
  numero_unico: string
  descripcion_contenido: string
  remitente_nombre: string
  estado: string
  fecha_recepcion: string
  destinatario_nombre: string | null
  destinatario_direccion_id: string | null
  direccion_actual_id: string | null
}

// ============================================
// ESTADÍSTICAS DEL USUARIO
// ============================================
async function obtenerEstadisticas(
  user: UsuarioConRol
): Promise<EstadisticasUsuario> {
  const esAdmin = user.rol?.puede_admin === true
  const miDireccionId = user.direccion_principal?.id
  const miUsuarioId = user.id

  // Si es admin → estadísticas globales
  // Si no → solo de su dirección o sus propias HR

  // 1. PENDIENTES: HR que esperan mi confirmación
  let queryPendientes = supabase
    .from('hojas_ruta')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'PENDIENTE_CONFIRMACION')

  if (!esAdmin && miDireccionId) {
    queryPendientes = queryPendientes.eq('direccion_actual_id', miDireccionId)
  }

  const { count: pendientes } = await queryPendientes

  // 2. EN MI PODER: confirmadas por mí (o mi dirección)
  let queryEnPoder = supabase
    .from('hojas_ruta')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['CONFIRMADA', 'OBSERVADA'])

  if (!esAdmin && miDireccionId) {
    queryEnPoder = queryEnPoder.eq('direccion_actual_id', miDireccionId)
  }

  const { count: enMiPoder } = await queryEnPoder

  // 3. DERIVADAS POR MÍ (o mi dirección)
  let queryDerivadas = supabase
    .from('derivaciones')
    .select('*', { count: 'exact', head: true })

  if (!esAdmin && miDireccionId) {
    // Derivaciones que salieron de mi dirección
    queryDerivadas = queryDerivadas.eq('destinatario_direccion_id', miDireccionId)
  }

  const { count: derivadasPorMi } = await queryDerivadas

  // 4. CONCLUIDAS
  let queryConcluidas = supabase
    .from('hojas_ruta')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'CONCLUIDA')

  if (!esAdmin && miDireccionId) {
    queryConcluidas = queryConcluidas.eq('direccion_actual_id', miDireccionId)
  }

  const { count: concluidas } = await queryConcluidas

  return {
    pendientes: pendientes || 0,
    enMiPoder: enMiPoder || 0,
    derivadasPorMi: derivadasPorMi || 0,
    concluidas: concluidas || 0
  }
}

export function useEstadisticas(user: UsuarioConRol | null) {
  return useQuery({
    queryKey: ['estadisticas', user?.id],
    queryFn: () => obtenerEstadisticas(user!),
    enabled: !!user,
    refetchInterval: 60000 // cada 60 segundos
  })
}

// ============================================
// HR POR ESTADO (para el gráfico)
// ============================================
async function obtenerConteoEstados(user: UsuarioConRol): Promise<ConteoEstado[]> {
  const esAdmin = user.rol?.puede_admin === true
  const miDireccionId = user.direccion_principal?.id

  let query = supabase.from('hojas_ruta').select('estado')

  if (!esAdmin && miDireccionId) {
    query = query.or(
      `direccion_actual_id.eq.${miDireccionId},remitente_usuario_id.eq.${user.id}`
    )
  }

  const { data, error } = await query
  if (error || !data) return []

  const conteo: Record<string, number> = {}
  data.forEach((hr: any) => {
    conteo[hr.estado] = (conteo[hr.estado] || 0) + 1
  })

  const colores: Record<string, string> = {
    CREADA: '#94A3B8',
    ENVIADA: '#3B82F6',
    PENDIENTE_CONFIRMACION: '#F59E0B',
    CONFIRMADA: '#10B981',
    OBSERVADA: '#EAB308',
    RECHAZADA: '#EF4444',
    DERIVADA: '#8B5CF6',
    CONCLUIDA: '#059669'
  }

  const labels: Record<string, string> = {
    CREADA: 'Creada',
    ENVIADA: 'Enviada',
    PENDIENTE_CONFIRMACION: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    OBSERVADA: 'Observada',
    RECHAZADA: 'Rechazada',
    DERIVADA: 'Derivada',
    CONCLUIDA: 'Concluida'
  }

  return Object.entries(conteo)
    .map(([estado, total]) => ({
      estado,
      label: labels[estado] || estado,
      total,
      color: colores[estado] || '#94A3B8'
    }))
    .sort((a, b) => b.total - a.total)
}

export function useConteoEstados(user: UsuarioConRol | null) {
  return useQuery({
    queryKey: ['conteo-estados', user?.id],
    queryFn: () => obtenerConteoEstados(user!),
    enabled: !!user,
    refetchInterval: 60000
  })
}

// ============================================
// HR RECIENTES
// ============================================
async function obtenerHRRecientes(
  user: UsuarioConRol,
  limite = 5
): Promise<HRReciente[]> {
  const esAdmin = user.rol?.puede_admin === true
  const miDireccionId = user.direccion_principal?.id

  let query = supabase
    .from('hojas_ruta')
    .select(`
      id,
      numero_unico,
      descripcion_contenido,
      remitente_nombre,
      estado,
      fecha_recepcion,
      destinatario_nombre,
      destinatario_direccion_id,
      direccion_actual_id
    `)
    .order('created_at', { ascending: false })
    .limit(limite)

  if (!esAdmin && miDireccionId) {
    query = query.or(
      `direccion_actual_id.eq.${miDireccionId},destinatario_direccion_id.eq.${miDireccionId},remitente_usuario_id.eq.${user.id}`
    )
  }

  const { data, error } = await query
  if (error || !data) return []

  return data as HRReciente[]
}

export function useHRRecientes(user: UsuarioConRol | null, limite = 5) {
  return useQuery({
    queryKey: ['hr-recientes', user?.id, limite],
    queryFn: () => obtenerHRRecientes(user!, limite),
    enabled: !!user,
    refetchInterval: 60000
  })
}