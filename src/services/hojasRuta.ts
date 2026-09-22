import { supabase } from '../lib/supabase'
import type {
  HojaRuta,
  HojaRutaConRelaciones,
  NuevaHRForm,
  Derivacion,
  Gestion
} from '../types'

// ============================================
// TIPOS DE FILTROS
// ============================================
export interface FiltrosHR {
  busqueda?: string
  estado?: string
  direccionId?: string
  fechaDesde?: string
  fechaHasta?: string
  tipo?: 'ORIGINAL' | 'URGENTE' | 'COPIA' | 'FAX'
  orden?: 'RECIENTES' | 'ANTIGUAS' | 'NUMERO_ASC' | 'NUMERO_DESC'
  pagina?: number
  porPagina?: number
}

export interface ResultadoListaHR {
  datos: HojaRutaConRelaciones[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

// ============================================
// OBTENER GESTIÓN ACTIVA
// ============================================
export async function obtenerGestionActiva(): Promise<Gestion | null> {
  const { data, error } = await supabase
    .from('gestiones')
    .select('*')
    .eq('estado', 'ACTIVA')
    .single()

  if (error) {
    console.error('Error al obtener gestión activa:', error)
    return null
  }
  return data
}

// ============================================
// GENERAR NÚMERO CORRELATIVO
// ============================================
export async function generarNumeroHR(gestionId: string) {
  const { data, error } = await supabase.rpc('generar_numero_hr', {
    p_gestion_id: gestionId
  })

  if (error || !data || data.length === 0) {
    throw new Error(
      'No se pudo generar el número de HR: ' + (error?.message || 'sin datos')
    )
  }

  return data[0] as { numero_correlativo: string; numero_unico: string }
}

// ============================================
// CREAR HOJA DE RUTA
// ============================================
export async function crearHojaRuta(
  form: NuevaHRForm,
  usuarioId: string,
  direccionOrigenId: string
): Promise<{ data: HojaRuta | null; error: string | null }> {
  try {
    // 1. Obtener gestión activa
    const gestion = await obtenerGestionActiva()
    if (!gestion) {
      return {
        data: null,
        error: 'No hay una gestión activa. Contacta al administrador.'
      }
    }

    // 2. Generar número correlativo
    const { numero_correlativo, numero_unico } = await generarNumeroHR(gestion.id)

    // 3. Preparar datos
    const ahora = new Date()
    const fechaRecepcion = ahora.toISOString().split('T')[0]
    const horaRecepcion = ahora.toTimeString().split(' ')[0]

    // 4. Determinar datos del destinatario
    let destinatarioNombre = form.destinatario_nombre || ''
    let destinatarioCargo = form.destinatario_cargo || ''

    // Si es por dirección → autocompletar con datos de la dirección
    if (form.tipo_destinatario === 'DIRECCION') {
      const { data: dir } = await supabase
        .from('direcciones')
        .select('nombre, codigo')
        .eq('id', form.destinatario_direccion_id)
        .single()

      if (dir) {
        destinatarioNombre = dir.nombre
        destinatarioCargo = `Responsable de ${dir.codigo}`
      }
    }

    // Si es por persona específica → buscar datos de la persona
    if (form.tipo_destinatario === 'PERSONA' && form.destinatario_usuario_id) {
      const { data: usuarioDest } = await supabase
        .from('usuarios')
        .select('nombre_completo, cargo')
        .eq('id', form.destinatario_usuario_id)
        .single()

      if (usuarioDest) {
        destinatarioNombre = usuarioDest.nombre_completo
        destinatarioCargo = usuarioDest.cargo || ''
      }
    }

    // 5. Insertar HR
    const { data: hr, error: hrError } = await supabase
      .from('hojas_ruta')
      .insert({
        gestion_id: gestion.id,
        numero_correlativo,
        numero_unico,
        fecha_recepcion: fechaRecepcion,
        hora_recepcion: horaRecepcion,
        numero_fojas: form.numero_fojas,
        remitente_nombre: form.remitente_nombre,
        remitente_cargo: form.remitente_cargo,
        remitente_usuario_id: usuarioId,
        descripcion_contenido: form.descripcion_contenido,
        destinatario_nombre: destinatarioNombre,
        destinatario_cargo: destinatarioCargo,
        destinatario_direccion_id: form.destinatario_direccion_id,
        tipo_destinatario: form.tipo_destinatario,
        tipo_original: form.tipo_original,
        tipo_urgente: form.tipo_urgente,
        tipo_copia: form.tipo_copia,
        tipo_fax: form.tipo_fax,
        estado: 'PENDIENTE_CONFIRMACION',
        direccion_actual_id: form.destinatario_direccion_id,
        usuario_actual_id:
          form.tipo_destinatario === 'PERSONA'
            ? form.destinatario_usuario_id
            : null
      })
      .select()
      .single()

    if (hrError || !hr) {
      return { data: null, error: 'Error al crear HR: ' + hrError?.message }
    }

    // 6. Crear la primera derivación
    await supabase.from('derivaciones').insert({
      hoja_ruta_id: hr.id,
      numero_orden: 1,
      destinatario_nombre: destinatarioNombre,
      destinatario_cargo: destinatarioCargo,
      destinatario_direccion_id: form.destinatario_direccion_id,
      destinatario_usuario_id:
        form.tipo_destinatario === 'PERSONA'
          ? form.destinatario_usuario_id
          : null,
      tipo_destinatario: form.tipo_destinatario,
      fecha_ingreso: fechaRecepcion,
      fecha_remision: fechaRecepcion,
      hora: horaRecepcion,
      tipo_original: form.tipo_original,
      tipo_urgente: form.tipo_urgente,
      tipo_copia: form.tipo_copia,
      tipo_fax: form.tipo_fax,
      instrucciones: form.instrucciones,
      firma_usuario_id: usuarioId,
      estado: 'PENDIENTE'
    })

    // 7. Registrar en historial
    await supabase.from('historial').insert({
      hoja_ruta_id: hr.id,
      usuario_id: usuarioId,
      accion: 'CREAR',
      detalles: {
        numero_unico,
        destinatario: destinatarioNombre,
        direccion_origen: direccionOrigenId
      }
    })

    // 8. Crear notificaciones para los destinatarios
    await crearNotificacionesDestinatarios(hr.id, numero_unico, form)

    return { data: hr, error: null }
  } catch (e: any) {
    console.error('Error en crearHojaRuta:', e)
    return { data: null, error: e.message || 'Error desconocido' }
  }
}

// ============================================
// NOTIFICACIONES AL CREAR
// ============================================
async function crearNotificacionesDestinatarios(
  hrId: string,
  numeroUnico: string,
  form: NuevaHRForm
) {
  let usuariosDestino: { id: string }[] = []

  if (form.tipo_destinatario === 'PERSONA' && form.destinatario_usuario_id) {
    usuariosDestino = [{ id: form.destinatario_usuario_id }]
  } else {
    const { data } = await supabase
      .from('usuario_direcciones')
      .select('usuario_id')
      .eq('direccion_id', form.destinatario_direccion_id)
      .eq('activo', true)

    if (data) {
      usuariosDestino = data.map((u) => ({ id: u.usuario_id }))
    }
  }

  if (usuariosDestino.length === 0) return

  const notificaciones = usuariosDestino.map((u) => ({
    usuario_id: u.id,
    hoja_ruta_id: hrId,
    tipo: 'NUEVA_HR',
    mensaje: `Nueva Hoja de Ruta ${numeroUnico} pendiente de confirmar`,
    leida: false,
    requiere_modal: true
  }))

  await supabase.from('notificaciones').insert(notificaciones)
}

// ============================================
// LISTAR HOJAS DE RUTA CON FILTROS Y PAGINACIÓN
// ============================================
export async function listarHojasRuta(
  filtros?: FiltrosHR
): Promise<ResultadoListaHR> {
  const pagina = filtros?.pagina || 1
  const porPagina = filtros?.porPagina || 10
  const desde = (pagina - 1) * porPagina
  const hasta = desde + porPagina - 1

  let query = supabase
    .from('hojas_ruta')
    .select(
      `
      *,
      remitente:usuarios!hojas_ruta_remitente_usuario_id_fkey(id, nombre_completo, email),
      direccion_actual:direcciones!hojas_ruta_direccion_actual_id_fkey(id, nombre, codigo),
      destinatario_direccion:direcciones!hojas_ruta_destinatario_direccion_id_fkey(id, nombre, codigo),
      gestion:gestiones!hojas_ruta_gestion_id_fkey(id, anio, estado)
    `,
      { count: 'exact' }
    )

  if (filtros?.busqueda && filtros.busqueda.trim()) {
    const b = filtros.busqueda.trim()
    query = query.or(
      `numero_unico.ilike.%${b}%,remitente_nombre.ilike.%${b}%,descripcion_contenido.ilike.%${b}%`
    )
  }

  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado)
  }

