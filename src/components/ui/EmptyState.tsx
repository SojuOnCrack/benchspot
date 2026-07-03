import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="rounded-full bg-forest-50 p-4 text-forest-500 dark:bg-white/5">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-semibold text-stone-700 dark:text-stone-200">{title}</h3>
      {description && <p className="max-w-xs text-sm text-stone-500">{description}</p>}
      {action}
    </div>
  )
}
