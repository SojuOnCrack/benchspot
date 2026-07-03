import { NavLink } from 'react-router-dom'
import { Home, Heart, Plus, User, Map } from 'lucide-react'
import { motion } from 'framer-motion'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
    isActive ? 'text-forest-600 dark:text-forest-300' : 'text-stone-400'
  }`

export default function BottomNav() {
  return (
    <nav className="relative flex items-center justify-around border-t border-forest-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/10 dark:bg-ink-900/95 sm:hidden">
      <NavLink to="/" end className={linkClass}>
        <Home size={20} />
        Start
      </NavLink>
      <NavLink to="/" className={linkClass}>
        <Map size={20} />
        Karte
      </NavLink>

      <NavLink to="/hinzufuegen" className="relative -top-4">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-600 text-white shadow-lg shadow-forest-600/30"
        >
          <Plus size={26} />
        </motion.div>
      </NavLink>

      <NavLink to="/favoriten" className={linkClass}>
        <Heart size={20} />
        Favoriten
      </NavLink>
      <NavLink to="/profil" className={linkClass}>
        <User size={20} />
        Profil
      </NavLink>
    </nav>
  )
}
