import { Link } from 'react-router-dom'
import { TreePine, Search, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'

export default function TopHeader() {
  const { theme, toggle } = useTheme()
  const { user, profile } = useAuth()

  return (
    <header className="flex items-center justify-between gap-3 border-b border-forest-100 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-ink-900/80">
      <Link to="/" className="flex items-center gap-2 font-semibold text-forest-700 dark:text-forest-200">
        <TreePine size={22} className="shrink-0" />
        <span className="hidden sm:inline">BenchSpot</span>
      </Link>

      <button
        type="button"
        className="flex flex-1 max-w-md items-center gap-2 rounded-full border border-forest-100 bg-forest-50/60 px-4 py-2 text-sm text-stone-500 transition hover:border-forest-200 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
      >
        <Search size={16} />
        <span>Ort, Stadt oder Eigenschaft suchen…</span>
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label="Farbschema wechseln"
          className="rounded-full p-2 text-stone-500 transition hover:bg-forest-50 dark:text-stone-300 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user ? (
          <Link to="/profil" className="flex items-center gap-2">
            <img
              src={profile?.avatar_url ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${user.id}`}
              alt=""
              className="h-8 w-8 rounded-full border border-forest-100 object-cover"
            />
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-forest-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-forest-700"
          >
            Anmelden
          </Link>
        )}
      </div>
    </header>
  )
}
