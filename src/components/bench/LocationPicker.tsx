import { useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import type { DragEndEvent } from 'leaflet'
import { benchMarkerIcon } from '@/components/map/benchIcons'

interface LocationPickerProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true })
  }, [lat, lng, map])

  return null
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const marker = e.target
      const pos = marker.getLatLng()
      onChange(pos.lat, pos.lng)
    },
    [onChange]
  )

  return (
    <div className="h-56 overflow-hidden rounded-2xl border border-forest-100">
      <MapContainer center={[lat, lng]} zoom={16} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer url={import.meta.env.VITE_MAPTILER_KEY ? `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}` : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
        <ClickHandler onChange={onChange} />
        <RecenterMap lat={lat} lng={lng} />
        <Marker
          position={[lat, lng]}
          icon={benchMarkerIcon}
          draggable
          eventHandlers={{ dragend: handleDragEnd }}
        />
      </MapContainer>
    </div>
  )
}
