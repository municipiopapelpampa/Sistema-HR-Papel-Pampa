import { LucideIcon, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  titulo: string
  valor: number
  subtitulo: string
  icono: LucideIcon
  color: 'amber' | 'blue' | 'purple' | 'green'
  to?: string
}

const colores = {
  amber: {
    border: 'border-l-amber-500',
    icono: 'text-amber-600',
    iconoBg: 'bg-amber-100',
    valor: 'text-amber-700'
  },
  blue: {
    border: 'border-l-blue-500',
    icono: 'text-blue-600',
    iconoBg: 'bg-blue-100',
    valor: 'text-blue-700'
  },
  purple: {
    border: 'border-l-purple-500',
    icono: 'text-purple-600',
    iconoBg: 'bg-purple-100',
    valor: 'text-purple-700'
  },
  green: {
    border: 'border-l-green-500',
    icono: 'text-green-600',
    iconoBg: 'bg-green-100',
    valor: 'text-green-700'
  }
}

export default function TarjetaEstadistica({
  titulo,
  valor,
  subtitulo,
  icono: Icono,
  color,
  to
}: Props) {
  const c = colores[color]

  const contenido = (
    <div
      className={`card card-hover p-5 border-l-4 ${c.border} ${
        to ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 ${c.iconoBg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}
        >
          <Icono className={`w-6 h-6 ${c.icono}`} />
        </div>
        {to && (
          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        )}
      </div>
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
        {titulo}
      </p>
      <p className={`text-3xl font-bold ${c.valor} mb-1`}>{valor}</p>
      <p className="text-xs text-neutral-500">{subtitulo}</p>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="group block">
        {contenido}
      </Link>
    )
  }

  // Sin enlace, pero con efecto hover
  return <div className="group">{contenido}</div>
}