import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { UsuarioConRol, HojaRutaConRelaciones } from '../types'

// ============================================
// OBTENER HR DE MI BANDEJA
// ============================================
export interface HrBandeja extends HojaRutaConRelaciones {
  accion_pendiente: 'CONFIRMAR' | 'DERIVAR' | 'OBSERVAR' | 'CONCLUIR'
  dias_esperando: number
}

async function obtenerBandeja(
  user: UsuarioConRol
): Promise<HrBandeja[]> {
  const miDireccionId = user.direccion_principal?.id
  if (!miDireccionId) return []

  // 1. HR que están en mi dirección con estado PENDIENTE_CONFIRMACION
  // 2. HR que están en mi dirección con estado CONFIRMADA (esperando derivar)
  // 3. HR que están en mi dirección con estado OBSERVADA (esperando derivar/concluir)
  // 4. HR asignadas directamente a mí (usuario_actual_id = yo)

  const { data, error } = await supabase
    .from('hojas_ruta')
    .select(`
      *,
      remitente:usuarios!hojas_ruta_remitente_usuario_id_fkey(id, nombre_completo, email, cargo),
      direccion_actual:direcciones!hojas_ruta_direccion_actual_id_fkey(id, nombre, codigo),
      destinatario_direccion:direcciones!hojas_ruta_destinatario_direccion_id_fkey(id, nombre, codigo),
      gestion:gestiones!hojas_ruta_gestion_id_fkey(id, anio, estado)
    `)
    .in('estado', ['PENDIENTE_CONFIRMACION', 'CONFIRMADA', 'OBSERVADA'])
    .or(
      `usuario_actual_id.eq.${user.id},` +
      `and(usuario_actual_id.is.null,direccion_actual_id.eq.${miDireccionId})`
    )
    .order('tipo_urgente', { ascending: false })
    .order('fecha_recepcion', { ascending: true })

  if (error) {
    console.error('Error al cargar bandeja:', error)
    return []
  }

  // Calcular días esperando y acción pendiente
  const hoy = new Date()
  return (data || []).map((hr: any) => {
    const fechaHR = new Date(hr.fecha_recepcion + 'T00:00:00')
    const dias = Math.floor((hoy.getTime() - fechaHR.getTime()) / 86400000)

    let accion: HrBandeja['accion_pendiente'] = 'CONFIRMAR'
    if (hr.estado === 'PENDIENTE_CONFIRMACION') accion = 'CONFIRMAR'
    else if (hr.estado === 'CONFIRMADA') accion = 'DERIVAR'
    else if (hr.estado === 'OBSERVADA') accion = 'DERIVAR'

    return {
      ...hr,
      accion_pendiente: accion,
      dias_esperando: dias
    } as HrBandeja
  })
}

export function useBandeja(user: UsuarioConRol | null) {
  return useQuery({
    queryKey: ['bandeja', user?.id],
    queryFn: () => obtenerBandeja(user!),
    enabled: !!user,
    refetchInterval: 30000 // actualiza cada 30 segundos
  })
}