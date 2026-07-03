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
    setState((s) => ({ ...s, error: err.message, loading: false }))
  }, [])

  const canUseGeolocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Geolocation wird nicht unterstuetzt', loading: false }))
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
