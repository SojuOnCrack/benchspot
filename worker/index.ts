// Cloudflare Worker: liefert die statische SPA (dist/) aus und stellt /api/geocode bereit.
// SPA-Fallback übernimmt wrangler.jsonc (assets.not_found_handling = "single-page-application").

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  })

async function geocode(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get('q')?.trim()
  if (!q) return json(null)

  const nominatim = new URL('https://nominatim.openstreetmap.org/search')
  nominatim.searchParams.set('q', q)
  nominatim.searchParams.set('format', 'jsonv2')
  nominatim.searchParams.set('limit', '1')
  nominatim.searchParams.set('addressdetails', '0')
  nominatim.searchParams.set('accept-language', 'de')
  // Nominatim-Nutzungsrichtlinie: identifizierende Kennung -> vor Launch durch echte Kontaktadresse ersetzen.
  nominatim.searchParams.set('email', 'kontakt@benchspots.magicthedrinkering.com')

  const response = await fetch(nominatim.toString(), {
    headers: { 'User-Agent': 'BenchSpot/1.0 (https://benchspots.magicthedrinkering.com)' },
  })
  if (!response.ok) return json(null)

  const results = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>
  const [result] = results
  const place = result ? { label: result.display_name, lat: Number(result.lat), lng: Number(result.lon) } : null
  return json(place, { headers: { 'cache-control': 'public, max-age=3600' } })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/geocode' && request.method === 'GET') return geocode(request)
    return env.ASSETS.fetch(request)
  },
}
