import { useCallback, useEffect, useState } from 'react'

interface GeoState {
  lat: number | null
  lng: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
}

export function useGeolocation(watch = false, requestOnMount = false) {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: false,
  })

  const applyPosition = useCallback((pos: GeolocationPosition) => {
    setState({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      error: null,
      loading: false,
    })
  }, [])

  const applyError = useCallback((err: GeolocationPositionError) => {
    const message =
      err.code === err.PERMISSION_DENIED
        ? 'Standortzugriff wurde verweigert. Bitte in den Browser-Einstellungen erlauben.'
        : err.code === err.TIMEOUT
          ? 'Standort konnte nicht rechtzeitig ermittelt werden.'
          : 'Standort ist derzeit nicht verfügbar.'
    setState((s) => ({ ...s, error: message, loading: false }))
  }, [])

  const canUseGeolocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Standortermittlung wird von diesem Browser nicht unterstützt.', loading: false }))
      return false
    }

    if (!window.isSecureContext) {
      setState((s) => ({
        ...s,
        error: 'Standortzugriff braucht HTTPS oder localhost.',
        loading: false,
      }))
      return false
    }

    return true
  }, [])

  const requestLocation = useCallback(() => {
    if (!canUseGeolocation()) return

    setState((s) => ({ ...s, error: null, loading: true }))
    navigator.geolocation.getCurrentPosition(applyPosition, applyError, GEO_OPTIONS)
  }, [applyError, applyPosition, canUseGeolocation])

  useEffect(() => {
    if (!watch) {
      if (requestOnMount) requestLocation()
      return
    }

    if (!canUseGeolocation()) return

    setState((s) => ({ ...s, error: null, loading: true }))
    const id = navigator.geolocation.watchPosition(applyPosition, applyError, GEO_OPTIONS)
    return () => navigator.geolocation.clearWatch(id)
  }, [applyError, applyPosition, canUseGeolocation, requestLocation, requestOnMount, watch])

  return { ...state, requestLocation }
}
