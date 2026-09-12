import { supabase } from '../lib/supabase'

// ============================================
// ACTUALIZAR DATOS DEL PERFIL
// ============================================
export async function actualizarPerfil(params: {
  usuarioId: string
  nombre_completo: string
  cargo: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('usuarios')
    .update({
      nombre_completo: params.nombre_completo,
      cargo: params.cargo
    })
    .eq('id', params.usuarioId)

  return { error: error?.message || null }
}

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================
export async function cambiarPassword(
  email: string,
  passwordActual: string,
  passwordNueva: string
): Promise<{ error: string | null }> {
  // 1. Verificar contraseña actual
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: passwordActual
  })

  if (signInError) {
    return { error: 'La contraseña actual es incorrecta' }
  }

  // 2. Actualizar contraseña
  const { error: updateError } = await supabase.auth.updateUser({
    password: passwordNueva
  })

  if (updateError) {
    return { error: 'Error al cambiar contraseña: ' + updateError.message }
  }

  return { error: null }
}

// ============================================
// REGISTRAR CAMBIO EN HISTORIAL
// ============================================
export async function registrarCambioPassword(
  usuarioId: string
): Promise<void> {
  await supabase.from('historial').insert({
    usuario_id: usuarioId,
    hoja_ruta_id: null,
    accion: 'CAMBIO_PASSWORD',
    detalles: { fecha: new Date().toISOString() }
  })
}