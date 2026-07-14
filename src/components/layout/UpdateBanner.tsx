import { RefreshCw } from 'lucide-react'

export default function UpdateBanner() {
  return (
    <div className="pointer-events-auto absolute inset-x-3 top-3 z-[950] flex items-center justify-between gap-3 rounded-xl bg-forest-700 px-4 py-2.5 text-sm text-white shadow-lg">
      <span>Neue Version verfügbar.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 font-medium transition hover:bg-white/25"
      >
        <RefreshCw size={14} />
        Aktualisieren
      </button>
    </div>
  )
}
