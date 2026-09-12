import { supabase } from '../lib/supabase'
import type {
  Derivacion,
  AccionDerivarForm,
  AccionResponderForm,
  HojaRuta
} from '../types'

// ============================================
// LISTAR DERIVACIONES CON RELACIONES
// ============================================
export async function listarDerivacionesConRelaciones(
  hrId: string
): Promise<Derivacion[]> {
  const { data, error } = await supabase
    .from('derivaciones')
    .select(`
      *,
      destinatario_direccion:direcciones!derivaciones_destinatario_direccion_id_fkey(id, nombre, codigo),
      destinatario_usuario:usuarios!derivaciones_destinatario_usuario_id_fkey(id, nombre_completo, cargo),
      firma_usuario:usuarios!derivaciones_firma_usuario_id_fkey(id, nombre_completo, cargo)
    `)
    .eq('hoja_ruta_id', hrId)
    .order('numero_orden', { ascending: true })

  if (error) {
    console.error('Error al listar derivaciones:', error)
    return []
  }
  return data || []
}

// ============================================
// CONFIRMAR RECEPCIÓN
// ============================================
export async function confirmarRecepcion(
  derivacionId: string,
  hrId: string,
  usuarioId: string,
  datos: AccionResponderForm
): Promise<{ error: string | null }> {
  // 1. Actualizar la derivación
  const { error: errDeriv } = await supabase
    .from('derivaciones')
    .update({
      estado: 'CONFIRMADA',
      cite: datos.cite || null,
      respondiendo_con: datos.respondiendo_con || null,
      fecha_respuesta: new Date().toISOString().split('T')[0]
    })
    .eq('id', derivacionId)

  if (errDeriv) return { error: 'Error al confirmar: ' + errDeriv.message }

  // 2. Actualizar la HR
  const { error: errHR } = await supabase
    .from('hojas_ruta')
    .update({ estado: 'CONFIRMADA' })
    .eq('id', hrId)

  if (errHR) return { error: 'Error al actualizar HR: ' + errHR.message }

  // 3. Registrar en historial
  await supabase.from('historial').insert({
    hoja_ruta_id: hrId,
    usuario_id: usuarioId,
    accion: 'CONFIRMAR',
    detalles: {
      derivacion_id: derivacionId,
      cite: datos.cite,
      comentario: datos.observaciones
    }
  })

  return { error: null }
}

// ============================================
// OBSERVAR
// ============================================
export async function observarHR(
  derivacionId: string,
  hrId: string,
  usuarioId: string,
  observaciones: string
): Promise<{ error: string | null }> {
  const { error: errDeriv } = await supabase
    .from('derivaciones')
    .update({
      estado: 'OBSERVADA',
      respondiendo_con: observaciones,
      fecha_respuesta: new Date().toISOString().split('T')[0]
    })
    .eq('id', derivacionId)

  if (errDeriv) return { error: 'Error al observar: ' + errDeriv.message }

  await supabase
    .from('hojas_ruta')
    .update({ estado: 'OBSERVADA' })
    .eq('id', hrId)

  await supabase.from('historial').insert({
    hoja_ruta_id: hrId,
    usuario_id: usuarioId,
    accion: 'OBSERVAR',
    detalles: { observaciones }
  })

  return { error: null }
}

// ============================================
// RECHAZAR (devuelve al remitente anterior)
// ============================================
export async function rechazarHR(
  derivacionId: string,
  hrId: string,
  usuarioId: string,
  motivo: string
): Promise<{ error: string | null }> {
  // 1. Marcar la derivación actual como RECHAZADA
  const { error: errDeriv } = await supabase
    .from('derivaciones')
    .update({
      estado: 'RECHAZADA',
      respondiendo_con: motivo,
      fecha_respuesta: new Date().toISOString().split('T')[0]
    })
    .eq('id', derivacionId)

  if (errDeriv) return { error: 'Error al rechazar: ' + errDeriv.message }

  // 2. Buscar la derivación anterior para devolver
  const { data: derivActual } = await supabase
    .from('derivaciones')
    .select('numero_orden')
    .eq('id', derivacionId)
    .single()

  if (!derivActual) return { error: 'No se encontró la derivación' }

  const { data: derivAnterior } = await supabase
    .from('derivaciones')
    .select('destinatario_direccion_id, firma_usuario_id, destinatario_nombre, destinatario_cargo')
    .eq('hoja_ruta_id', hrId)
    .eq('numero_orden', derivActual.numero_orden - 1)
    .maybeSingle()

  // 3. Actualizar HR: vuelve al remitente anterior
  const { error: errHR } = await supabase
    .from('hojas_ruta')
    .update({
      estado: 'RECHAZADA',
      direccion_actual_id: derivAnterior?.destinatario_direccion_id || null,
      usuario_actual_id: derivAnterior?.firma_usuario_id || null
    })
    .eq('id', hrId)

  if (errHR) return { error: 'Error al actualizar HR: ' + errHR.message }

  // 4. Historial
  await supabase.from('historial').insert({
    hoja_ruta_id: hrId,
    usuario_id: usuarioId,
    accion: 'RECHAZAR',
    detalles: { motivo }
  })

  // 5. Notificar al remitente anterior
  if (derivAnterior?.firma_usuario_id) {
    await supabase.from('notificaciones').insert({
      usuario_id: derivAnterior.firma_usuario_id,
      hoja_ruta_id: hrId,
      tipo: 'RECHAZADA',
      mensaje: `La Hoja de Ruta fue rechazada. Motivo: ${motivo}`,
      leida: false,
      requiere_modal: true
    })
  }

  return { error: null }
}

