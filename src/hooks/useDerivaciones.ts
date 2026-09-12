import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarDerivacionesConRelaciones,
  confirmarRecepcion,
  observarHR,
  rechazarHR,
  derivarHR,
  concluirHR
} from '../services/derivaciones'
import type { AccionDerivarForm, AccionResponderForm } from '../types'

export function useDerivaciones(hrId: string | undefined) {
  return useQuery({
    queryKey: ['derivaciones', hrId],
    queryFn: () => listarDerivacionesConRelaciones(hrId!),
    enabled: !!hrId
  })
}

export function useConfirmarRecepcion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      derivacionId: string
      hrId: string
      usuarioId: string
      datos: AccionResponderForm
    }) =>
      confirmarRecepcion(
        params.derivacionId,
        params.hrId,
        params.usuarioId,
        params.datos
      ).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hoja-ruta', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['derivaciones', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['hojas-ruta'] })
    }
  })
}

export function useObservarHR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      derivacionId: string
      hrId: string
      usuarioId: string
      observaciones: string
    }) =>
      observarHR(
        params.derivacionId,
        params.hrId,
        params.usuarioId,
        params.observaciones
      ).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hoja-ruta', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['derivaciones', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['hojas-ruta'] })
    }
  })
}

export function useRechazarHR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      derivacionId: string
      hrId: string
      usuarioId: string
      motivo: string
    }) =>
      rechazarHR(
        params.derivacionId,
        params.hrId,
        params.usuarioId,
        params.motivo
      ).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hoja-ruta', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['derivaciones', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['hojas-ruta'] })
    }
  })
}

export function useDerivarHR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      hrId: string
      usuarioId: string
      direccionOrigenId: string
      form: AccionDerivarForm
    }) =>
      derivarHR(
        params.hrId,
        params.usuarioId,
        params.direccionOrigenId,
        params.form
      ).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hoja-ruta', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['derivaciones', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['hojas-ruta'] })
    }
  })
}

export function useConcluirHR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      hrId: string
      usuarioId: string
      observacion: string
    }) =>
      concluirHR(params.hrId, params.usuarioId, params.observacion).then((r) => {
        if (r.error) throw new Error(r.error)
        return r
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hoja-ruta', vars.hrId] })
      qc.invalidateQueries({ queryKey: ['hojas-ruta'] })
    }
  })
}