import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { dismissToast, getToasts, subscribeToasts, type ToastItem, type ToastKind } from '@/lib/toast'

const DURATION_MS: Record<ToastKind, number> = { success: 4000, info: 5000, error: 7000 }

const ICON = {
  success: <CheckCircle2 size={20} className="text-forest-600 dark:text-forest-300" aria-hidden="true" />,
  info: <Info size={20} className="text-sky-600 dark:text-sky-300" aria-hidden="true" />,
  error: <TriangleAlert size={20} className="text-red-600 dark:text-red-400" aria-hidden="true" />,
}

function ToastView({ item }: { item: ToastItem }) {
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (paused) return
    const timer = window.setTimeout(() => dismissToast(item.id), DURATION_MS[item.kind])
    return () => window.clearTimeout(timer)
  }, [item.id, item.kind, paused])

  return (
    <motion.li
      layout={!reduceMotion}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      transition={{ duration: 0.18 }}
      role={item.kind === 'error' ? 'alert' : 'status'}
      // Nur mit echter Maus pausieren; Touch-Geräte lösen sonst „hängende“ Hover-Zustände aus.
      onPointerEnter={(event) => event.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-stone-200 bg-white py-3 pl-4 pr-1 text-sm text-stone-800 shadow-lg shadow-black/15 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100"
    >
      <span className="mt-0.5 shrink-0">{ICON[item.kind]}</span>
      <p className="min-w-0 flex-1 py-0.5 leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        aria-label="Meldung schließen"
        className="-my-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </motion.li>
  )
}

export default function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts)

  return (
    <ul
      aria-label="Benachrichtigungen"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-[1200] sm:bottom-14 mx-auto flex w-[min(calc(100%-2rem),26rem)] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <ToastView key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </ul>
  )
}
