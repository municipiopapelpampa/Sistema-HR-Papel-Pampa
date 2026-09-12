import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarUsuarios,
  crearUsuario,
  eliminarUsuario,
  listarRoles,
  listarDirecciones,
  toggleActivoUsuario,
  CrearUsuarioInput
} from '../services/usuarios'

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