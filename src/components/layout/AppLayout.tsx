import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopHeader from './TopHeader'

export default function AppLayout() {
  return (
    <div className="flex h-dvh flex-col bg-sand-50 text-ink-900">
      <TopHeader />
      <main className="relative flex-1 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
