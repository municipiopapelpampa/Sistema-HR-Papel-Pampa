import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarNotificaciones,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  marcarModalVisto,
  notificacionesPendientesModal
} from '../services/notificaciones'

// Lista completa
export function useNotificaciones(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['notificaciones', usuarioId],
    queryFn: () => listarNotificaciones(usuarioId!),
    enabled: !!usuarioId,
    refetchInterval: 30000 // refresca cada 30 segundos
  })
}

// Contador de no leídas (para la campana)
export function useContadorNoLeidas(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['notificaciones-count', usuarioId],
    queryFn: () => contarNoLeidas(usuarioId!),
    enabled: !!usuarioId,
    refetchInterval: 30000
  })
}

// Pendientes de mostrar modal
export function useNotificacionesModal(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['notificaciones-modal', usuarioId],
    queryFn: () => notificacionesPendientesModal(usuarioId!),
    enabled: !!usuarioId,
    refetchInterval: 30000
  })
}

// Mutaciones
export function useMarcarComoLeida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      marcarComoLeida(id).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificaciones'] })
      qc.invalidateQueries({ queryKey: ['notificaciones-count'] })
    }
  })
}

export function useMarcarTodasComoLeidas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (usuarioId: string) =>
      marcarTodasComoLeidas(usuarioId).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificaciones'] })
      qc.invalidateQueries({ queryKey: ['notificaciones-count'] })
    }
  })
}

export function useMarcarModalVisto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      marcarModalVisto(id).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificaciones-modal'] })
    }
  })
}

// Refetch al cambiar de pestaña
export function useRefetchOnFocus() {
  const qc = useQueryClient()
  useEffect(() => {
    const onFocus = () => {
      qc.invalidateQueries({ queryKey: ['notificaciones'] })
      qc.invalidateQueries({ queryKey: ['notificaciones-count'] })
      qc.invalidateQueries({ queryKey: ['notificaciones-modal'] })
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [qc])
}