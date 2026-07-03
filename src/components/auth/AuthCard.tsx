import type { ReactNode } from 'react'
import { TreePine } from 'lucide-react'

export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <TreePine className="text-forest-600" size={32} />
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">{title}</h1>
          <p className="text-sm text-stone-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