  if (filtros?.direccionId) {
    query = query.eq('direccion_actual_id', filtros.direccionId)
  }

  if (filtros?.fechaDesde) {
    query = query.gte('fecha_recepcion', filtros.fechaDesde)
  }

  if (filtros?.fechaHasta) {
    query = query.lte('fecha_recepcion', filtros.fechaHasta)
  }

  if (filtros?.tipo === 'ORIGINAL') query = query.eq('tipo_original', true)
  if (filtros?.tipo === 'URGENTE') query = query.eq('tipo_urgente', true)
  if (filtros?.tipo === 'COPIA') query = query.eq('tipo_copia', true)
  if (filtros?.tipo === 'FAX') query = query.eq('tipo_fax', true)

  switch (filtros?.orden) {
    case 'ANTIGUAS':
      query = query.order('created_at', { ascending: true })
      break
    case 'NUMERO_ASC':
      query = query.order('numero_unico', { ascending: true })
      break
    case 'NUMERO_DESC':
      query = query.order('numero_unico', { ascending: false })
      break
    case 'RECIENTES':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  query = query.range(desde, hasta)

  const { data, error, count } = await query

  if (error) {
    console.error('Error al listar HR:', error)
    return { datos: [], total: 0, pagina, porPagina, totalPaginas: 0 }
  }

  const total = count || 0
  const totalPaginas = Math.ceil(total / porPagina)

  return {
    datos: (data || []) as HojaRutaConRelaciones[],
    total,
    pagina,
    porPagina,
    totalPaginas
  }
}

// ============================================
// OBTENER HR POR ID
// ============================================
export async function obtenerHojaRuta(
  id: string
): Promise<HojaRutaConRelaciones | null> {
  const { data, error } = await supabase
    .from('hojas_ruta')
    .select(
      `
      *,
      remitente:usuarios!hojas_ruta_remitente_usuario_id_fkey(id, nombre_completo, email, cargo),
      direccion_actual:direcciones!hojas_ruta_direccion_actual_id_fkey(id, nombre, codigo),
      destinatario_direccion:direcciones!hojas_ruta_destinatario_direccion_id_fkey(id, nombre, codigo),
      documentos:documentos(*),
      gestion:gestiones!hojas_ruta_gestion_id_fkey(id, anio, estado)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error al obtener HR:', error)
    return null
  }
  return data
}

// ============================================
// LISTAR DERIVACIONES DE UNA HR
// ============================================
export async function listarDerivaciones(hrId: string): Promise<Derivacion[]> {
  const { data, error } = await supabase
    .from('derivaciones')
    .select('*')
    .eq('hoja_ruta_id', hrId)
    .order('numero_orden', { ascending: true })

  if (error) {
    console.error('Error al listar derivaciones:', error)
    return []
  }
  return data || []
}