import { Outlet, Link } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopHeader from './TopHeader'
import UpdateBanner from './UpdateBanner'
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck'

export default function AppLayout() {
  const updateAvailable = useAppVersionCheck()

  return (
    <div className="flex h-dvh flex-col bg-sand-50 text-ink-900 dark:bg-ink-900 dark:text-stone-100">
      <a
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-full focus:bg-forest-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Zum Inhalt springen
      </a>
      <TopHeader />
      <main id="main" tabIndex={-1} className="relative flex-1 overflow-hidden outline-none">
        {updateAvailable && <UpdateBanner />}
        <Outlet />
      </main>
      <footer className="flex shrink-0 items-center justify-center max-sm:justify-between max-sm:px-6 gap-1 border-t border-stone-200 bg-white/95 text-xs text-stone-600 backdrop-blur-md dark:border-white/10 dark:bg-ink-900/95 dark:text-stone-400">
        <Link to="/impressum" className="px-2 py-1.5 hover:text-stone-900 dark:hover:text-stone-200">Impressum</Link>
        <span aria-hidden="true">·</span>
        <Link to="/datenschutz" className="px-2 py-1.5 hover:text-stone-900 dark:hover:text-stone-200">Datenschutz</Link>
      </footer>
      <BottomNav />
    </div>
  )
}
