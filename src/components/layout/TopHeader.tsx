import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { TreePine, Search, Moon, Sun, ShieldCheck, UserRound, ChevronDown, X } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import Avatar from '@/components/ui/Avatar'

export default function TopHeader() {
  const { theme, toggle } = useTheme()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query, 450)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const urlQuery = searchParams.get('q') ?? ''
  const pushedQuery = useRef(urlQuery)
  const listView = searchParams.get('ansicht')

  useEffect(() => {
    if (urlQuery === pushedQuery.current) return
    pushedQuery.current = urlQuery
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    const nextQuery = debouncedQuery.trim()
    const currentQuery = urlQuery
    if (nextQuery === currentQuery) return
    if (!nextQuery && !currentQuery && location.pathname === '/') return

    pushedQuery.current = nextQuery
    const params = new URLSearchParams()
    if (nextQuery) params.set('q', nextQuery)
    if (listView) params.set('ansicht', listView)
    navigate({ pathname: '/', search: params.toString() }, { replace: location.pathname === '/' })
  }, [debouncedQuery, listView, location.pathname, navigate, urlQuery])

  useEffect(() => {
    if (!menuOpen) return
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    pushedQuery.current = query.trim()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (listView) params.set('ansicht', listView)
    navigate({ pathname: '/', search: params.toString() })
  }

  const isPrivileged = profile?.role === 'admin' || profile?.role === 'moderator'

  return (
    <header className="relative z-[1100] flex items-center justify-between gap-3 border-b border-forest-100 bg-white/90 px-4 py-3 text-stone-800 backdrop-blur-md dark:border-white/10 dark:bg-ink-900/90 dark:text-stone-100">
      <Link to="/" aria-label="BenchSpot – zur Startseite" className="flex h-10 items-center gap-2 font-semibold text-forest-700 dark:text-forest-200">
        <TreePine size={24} className="shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">BenchSpot</span>
      </Link>

      <form
        onSubmit={submitSearch}
        role="search"
        className="flex h-10 min-w-0 max-w-md flex-1 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-700 shadow-sm transition focus-within:border-forest-400 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100"
      >
        <Search size={16} className="shrink-0 text-stone-500 dark:text-stone-300" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ort oder Bank suchen…"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          aria-label="Ort, Stadt oder Eigenschaft suchen"
          className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-500 outline-none dark:text-stone-100 dark:placeholder:text-stone-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Suche löschen"
            className="-mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
        {location.pathname !== '/' && <button className="sr-only">Suchen</button>}
      </form>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label="Farbschema wechseln"
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-forest-50 dark:text-stone-200 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
        {user ? (
          isPrivileged ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Kontomenü"
                className="flex items-center gap-1 rounded-full pr-1 transition hover:bg-forest-50 dark:hover:bg-white/10"
              >
                <Avatar profile={profile} userId={user.id} />
                <ChevronDown size={14} className={`text-stone-500 transition-transform dark:text-stone-300 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-forest-100 bg-white py-1 text-sm shadow-lg dark:border-white/10 dark:bg-stone-900"
                >
                  <Link
                    to="/admin"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-stone-700 transition hover:bg-forest-50 dark:text-stone-100 dark:hover:bg-white/10"
                  >
                    <ShieldCheck size={16} className="text-forest-600 dark:text-forest-300" />
                    Admin
                  </Link>
                  <Link
                    to="/profil"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-stone-700 transition hover:bg-forest-50 dark:text-stone-100 dark:hover:bg-white/10"
                  >
                    <UserRound size={16} className="text-forest-600 dark:text-forest-300" />
                    Profil
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/profil" aria-label="Profil" className="flex items-center gap-2">
              <Avatar profile={profile} userId={user.id} />
            </Link>
          )
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
