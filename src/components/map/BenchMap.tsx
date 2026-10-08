import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useDebounce } from '@/hooks/useDebounce'
import { useBenchesInBounds } from '@/hooks/useBenches'
import { MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '@/lib/mapTiles'
import type { Bench, BenchFilters, MapBounds } from '@/types/database'
import { benchMarkerIcon, userLocationIcon } from './benchIcons'
import BenchMarkerPopup from './BenchMarkerPopup'
import 'leaflet/dist/leaflet.css'

const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY as string | undefined
const tileUrl = mapTilerKey
  ? `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${mapTilerKey}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

interface BenchMapProps {
  filters: BenchFilters
  userLocation?: { lat: number; lng: number } | null
  focusLocation?: { lat: number; lng: number; zoom?: number } | null
  benchesOverride?: Bench[]
  loadingOverride?: boolean
  className?: string
}

function ViewportTracker({ onBoundsChange }: { onBoundsChange: (b: MapBounds) => void }) {
  const reportBounds = useCallback((map: L.Map) => {
    const b = map.getBounds()
    onBoundsChange({
      minLat: b.getSouth(),
      minLng: b.getWest(),
      maxLat: b.getNorth(),
      maxLng: b.getEast(),
    })
  }, [onBoundsChange])

  const map = useMapEvents({
    moveend(e) {
      reportBounds(e.target)
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

function FocusMap({ lat, lng, zoom = 13 }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1 })
  }, [lat, lng, map, zoom])

  return null
}

export default function BenchMap({
  filters,
  userLocation,
  focusLocation,
  benchesOverride,
  loadingOverride,
  className,
}: BenchMapProps) {
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const debouncedBounds = useDebounce(bounds, 400)

  const { data: benches = [], isFetching } = useBenchesInBounds(debouncedBounds, filters)
  const displayedBenches = benchesOverride ?? benches
  const loading = isFetching || Boolean(loadingOverride)

  const center = useMemo<[number, number]>(
    () => {
      if (focusLocation) return [focusLocation.lat, focusLocation.lng]
      if (userLocation) return [userLocation.lat, userLocation.lng]
      return [51.1657, 10.4515]
    },
    [focusLocation, userLocation]
  )

  const handleBoundsChange = useCallback((b: MapBounds) => setBounds(b), [])

  return (
    <div className={`relative h-full w-full ${className ?? ''}`}>
      {loading && (
        <div className="absolute top-3 right-3 z-[1000] rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-600 shadow-sm backdrop-blur">
          Aktualisiere…
        </div>
      )}
      <MapContainer
        center={center}
        zoom={focusLocation?.zoom ?? (userLocation ? 15 : 6)}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        preferCanvas
      >
        <TileLayer
<<<<<<< HEAD
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
          url={tileUrl}
=======
          attribution={MAP_TILE_ATTRIBUTION}
          url={MAP_TILE_URL}
>>>>>>> 4ee86bc252e376d71094589ef2683c021bac92a7
        />
        <ViewportTracker onBoundsChange={handleBoundsChange} />
        {focusLocation && <FocusMap lat={focusLocation.lat} lng={focusLocation.lng} zoom={focusLocation.zoom} />}

        {userLocation && (
          <>
            {!focusLocation && <FlyToUser lat={userLocation.lat} lng={userLocation.lng} />}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
          </>
        )}

        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
          {displayedBenches.map((bench) => (
            <Marker
              key={bench.id}
              position={[bench.lat, bench.lng]}
              icon={benchMarkerIcon}
            >
              <Popup minWidth={220}>
                <BenchMarkerPopup bench={bench} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
