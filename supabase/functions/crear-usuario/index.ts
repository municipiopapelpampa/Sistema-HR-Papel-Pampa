import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface CrearUsuarioPayload {
  email: string
  password: string
  nombre_completo: string
  cargo: string
  rol_id: string
  direccion_id: string
  cargo_direccion?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: authUser }, error: authError } =
      await supabaseUser.auth.getUser()

    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: perfil } = await supabaseAdmin
      .from('usuarios')
      .select('id, rol:roles!inner(nombre, puede_admin)')
      .eq('auth_user_id', authUser.id)
      .single()

    // @ts-ignore
    if (!perfil?.rol?.puede_admin) {
      return new Response(
        JSON.stringify({ error: 'No tienes permiso para crear usuarios' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: CrearUsuarioPayload = await req.json()

    if (!body.email || !body.password || !body.nombre_completo || !body.rol_id) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos obligatorios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: newAuth, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { nombre_completo: body.nombre_completo },
      })

    if (createError || !newAuth.user) {
      return new Response(
        JSON.stringify({ error: createError?.message || 'Error al crear usuario' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: nuevoPerfil, error: perfilError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_user_id: newAuth.user.id,
        nombre_completo: body.nombre_completo,
        email: body.email,
        cargo: body.cargo,
        rol_id: body.rol_id,
        activo: true,
        debe_cambiar_password: true,
      })
      .select()
      .single()

    if (perfilError || !nuevoPerfil) {
      await supabaseAdmin.auth.admin.deleteUser(newAuth.user.id)
      return new Response(
        JSON.stringify({ error: perfilError?.message || 'Error al crear perfil' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.direccion_id) {
      await supabaseAdmin.from('usuario_direcciones').insert({
        usuario_id: nuevoPerfil.id,
        direccion_id: body.direccion_id,
        es_principal: true,
        cargo_direccion: body.cargo_direccion || body.cargo,
        activo: true,
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        usuario: nuevoPerfil,
        message: 'Usuario creado correctamente',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    console.error('Error:', e)
    return new Response(
      JSON.stringify({ error: e.message || 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})