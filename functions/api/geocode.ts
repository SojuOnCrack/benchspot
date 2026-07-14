interface Env {
  // keine Secrets noetig, Nominatim braucht nur eine gueltige Kennung
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const q = url.searchParams.get('q')?.trim()

  if (!q) {
    return new Response(JSON.stringify(null), {
      headers: { 'content-type': 'application/json' },
    })
  }

  const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
  nominatimUrl.searchParams.set('q', q)
  nominatimUrl.searchParams.set('format', 'jsonv2')
  nominatimUrl.searchParams.set('limit', '1')
  nominatimUrl.searchParams.set('addressdetails', '0')
  nominatimUrl.searchParams.set('accept-language', 'de')
  // Nominatim-Nutzungsrichtlinie verlangt eine identifizierende Kennung.
  // -> ersetzt durch eine echte Kontakt-URL/E-Mail vor Launch.
  nominatimUrl.searchParams.set('email', 'kontakt@benchspots.magicthedrinkering.com')

  const response = await fetch(nominatimUrl.toString(), {
    headers: {
      // Custom User-Agent ist aus dem Browser nicht setzbar, hier (server-seitig) schon.
      'User-Agent': 'BenchSpot/1.0 (https://benchspots.magicthedrinkering.com)',
    },
  })

  if (!response.ok) {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  const results = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>
  const [result] = results
  const place = result
    ? { label: result.display_name, lat: Number(result.lat), lng: Number(result.lon) }
    : null

  return new Response(JSON.stringify(place), {
    headers: {
      'content-type': 'application/json',
      // 1 Anfrage/Sekunde-Limit von Nominatim -> serverseitig cachen, damit
      // wiederholte Suchen (gleiche Stadt, mehrere Nutzer) nicht erneut anfragen.
      'cache-control': 'public, max-age=3600',
    },
  })
}
