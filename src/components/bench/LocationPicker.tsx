import { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
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
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onChange={onChange} />
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
