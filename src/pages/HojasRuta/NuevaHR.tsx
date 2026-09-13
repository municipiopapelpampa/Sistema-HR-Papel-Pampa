import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, FileText, Send, User, Briefcase } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDirecciones, useUsuariosDeDireccion } from '../../hooks/useDirecciones'
import { useCrearHojaRuta } from '../../hooks/useHojasRuta'
import { subirArchivo, guardarDocumento } from '../../services/storage'
import AdjuntosHR from '../../components/hr/AdjuntosHR'
import Layout from '../../components/layout/Layout'
import type { TipoDestinatario } from '../../types'

const schema = z.object({
  numero_fojas: z.coerce.number().min(1, 'Mínimo 1 foja').max(999),
  remitente_nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  remitente_cargo: z.string().min(3, 'Mínimo 3 caracteres'),
  descripcion_contenido: z.string().min(10, 'Mínimo 10 caracteres'),
  tipo_destinatario: z.enum(['DIRECCION', 'PERSONA']),
  destinatario_direccion_id: z.string().uuid('Selecciona una dirección'),
  destinatario_usuario_id: z.string().optional(),
  instrucciones: z.string().min(5, 'Mínimo 5 caracteres'),
  tipo_original: z.boolean(),
  tipo_urgente: z.boolean(),
  tipo_copia: z.boolean(),
  tipo_fax: z.boolean()
})

type FormData = z.infer<typeof schema>

// Título de sección reutilizable
function SeccionTitulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-neutral-200 pb-2 mb-4 flex items-center gap-2">
      {children}
    </h2>
  )
}

