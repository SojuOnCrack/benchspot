export interface PlaceResult {
  label: string
  lat: number
  lng: number
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

export async function geocodePlace(query: string): Promise<PlaceResult | null> {
  const search = query.trim()
  if (!search) return null

  const params = new URLSearchParams({
    q: search,
    format: 'jsonv2',
    limit: '1',
    addressdetails: '0',
    'accept-language': 'de',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
  if (!response.ok) return null

  const [result] = await response.json() as NominatimResult[]
  if (!result) return null

  return {
    label: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
  }
}
