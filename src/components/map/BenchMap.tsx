import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useDebounce } from '@/hooks/useDebounce'
import { useBenchesInBounds } from '@/hooks/useBenches'
import type { BenchFilters, MapBounds } from '@/types/database'
import { benchMarkerIcon, userLocationIcon } from './benchIcons'
import BenchMarkerPopup from './BenchMarkerPopup'
import 'leaflet/dist/leaflet.css'

interface BenchMapProps {
  filters: BenchFilters
  userLocation?: { lat: number; lng: number } | null
  onBenchSelect?: (id: string) => void
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
  if (!flownRef.current) {
    map.flyTo([lat, lng], 15, { duration: 1.2 })
    flownRef.current = true
  }
  return null
}

export default function BenchMap({ filters, userLocation, onBenchSelect, className }: BenchMapProps) {
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const debouncedBounds = useDebounce(bounds, 400)

  const { data: benches = [], isFetching } = useBenchesInBounds(debouncedBounds, filters)

  const center = useMemo<[number, number]>(
    () => (userLocation ? [userLocation.lat, userLocation.lng] : [51.1657, 10.4515]), // DE-Mitte fallback
    [userLocation]
  )

  const handleBoundsChange = useCallback((b: MapBounds) => setBounds(b), [])

  return (
    <div className={`relative h-full w-full ${className ?? ''}`}>
      {isFetching && (
        <div className="absolute top-3 right-3 z-[1000] rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-600 shadow-sm backdrop-blur">
          Aktualisiere…
        </div>
      )}
      <MapContainer
        center={center}
        zoom={userLocation ? 15 : 6}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportTracker onBoundsChange={handleBoundsChange} />

        {userLocation && (
          <>
            <FlyToUser lat={userLocation.lat} lng={userLocation.lng} />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
          </>
        )}

        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
          {benches.map((bench) => (
            <Marker
              key={bench.id}
              position={[bench.lat, bench.lng]}
              icon={benchMarkerIcon}
              eventHandlers={{ click: () => onBenchSelect?.(bench.id) }}
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

// verhindert TS "unused" Warnung falls L direkt referenziert werden soll
void L
