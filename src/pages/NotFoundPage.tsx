import { Link } from 'react-router-dom'
import { TreePine } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <TreePine className="text-forest-300" size={40} />
      <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Seite nicht gefunden</h1>
      <Link to="/" className="text-sm font-medium text-forest-600">Zurück zur Karte</Link>
    </div>
  )
}
