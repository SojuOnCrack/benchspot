import { Link, NavLink, useLocation } from 'react-router-dom'
import { Heart, List, Map, Plus, User } from 'lucide-react'
import { motion } from 'framer-motion'

const baseClass = 'flex min-h-12 min-w-14 flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-xs font-medium transition-colors'
const activeClass = 'text-forest-700 dark:text-forest-200'
const idleClass = 'text-stone-500 dark:text-stone-400'

const linkClass = ({ isActive }: { isActive: boolean }) => `${baseClass} ${isActive ? activeClass : idleClass}`

export default function BottomNav() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const onHome = location.pathname === '/'
  const listView = onHome && params.get('ansicht') === 'liste'
  const query = params.get('q')

  // Suche beim Wechseln zwischen Karte und Liste behalten.
  const homeLink = (list: boolean) => {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    if (list) next.set('ansicht', 'liste')
    const search = next.toString()
    return { pathname: '/', search: search ? `?${search}` : '' }
  }

  return (
    <nav
      aria-label="Hauptnavigation"
      className="relative flex items-center justify-around border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/10 dark:bg-ink-900/95 sm:hidden"
    >
      <Link
        to={homeLink(false)}
        aria-current={onHome && !listView ? 'page' : undefined}
        className={`${baseClass} ${onHome && !listView ? activeClass : idleClass}`}
      >
        <Map size={22} aria-hidden="true" />
        Karte
      </Link>
      <Link
        to={homeLink(true)}
        aria-current={listView ? 'page' : undefined}
        className={`${baseClass} ${listView ? activeClass : idleClass}`}
      >
        <List size={22} aria-hidden="true" />
        Liste
      </Link>

      <NavLink to="/hinzufuegen" aria-label="Bank hinzufügen" className="relative -top-4">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-600 text-white shadow-lg shadow-forest-600/30"
        >
          <Plus size={26} aria-hidden="true" />
        </motion.div>
      </NavLink>

      <NavLink to="/favoriten" className={linkClass}>
        <Heart size={22} aria-hidden="true" />
        Favoriten
      </NavLink>
      <NavLink to="/profil" className={linkClass}>
        <User size={22} aria-hidden="true" />
        Profil
      </NavLink>
    </nav>
  )
}
