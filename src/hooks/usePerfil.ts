import { useMutation } from '@tanstack/react-query'
import {
  actualizarPerfil,
  cambiarPassword,
  registrarCambioPassword
} from '../services/perfil'

export function useActualizarPerfil() {
  return useMutation({
    mutationFn: (params: {
      usuarioId: string
      nombre_completo: string
      cargo: string
    }) =>
      actualizarPerfil(params).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      })
  })
}

export function useCambiarPassword() {
  return useMutation({
    mutationFn: async (params: {
      email: string
      passwordActual: string
      passwordNueva: string
      usuarioId: string
    }) => {
      const result = await cambiarPassword(
        params.email,
        params.passwordActual,
        params.passwordNueva
      )
      if (result.error) throw new Error(result.error)

      await registrarCambioPassword(params.usuarioId)
      return result
    }
  })
}