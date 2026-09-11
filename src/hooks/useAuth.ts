import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { UsuarioConRol } from '../types'

export function useAuth() {
  const [user, setUser] = useState<UsuarioConRol | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = useCallback(async (authUserId: string) => {
    // Cargar perfil desde public.usuarios
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        rol:roles(*)
      `)
      .eq('auth_user_id', authUserId)
      .eq('activo', true)
      .single()

    if (error || !usuario) {
      console.error('Error al cargar perfil:', error)
      setUser(null)
      return null
    }

    // Cargar dirección principal
    const { data: dirData } = await supabase
      .from('usuario_direcciones')
      .select(`
        es_principal,
        cargo_direccion,
        direccion:direcciones(*)
      `)
      .eq('usuario_id', usuario.id)
      .eq('es_principal', true)
      .maybeSingle()

    const perfilCompleto: UsuarioConRol = {
      ...usuario,
      direccion_principal: dirData?.direccion || null
    }

    setUser(perfilCompleto)
    return perfilCompleto
  }, [])

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await loadUserProfile(session.user.id)
    } else {
      setUser(null)
    }
  }, [loadUserProfile])

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserProfile])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setLoading(false)
      return { error: traducirError(error.message) }
    }

    if (data.user) {
      await loadUserProfile(data.user.id)
      // Actualizar último acceso
      await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('auth_user_id', data.user.id)
    }

    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signIn, signOut, refreshUser }
}

// Traducir mensajes de error de Supabase al español
function traducirError(msg: string): string {
  const errores: Record<string, string> = {
    'Invalid login credentials': 'Credenciales inválidas. Verifica tu correo y contraseña.',
    'Email not confirmed': 'El correo no ha sido confirmado.',
    'Too many requests': 'Demasiados intentos. Espera un momento.',
    'User not found': 'Usuario no encontrado.',
  }
  return errores[msg] || msg
}