import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarGestiones,
  obtenerGestionActiva,
  contarHRPorGestion,
  crearGestion,
  cerrarGestion,
  reabrirGestion
} from '../services/gestiones'

export function useGestiones() {
  return useQuery({
    queryKey: ['gestiones'],
    queryFn: listarGestiones
  })
}

export function useGestionActivaQuery() {
  return useQuery({
    queryKey: ['gestion-activa-admin'],
    queryFn: obtenerGestionActiva
  })
}

export function useContarHRGestion(gestionId: string | undefined) {
  return useQuery({
    queryKey: ['gestion-hr-count', gestionId],
    queryFn: () => contarHRPorGestion(gestionId!),
    enabled: !!gestionId
  })
}

export function useCrearGestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (anio: number) =>
      crearGestion(anio).then((r) => {
        if (r.error) throw new Error(r.error)
        return r.data!
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gestiones'] })
      qc.invalidateQueries({ queryKey: ['gestion-activa-admin'] })
      qc.invalidateQueries({ queryKey: ['gestion-activa'] })
    }
  })
}

export function useCerrarGestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      cerrarGestion(id).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gestiones'] })
      qc.invalidateQueries({ queryKey: ['gestion-activa-admin'] })
      qc.invalidateQueries({ queryKey: ['gestion-activa'] })
    }
  })
}

export function useReabrirGestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      reabrirGestion(id).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gestiones'] })
      qc.invalidateQueries({ queryKey: ['gestion-activa-admin'] })
      qc.invalidateQueries({ queryKey: ['gestion-activa'] })
    }
  })
}