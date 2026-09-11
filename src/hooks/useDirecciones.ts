import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Direccion, Usuario } from '../types'

export function useDirecciones() {
  return useQuery({
    queryKey: ['direcciones'],
    queryFn: async (): Promise<Direccion[]> => {
      const { data, error } = await supabase
        .from('direcciones')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      return data || []
    }
  })
}

export function useUsuariosDeDireccion(direccionId: string | undefined) {
  return useQuery({
    queryKey: ['usuarios-direccion', direccionId],
    queryFn: async (): Promise<Usuario[]> => {
      if (!direccionId) return []
      const { data, error } = await supabase
        .from('usuario_direcciones')
        .select(`
          usuario:usuarios!inner(id, nombre_completo, email, cargo, activo)
        `)
        .eq('direccion_id', direccionId)
        .eq('activo', true)
      if (error) throw error

      // @ts-ignore
      return data.map((d) => d.usuario).filter((u) => u.activo)
    },
    enabled: !!direccionId
  })
}