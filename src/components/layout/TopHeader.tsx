import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { TreePine, Search, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuthContext'

export default function TopHeader() {
  const { theme, toggle } = useTheme()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    navigate({ pathname: '/', search: params.toString() })
  }

  const profileTarget = profile?.role === 'admin' || profile?.role === 'moderator' ? '/admin' : '/profil'

  return (
    <header className="flex items-center justify-between gap-3 border-b border-forest-100 bg-white/90 px-4 py-3 text-stone-800 backdrop-blur-md dark:border-white/10 dark:bg-ink-900/90 dark:text-stone-100">
      <Link to="/" className="flex items-center gap-2 font-semibold text-forest-700 dark:text-forest-200">
        <TreePine size={22} className="shrink-0" />
        <span className="hidden sm:inline">BenchSpot</span>
      </Link>

      <form
        onSubmit={submitSearch}
        className="flex max-w-md flex-1 items-center gap-2 rounded-full border border-forest-100 bg-white px-4 py-2 text-sm text-stone-700 shadow-sm transition focus-within:border-forest-400 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100"
      >
        <Search size={16} className="shrink-0 text-stone-500 dark:text-stone-300" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ort, Stadt oder Eigenschaft suchen..."
          aria-label="Ort, Stadt oder Eigenschaft suchen"
          className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-500 outline-none dark:text-stone-100 dark:placeholder:text-stone-400"
        />
        {location.pathname !== '/' && <button className="sr-only">Suchen</button>}
      </form>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label="Farbschema wechseln"
          className="rounded-full p-2 text-stone-600 transition hover:bg-forest-50 dark:text-stone-200 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user ? (
          <Link to={profileTarget} className="flex items-center gap-2">
            <img
              src={profile?.avatar_url ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${user.id}`}
              alt=""
              className="h-8 w-8 rounded-full border border-forest-100 bg-white object-cover dark:border-white/10"
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
