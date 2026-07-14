import { useEffect, useState } from 'react'

const CHECK_INTERVAL_MS = 5 * 60_000 // alle 5 Minuten

export function useAppVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function checkVersion() {
      try {
        const response = await fetch('/version.json', { cache: 'no-store' })
        if (!response.ok) return
        const { buildId } = (await response.json()) as { buildId: string }
        if (!cancelled && buildId !== __APP_BUILD_ID__) {
          setUpdateAvailable(true)
        }
      } catch {
        // Netzwerkfehler ignorieren, naechster Poll versucht es erneut
      }
    }

    checkVersion()
    const interval = setInterval(checkVersion, CHECK_INTERVAL_MS)
    const onFocus = () => checkVersion()
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return updateAvailable
}
