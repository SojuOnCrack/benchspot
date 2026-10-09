import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useDebounce } from '@/hooks/useDebounce'
import { useBenchesInBounds } from '@/hooks/useBenches'
import { MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '@/lib/mapTiles'
import type { Bench, BenchFilters, MapBounds } from '@/types/database'
import { benchMarkerIcon, userLocationIcon } from './benchIcons'
import BenchMarkerPopup from './BenchMarkerPopup'
import 'leaflet/dist/leaflet.css'

export interface MapFocus {
  lat: number
  lng: number
  zoom?: number
  /** Ändert sich, wenn dieselbe Position erneut angesteuert werden soll. */
  nonce?: number
}

export interface MapResults {
  benches: Bench[]
  loading: boolean
  error: boolean
  refetch: () => unknown
}

interface BenchMapProps {
  filters: BenchFilters
  userLocation?: { lat: number; lng: number } | null
  focusLocation?: MapFocus | null
  benchesOverride?: Bench[]
  loadingOverride?: boolean
  onResults?: (results: MapResults) => void
  className?: string
}

const NO_BENCHES: Bench[] = []
const DEFAULT_CENTER: [number, number] = [51.1657, 10.4515]
const DEFAULT_ZOOM = 6
const VIEW_STORAGE_KEY = 'benchspot:map-view'

interface SavedView {
  lat: number
  lng: number
  zoom: number
}

// Kartenausschnitt merken, damit "Zurück" von der Detailseite nicht wieder ganz Deutschland zeigt.
function readSavedView(): SavedView | null {
  try {
    const raw = sessionStorage.getItem(VIEW_STORAGE_KEY)
    if (!raw) return null
    const view = JSON.parse(raw) as SavedView
    return [view.lat, view.lng, view.zoom].every(Number.isFinite) ? view : null
  } catch {
    return null
  }
}

function saveView(map: L.Map) {
  try {
    const center = map.getCenter()
    sessionStorage.setItem(
      VIEW_STORAGE_KEY,
      JSON.stringify({ lat: center.lat, lng: center.lng, zoom: map.getZoom() })
    )
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus) – dann eben ohne Merken.
  }
}

// Auf ~100 m auf-/abrunden: kleine Kartenbewegungen treffen dann denselben Cache-Eintrag.
const floor3 = (n: number) => Math.floor(n * 1000) / 1000
const ceil3 = (n: number) => Math.ceil(n * 1000) / 1000

function ViewportTracker({ onBoundsChange }: { onBoundsChange: (b: MapBounds) => void }) {
  const reportBounds = useCallback(
    (map: L.Map) => {
      const b = map.getBounds()
      onBoundsChange({
        minLat: floor3(b.getSouth()),
        minLng: floor3(b.getWest()),
        maxLat: ceil3(b.getNorth()),
        maxLng: ceil3(b.getEast()),
      })
    },
    [onBoundsChange]
  )

  const map = useMapEvents({
    moveend(e) {
      reportBounds(e.target)
      saveView(e.target)
    },
  })

  useEffect(() => {
    reportBounds(map)
  }, [map, reportBounds])

  return null
}

function FlyToUser({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const flownRef = useRef(false)

  useEffect(() => {
    if (flownRef.current) return
    map.flyTo([lat, lng], 15, { duration: 1.2 })
    flownRef.current = true
  }, [lat, lng, map])

  return null
}

function FocusMap({ lat, lng, zoom = 13, nonce }: MapFocus) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1 })
  }, [lat, lng, map, zoom, nonce])

  return null
}

const BenchMarker = memo(function BenchMarker({ bench }: { bench: Bench }) {
  // Stabile Position: sonst setzt react-leaflet bei jedem Render alle Marker neu.
  const lat = bench.lat
  const lng = bench.lng
  const positionRef = useRef<[number, number]>([lat, lng])
  if (positionRef.current[0] !== lat || positionRef.current[1] !== lng) positionRef.current = [lat, lng]

  return (
    <Marker position={positionRef.current} icon={benchMarkerIcon} title={bench.title} alt={bench.title}>
      <Popup minWidth={220}>
        <BenchMarkerPopup bench={bench} />
      </Popup>
    </Marker>
  )
})

const BenchMarkers = memo(function BenchMarkers({ benches }: { benches: Bench[] }) {
  return (
    <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
      {benches.map((bench) => (
        <BenchMarker key={bench.id} bench={bench} />
      ))}
    </MarkerClusterGroup>
  )
})

function BenchMap({
  filters,
  userLocation,
  focusLocation,
  benchesOverride,
  loadingOverride,
  onResults,
  className,
}: BenchMapProps) {
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const debouncedBounds = useDebounce(bounds, 400)

  const {
    data: benches = NO_BENCHES,
    isFetching,
    isError,
    refetch,
  } = useBenchesInBounds(debouncedBounds, filters)
  const displayedBenches = benchesOverride ?? benches
  const waitingForBounds = debouncedBounds === null && !benchesOverride
  const loading = isFetching || Boolean(loadingOverride) || waitingForBounds
  const error = isError && !benchesOverride

  // Startansicht nur einmal bestimmen (MapContainer liest center/zoom nur beim Mount).
  const [initialView] = useState(() => {
    if (focusLocation) {
      return { center: [focusLocation.lat, focusLocation.lng] as [number, number], zoom: focusLocation.zoom ?? 13 }
    }
    if (userLocation) return { center: [userLocation.lat, userLocation.lng] as [number, number], zoom: 15 }
    const saved = readSavedView()
    if (saved) return { center: [saved.lat, saved.lng] as [number, number], zoom: saved.zoom }
    return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM }
  })

  useEffect(() => {
    onResults?.({ benches: displayedBenches, loading, error, refetch })
  }, [displayedBenches, loading, error, refetch, onResults])

  const handleBoundsChange = useCallback((b: MapBounds) => setBounds(b), [])

  return (
    <div className={`relative isolate h-full w-full ${className ?? ''}`}>
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-16 z-[1000] -translate-x-1/2 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-stone-700 shadow-md backdrop-blur dark:bg-stone-900/95 dark:text-stone-100"
        >
          Aktualisiere…
        </div>
      )}
      <MapContainer
        center={initialView.center}
        zoom={initialView.zoom}
        minZoom={3}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        preferCanvas
      >
        <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />
        <ZoomControl position="topright" zoomInTitle="Hineinzoomen" zoomOutTitle="Herauszoomen" />
        <ViewportTracker onBoundsChange={handleBoundsChange} />
        {focusLocation && (
          <FocusMap
            lat={focusLocation.lat}
            lng={focusLocation.lng}
            zoom={focusLocation.zoom}
            nonce={focusLocation.nonce}
          />
        )}

        {userLocation && (
          <>
            {!focusLocation && <FlyToUser lat={userLocation.lat} lng={userLocation.lng} />}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
              title="Dein Standort"
              alt="Dein Standort"
              interactive={false}
            />
          </>
        )}

        <BenchMarkers benches={displayedBenches} />
      </MapContainer>
    </div>
  )
}

export default memo(BenchMap)
