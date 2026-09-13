import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarHojasRuta,
  obtenerHojaRuta,
  crearHojaRuta,
  listarDerivaciones,
  obtenerGestionActiva,
  type FiltrosHR
} from '../services/hojasRuta'
import type { NuevaHRForm } from '../types'

export function useHojasRuta(filtros?: FiltrosHR) {
  return useQuery({
    queryKey: ['hojas-ruta', filtros],
    queryFn: () => listarHojasRuta(filtros)
  })
}

export function useHojaRuta(id: string | undefined) {
  return useQuery({
    queryKey: ['hoja-ruta', id],
    queryFn: () => obtenerHojaRuta(id!),
    enabled: !!id
  })
}

export function useDerivaciones(hrId: string | undefined) {
  return useQuery({
    queryKey: ['derivaciones', hrId],
    queryFn: () => listarDerivaciones(hrId!),
    enabled: !!hrId
  })
}

export function useGestionActiva() {
  return useQuery({
    queryKey: ['gestion-activa'],
    queryFn: obtenerGestionActiva
  })
}

export function useCrearHojaRuta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      form: NuevaHRForm
      usuarioId: string
      direccionOrigenId: string
    }) => {
      const result = await crearHojaRuta(
        params.form,
        params.usuarioId,
        params.direccionOrigenId
      )
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hojas-ruta'] })
    }
  })
}