export default function NuevaHR() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: direcciones = [] } = useDirecciones()
  const [archivos, setArchivos] = useState<File[]>([])
  const [enviando, setEnviando] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      numero_fojas: 1,
      remitente_nombre: '',
      remitente_cargo: '',
      tipo_destinatario: 'DIRECCION',
      tipo_original: true,
      tipo_urgente: false,
      tipo_copia: false,
      tipo_fax: false,
      instrucciones: ''
    }
  })

  // ✅ Autocompletar datos del remitente cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      reset({
        numero_fojas: 1,
        remitente_nombre: user.nombre_completo || '',
        remitente_cargo: user.cargo || '',
        tipo_destinatario: 'DIRECCION',
        tipo_original: true,
        tipo_urgente: false,
        tipo_copia: false,
        tipo_fax: false,
        instrucciones: ''
      })
    }
  }, [user, reset])

  const tipoDest = watch('tipo_destinatario')
  const dirDestId = watch('destinatario_direccion_id')

  const { data: usuariosDir = [] } = useUsuariosDeDireccion(
    tipoDest === 'PERSONA' ? dirDestId : undefined
  )

  // Autocompletar destinatario cuando se elige dirección
  useEffect(() => {
    if (tipoDest === 'DIRECCION' && dirDestId) {
      const dir = direcciones.find((d) => d.id === dirDestId)
      if (dir) {
        setValue('destinatario_nombre' as any, dir.nombre)
        setValue('destinatario_cargo' as any, `Responsable de ${dir.codigo}`)
      }
    }
  }, [dirDestId, tipoDest, direcciones, setValue])

  const crearMutation = useCrearHojaRuta()

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión')
      return
    }
    if (!user.direccion_principal) {
      toast.error('No tienes una dirección principal asignada')
      return
    }
    if (tipoDest === 'PERSONA' && !data.destinatario_usuario_id) {
      toast.error('Selecciona una persona específica')
      return
    }

    setEnviando(true)

    try {
      const result = await crearMutation.mutateAsync({
        form: {
          numero_fojas: data.numero_fojas,
          remitente_nombre: data.remitente_nombre,
          remitente_cargo: data.remitente_cargo,
          descripcion_contenido: data.descripcion_contenido,
          tipo_destinatario: data.tipo_destinatario as TipoDestinatario,
          destinatario_direccion_id: data.destinatario_direccion_id,
          destinatario_usuario_id: data.destinatario_usuario_id,
          tipo_original: data.tipo_original,
          tipo_urgente: data.tipo_urgente,
          tipo_copia: data.tipo_copia,
          tipo_fax: data.tipo_fax,
          instrucciones: data.instrucciones
        },
        usuarioId: user.id,
        direccionOrigenId: user.direccion_principal.id
      })

      if (archivos.length > 0 && result) {
        for (const file of archivos) {
          const { path, error } = await subirArchivo(file, result.numero_unico)
          if (error) {
            toast.error(`Error al subir "${file.name}": ${error}`)
            continue
          }
          await guardarDocumento({
            hoja_ruta_id: result.id,
            nombre_original: file.name,
            nombre_storage: path,
            tipo_mime: file.type,
            tamano_bytes: file.size,
            subido_por: user.id
          })
        }
      }

      toast.success(`Hoja de Ruta ${result.numero_unico} creada correctamente`)
      navigate('/hojas-ruta')
    } catch (e: any) {
      toast.error(e.message || 'Error al crear la hoja de ruta')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout titulo="Nueva Hoja de Ruta">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-700" />
              Nueva Hoja de Ruta
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Complete los datos para generar una nueva hoja de ruta
            </p>
          </div>
          <button
            onClick={() => navigate('/hojas-ruta')}
            className="btn-outline flex items-center gap-2 w-fit"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          {/* BLOQUE: Recepción */}
          <div className="card p-6">
            <SeccionTitulo>Datos de Recepción</SeccionTitulo>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="label-field">N° Correlativo</label>
                <input
                  type="text"
                  disabled
                  value="(Automático)"
                  className="input-field bg-neutral-100 text-neutral-500"
                />
              </div>
              <div>
                <label className="label-field">Fecha</label>
                <input
                  type="text"
                  disabled
                  value={new Date().toLocaleDateString('es-BO')}
                  className="input-field bg-neutral-100 text-neutral-500"
                />
              </div>
              <div>
                <label className="label-field">Hora</label>
                <input
                  type="text"
                  disabled
                  value={new Date().toLocaleTimeString('es-BO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  className="input-field bg-neutral-100 text-neutral-500"
                />
              </div>
              <div>
                <label className="label-field">N° de Hojas *</label>
                <input
                  type="number"
                  min={1}
                  {...register('numero_fojas')}
                  className="input-field"
                />
                {errors.numero_fojas && (
                  <p className="text-xs text-accent-600 mt-1">
                    {errors.numero_fojas.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BLOQUE: Remitente */}
          <div className="card p-6">
            <SeccionTitulo>Datos del Remitente</SeccionTitulo>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Nombre *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    {...register('remitente_nombre')}
                    className="input-field pl-10"
                  />
                </div>
                {errors.remitente_nombre && (
                  <p className="text-xs text-accent-600 mt-1">
                    {errors.remitente_nombre.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label-field">Cargo / Institución *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    {...register('remitente_cargo')}
                    className="input-field pl-10"
                  />
                </div>
                {errors.remitente_cargo && (
                  <p className="text-xs text-accent-600 mt-1">
                    {errors.remitente_cargo.message}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-3 flex items-start gap-1.5">
              <span>💡</span>
              <span>
                Puedes modificar el nombre y cargo si la HR la envía otra
                persona en representación tuya.
              </span>
            </p>
          </div>

          {/* BLOQUE: Descripción */}
          <div className="card p-6">
            <SeccionTitulo>Descripción del Contenido</SeccionTitulo>
            <textarea
              rows={4}
              {...register('descripcion_contenido')}
              placeholder="Describa el contenido o asunto de la hoja de ruta..."
              className="input-field resize-none"
            />
            {errors.descripcion_contenido && (
              <p className="text-xs text-accent-600 mt-1">
                {errors.descripcion_contenido.message}
              </p>
            )}
          </div>

          {/* BLOQUE: Destinatario */}
          <div className="card p-6">
            <SeccionTitulo>Destinatario</SeccionTitulo>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Tipo de destinatario</label>
                <div className="flex gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="DIRECCION"
                      {...register('tipo_destinatario')}
                      className="w-4 h-4 text-primary-700 focus:ring-primary-500/30"
                    />
                    <span className="text-sm text-neutral-700">
                      Dirección completa
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="PERSONA"
                      {...register('tipo_destinatario')}
                      className="w-4 h-4 text-primary-700 focus:ring-primary-500/30"
                    />
                    <span className="text-sm text-neutral-700">
                      Persona específica
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label-field">Dirección destino *</label>
                <select
                  {...register('destinatario_direccion_id')}
                  className="input-field"
                >
                  <option value="">-- Selecciona --</option>
                  {direcciones.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.codigo} - {d.nombre}
                    </option>
                  ))}
                </select>
                {errors.destinatario_direccion_id && (
                  <p className="text-xs text-accent-600 mt-1">
                    {errors.destinatario_direccion_id.message}
                  </p>
                )}
              </div>
            </div>

            {tipoDest === 'PERSONA' && (
              <div className="mt-4">
                <label className="label-field">Persona específica *</label>
                <select
                  {...register('destinatario_usuario_id')}
                  className="input-field"
                >
                  <option value="">-- Selecciona --</option>
                  {usuariosDir.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} {u.cargo ? `(${u.cargo})` : ''}
                    </option>
                  ))}
                </select>
                {usuariosDir.length === 0 && dirDestId && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ No hay usuarios en esta dirección
                  </p>
                )}
              </div>
            )}
          </div>

          {/* BLOQUE: Tipo de envío */}
          <div className="card p-6">
            <SeccionTitulo>Tipo de Envío</SeccionTitulo>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('tipo_original')}
                  className="w-4 h-4 text-primary-700 rounded focus:ring-primary-500/30"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Original
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('tipo_urgente')}
                  className="w-4 h-4 text-accent-600 rounded focus:ring-accent-500/30"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Urgente
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('tipo_copia')}
                  className="w-4 h-4 text-secondary-700 rounded focus:ring-secondary-500/30"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Copia
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('tipo_fax')}
                  className="w-4 h-4 text-neutral-500 rounded focus:ring-neutral-400/30"
                />
                <span className="text-sm font-medium text-neutral-700">Fax</span>
              </label>
            </div>
          </div>

          {/* BLOQUE: Instrucciones */}
          <div className="card p-6">
            <SeccionTitulo>Instrucciones</SeccionTitulo>
            <textarea
              rows={4}
              {...register('instrucciones')}
              placeholder="Instrucciones para el destinatario..."
              className="input-field resize-none"
            />
            {errors.instrucciones && (
              <p className="text-xs text-accent-600 mt-1">
                {errors.instrucciones.message}
              </p>
            )}
          </div>

          {/* BLOQUE: Adjuntos */}
          <div className="card p-6">
            <SeccionTitulo>Documentos Adjuntos</SeccionTitulo>
            <AdjuntosHR
              archivos={archivos}
              onChange={setArchivos}
              maxArchivos={5}
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/hojas-ruta')}
              className="btn-outline"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="btn-primary"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Crear y Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}