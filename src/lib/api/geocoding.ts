export interface PlaceResult {
  label: string
  lat: number
  lng: number
}

const KNOWN_PLACES: Record<string, PlaceResult> = {
  berlin: { label: 'Berlin, Deutschland', lat: 52.517, lng: 13.3889 },
  hamburg: { label: 'Hamburg, Deutschland', lat: 53.5503, lng: 10.0007 },
  muenchen: { label: 'München, Deutschland', lat: 48.1371, lng: 11.5754 },
  munchen: { label: 'München, Deutschland', lat: 48.1371, lng: 11.5754 },
  koeln: { label: 'Köln, Deutschland', lat: 50.9375, lng: 6.9603 },
  koln: { label: 'Köln, Deutschland', lat: 50.9375, lng: 6.9603 },
  frankfurt: { label: 'Frankfurt am Main, Deutschland', lat: 50.1109, lng: 8.6821 },
  stuttgart: { label: 'Stuttgart, Deutschland', lat: 48.7784, lng: 9.1800 },
  duesseldorf: { label: 'Düsseldorf, Deutschland', lat: 51.2254, lng: 6.7763 },
  dusseldorf: { label: 'Düsseldorf, Deutschland', lat: 51.2254, lng: 6.7763 },
  dortmund: { label: 'Dortmund, Deutschland', lat: 51.5136, lng: 7.4653 },
  essen: { label: 'Essen, Deutschland', lat: 51.4556, lng: 7.0116 },
  leipzig: { label: 'Leipzig, Deutschland', lat: 51.3402, lng: 12.3731 },
  bremen: { label: 'Bremen, Deutschland', lat: 53.0758, lng: 8.8072 },
  dresden: { label: 'Dresden, Deutschland', lat: 51.0504, lng: 13.7373 },
  hannover: { label: 'Hannover, Deutschland', lat: 52.3759, lng: 9.7320 },
  nuernberg: { label: 'Nürnberg, Deutschland', lat: 49.4521, lng: 11.0767 },
  nurnberg: { label: 'Nürnberg, Deutschland', lat: 49.4521, lng: 11.0767 },
}

function normalizePlaceQuery(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export async function geocodePlace(query: string): Promise<PlaceResult | null> {
  const search = query.trim()
  if (!search) return null
  const knownPlace = KNOWN_PLACES[normalizePlaceQuery(search)]
  if (knownPlace) return knownPlace

  // Laeuft ueber unsere eigene Cloudflare Pages Function (functions/api/geocode.ts),
  // die Nominatim server-seitig anfragt. Direkte Browser-Aufrufe gegen
  // nominatim.openstreetmap.org werden von deren CORS/Rate-Limit haeufig blockiert.
  const response = await fetch(`/api/geocode?q=${encodeURIComponent(search)}`)
  if (!response.ok) return null

  const result = (await response.json()) as PlaceResult | null
  return result
}
