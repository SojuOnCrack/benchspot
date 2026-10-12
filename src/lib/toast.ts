// Kleiner globaler Toast-Store (ohne Context), damit auch außerhalb von React
// (z. B. im QueryClient) Meldungen ausgelöst werden können.

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

const MAX_VISIBLE = 3
let toasts: ToastItem[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getToasts() {
  return toasts
}

export function dismissToast(id: number) {
  const next = toasts.filter((item) => item.id !== id)
  if (next.length === toasts.length) return
  toasts = next
  emit()
}

function push(kind: ToastKind, message: string) {
  // Gleiche Meldung nicht doppelt stapeln (z. B. mehrere fehlschlagende Anfragen gleichzeitig).
  if (toasts.some((item) => item.kind === kind && item.message === message)) return
  toasts = [...toasts, { id: nextId++, kind, message }].slice(-MAX_VISIBLE)
  emit()
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
  info: (message: string) => push('info', message),
}
