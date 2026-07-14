import { Outlet, Link } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopHeader from './TopHeader'
import UpdateBanner from './UpdateBanner'
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck'

export default function AppLayout() {
  const updateAvailable = useAppVersionCheck()

  return (
    <div className="flex h-dvh flex-col bg-sand-50 text-ink-900 dark:bg-ink-900 dark:text-stone-100">
      <TopHeader />
      <main className="relative flex-1 overflow-hidden">
        {updateAvailable && <UpdateBanner />}
        <Outlet />
      </main>
      <footer className="flex shrink-0 items-center justify-center gap-3 border-t border-forest-100 bg-white/95 py-1.5 text-[11px] text-stone-400 backdrop-blur-md dark:border-white/10 dark:bg-ink-900/95 dark:text-stone-500">
        <Link to="/impressum" className="hover:text-stone-700 dark:hover:text-stone-300">Impressum</Link>
        <span aria-hidden="true">·</span>
        <Link to="/datenschutz" className="hover:text-stone-700 dark:hover:text-stone-300">Datenschutz</Link>
      </footer>
      <BottomNav />
    </div>
  )
}
