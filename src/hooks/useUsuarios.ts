import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  listarUsuarios,
  crearUsuario,
  eliminarUsuario,
  listarRoles,
  listarDirecciones,
  toggleActivoUsuario,
  crearDireccion,
  editarDireccion,
  toggleActivoDireccion,
  listarTodasDirecciones,
  type CrearUsuarioInput,
  type CrearDireccionInput,
  type EditarDireccionInput
} from '../services/usuarios'
import type { Usuario } from '../types'

// ============================================
// USUARIOS
// ============================================
export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: listarRoles,
    staleTime: 1000 * 60 * 30
  })
}

export function useDireccionesAdmin() {
  return useQuery({
    queryKey: ['direcciones-admin'],
    queryFn: listarDirecciones,
    staleTime: 1000 * 60 * 30
  })
}

export function useCrearUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CrearUsuarioInput) =>
      crearUsuario(input).then((r) => {
        if (r.error) throw new Error(r.error)
        return r.data
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
    }
  })
}

export function useEliminarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      eliminarUsuario(id).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
    }
  })
}

export function useToggleActivoUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: string; activo: boolean }) =>
      toggleActivoUsuario(params.id, params.activo).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
    }
  })
}

// ============================================
// USUARIOS POR DIRECCIÓN (para DetalleHR)
// ============================================
export function useUsuariosDeDireccionAdmin(direccionId: string | undefined) {
  return useQuery<Usuario[]>({
    queryKey: ['usuarios-direccion-admin', direccionId],
    queryFn: async () => {
      if (!direccionId) return []
      const { data, error } = await supabase
        .from('usuario_direcciones')
        .select(`
          usuario:usuarios!inner(id, nombre_completo, email, cargo, activo)
        `)
        .eq('direccion_id', direccionId)
        .eq('activo', true)

      if (error) return []

      // @ts-ignore
      return (data || [])
        .map((d) => d.usuario as unknown as Usuario)
        .filter((u) => u.activo)
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))
    },
    enabled: !!direccionId
  })
}

// ============================================
// DIRECCIONES (admin)
// ============================================
export function useTodasDirecciones() {
  return useQuery({
    queryKey: ['direcciones-todas'],
    queryFn: listarTodasDirecciones
  })
}

export function useCrearDireccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CrearDireccionInput) =>
      crearDireccion(input).then((r) => {
        if (r.error) throw new Error(r.error)
        return r.data!
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['direcciones'] })
      qc.invalidateQueries({ queryKey: ['direcciones-admin'] })
      qc.invalidateQueries({ queryKey: ['direcciones-todas'] })
    }
  })
}

export function useEditarDireccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EditarDireccionInput) =>
      editarDireccion(input).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['direcciones'] })
      qc.invalidateQueries({ queryKey: ['direcciones-admin'] })
      qc.invalidateQueries({ queryKey: ['direcciones-todas'] })
    }
  })
}

export function useToggleActivoDireccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: string; activo: boolean }) =>
      toggleActivoDireccion(params.id, params.activo).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['direcciones'] })
      qc.invalidateQueries({ queryKey: ['direcciones-admin'] })
      qc.invalidateQueries({ queryKey: ['direcciones-todas'] })
    }
  })
}
/*Verificar actividad de usuario (para saber si se puede eliminar) */
import { verificarActividadUsuario } from '../services/usuarios'

export function useActividadUsuario(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['usuario-actividad', usuarioId],
    queryFn: () => verificarActividadUsuario(usuarioId!),
    enabled: !!usuarioId
  })
}