type BadgeTone = 'primary' | 'success' | 'warning' | 'gray'

type BadgeProps = {
  children: React.ReactNode
  tone?: BadgeTone
}

const toneClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  gray: 'bg-gray-100 text-gray-700',
}

export function Badge({ children, tone = 'gray' }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>
}