// ============================================
// DERIVAR A OTRA DIRECCIÓN
// ============================================
export async function derivarHR(
  hrId: string,
  usuarioId: string,
  direccionOrigenId: string,
  form: AccionDerivarForm
): Promise<{ error: string | null }> {
  // 1. Obtener último número de orden
  const { data: maxOrden } = await supabase
    .from('derivaciones')
    .select('numero_orden')
    .eq('hoja_ruta_id', hrId)
    .order('numero_orden', { ascending: false })
    .limit(1)
    .single()

  const siguienteOrden = (maxOrden?.numero_orden || 0) + 1

  // 2. Obtener nombre de dirección destino
  const { data: dirDestino } = await supabase
    .from('direcciones')
    .select('nombre')
    .eq('id', form.direccion_destino_id)
    .single()

  // 3. Determinar nombre y cargo del destinatario
  let destinatarioNombre = dirDestino?.nombre || ''
  let destinatarioCargo = ''

  if (form.tipo_destinatario === 'PERSONA' && form.destinatario_usuario_id) {
    const { data: userDest } = await supabase
      .from('usuarios')
      .select('nombre_completo, cargo')
      .eq('id', form.destinatario_usuario_id)
      .single()
    if (userDest) {
      destinatarioNombre = userDest.nombre_completo
      destinatarioCargo = userDest.cargo || ''
    }
  }

  const ahora = new Date()
  const fechaHoy = ahora.toISOString().split('T')[0]
  const horaAhora = ahora.toTimeString().split(' ')[0]

  // 4. Crear la nueva derivación
  const { error: errDeriv } = await supabase.from('derivaciones').insert({
    hoja_ruta_id: hrId,
    numero_orden: siguienteOrden,
    destinatario_nombre: destinatarioNombre,
    destinatario_cargo: destinatarioCargo,
    destinatario_direccion_id: form.direccion_destino_id,
    destinatario_usuario_id:
      form.tipo_destinatario === 'PERSONA' ? form.destinatario_usuario_id : null,
    tipo_destinatario: form.tipo_destinatario,
    fecha_ingreso: fechaHoy,
    fecha_remision: fechaHoy,
    hora: horaAhora,
    tipo_original: form.tipo_original,
    tipo_urgente: form.tipo_urgente,
    tipo_copia: form.tipo_copia,
    tipo_fax: form.tipo_fax,
    instrucciones: form.instrucciones,
    cite: form.cite,
    respondiendo_con: form.respondiendo_con || null,
    firma_usuario_id: usuarioId,
    estado: 'PENDIENTE'
  })

  if (errDeriv) return { error: 'Error al derivar: ' + errDeriv.message }

  // 5. Actualizar HR: cambia la dirección actual
  const { error: errHR } = await supabase
    .from('hojas_ruta')
    .update({
      estado: 'PENDIENTE_CONFIRMACION',
      direccion_actual_id: form.direccion_destino_id,
      usuario_actual_id:
        form.tipo_destinatario === 'PERSONA' ? form.destinatario_usuario_id : null
    })
    .eq('id', hrId)

  if (errHR) return { error: 'Error al actualizar HR: ' + errHR.message }

  // 6. Historial
  await supabase.from('historial').insert({
    hoja_ruta_id: hrId,
    usuario_id: usuarioId,
    accion: 'DERIVAR',
    detalles: {
      de: direccionOrigenId,
      a: form.direccion_destino_id,
      cite: form.cite,
      instrucciones: form.instrucciones
    }
  })

  // 7. Notificaciones
  await crearNotificacionesDerivacion(hrId, form, siguienteOrden)

  return { error: null }
}

// ============================================
// CONCLUIR HR
// ============================================
export async function concluirHR(
  hrId: string,
  usuarioId: string,
  observacion: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('hojas_ruta')
    .update({
      estado: 'CONCLUIDA',
      fecha_conclusion: new Date().toISOString(),
      concluida_por: usuarioId,
      observacion_conclusion: observacion
    })
    .eq('id', hrId)

  if (error) return { error: 'Error al concluir: ' + error.message }

  await supabase.from('historial').insert({
    hoja_ruta_id: hrId,
    usuario_id: usuarioId,
    accion: 'CONCLUIR',
    detalles: { observacion }
  })

  return { error: null }
}

// ============================================
// NOTIFICACIONES AL DERIVAR
// ============================================
async function crearNotificacionesDerivacion(
  hrId: string,
  form: AccionDerivarForm,
  orden: number
) {
  const { data: hr } = await supabase
    .from('hojas_ruta')
    .select('numero_unico')
    .eq('id', hrId)
    .single()

  if (!hr) return

  let usuariosDestino: { id: string }[] = []

  if (form.tipo_destinatario === 'PERSONA' && form.destinatario_usuario_id) {
    usuariosDestino = [{ id: form.destinatario_usuario_id }]
  } else {
    const { data } = await supabase
      .from('usuario_direcciones')
      .select('usuario_id')
      .eq('direccion_id', form.direccion_destino_id)
      .eq('activo', true)
    if (data) usuariosDestino = data.map((u) => ({ id: u.usuario_id }))
  }

  if (usuariosDestino.length === 0) return

  const notis = usuariosDestino.map((u) => ({
    usuario_id: u.id,
    hoja_ruta_id: hrId,
    tipo: 'NUEVA_HR',
    mensaje: `Hoja de Ruta ${hr.numero_unico} derivada a tu área (Orden #${orden})`,
    leida: false,
    requiere_modal: true
  }))

  await supabase.from('notificaciones').insert(notis)
}