import { useEffect, useState } from 'react'

interface GeoState {
  lat: number | null
  lng: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(watch = false) {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Geolocation wird nicht unterstützt', loading: false }))
      return
    }

    const onSuccess = (pos: GeolocationPosition) => {
      setState({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        error: null,
        loading: false,
      })
    }
    const onError = (err: GeolocationPositionError) => {
      setState((s) => ({ ...s, error: err.message, loading: false }))
    }

    const options: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }

    if (watch) {
      const id = navigator.geolocation.watchPosition(onSuccess, onError, options)
      return () => navigator.geolocation.clearWatch(id)
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
  }, [watch])

  return state
}
