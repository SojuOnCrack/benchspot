import { Outlet, Link } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopHeader from './TopHeader'

export default function AppLayout() {
  return (
    <div className="flex h-dvh flex-col bg-sand-50 text-ink-900 dark:bg-ink-900 dark:text-stone-100">
      <TopHeader />
      <main className="relative flex-1 overflow-hidden">
        <Outlet />
        <div className="pointer-events-none absolute bottom-2 left-2 z-[800] flex gap-2 text-[11px] text-stone-500/80 dark:text-stone-400/70">
          <Link to="/impressum" className="pointer-events-auto rounded bg-white/70 px-1.5 py-0.5 backdrop-blur hover:text-stone-800 dark:bg-black/40 dark:hover:text-stone-100">
            Impressum
          </Link>
          <Link to="/datenschutz" className="pointer-events-auto rounded bg-white/70 px-1.5 py-0.5 backdrop-blur hover:text-stone-800 dark:bg-black/40 dark:hover:text-stone-100">
            Datenschutz
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
