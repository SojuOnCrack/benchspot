const FALLBACK = 'Das hat leider nicht geklappt. Bitte versuche es erneut.'

/** Macht aus Supabase-/Netzwerkfehlern eine kurze, deutsche Meldung für Toasts. */
export function errorMessage(err: unknown, fallback = FALLBACK): string {
  const raw =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : ''
  const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : ''

  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'Keine Verbindung. Bitte prüfe dein Internet.'
  if (/failed to fetch|networkerror|load failed/i.test(raw)) return 'Keine Verbindung. Bitte prüfe dein Internet.'
  if (code === '42501' || /row-level security|permission denied/i.test(raw)) return 'Dafür fehlt dir die Berechtigung.'
  if (code === '23505') return 'Das gibt es bereits.'
  if (/zu viele/i.test(raw)) return 'Du hast gerade sehr viele Bänke angelegt. Bitte versuche es später erneut.'
  if (/jwt|not authenticated|nicht angemeldet/i.test(raw)) return 'Bitte melde dich erneut an.'
  return fallback
}
