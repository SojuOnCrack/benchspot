# BenchSpot

Community-Plattform zum Finden und Teilen von Parkbänken.

## Setup

```bash
npm install
cp .env.example .env   # Supabase-Projekt-URL + Anon Key eintragen
npm run dev
```

Supabase-Schema anlegen:

```bash
supabase link --project-ref <ref>
supabase db push   # führt supabase/migrations/*.sql aus
```

Erfordert die PostGIS-Extension (in Migration 0001 aktiviert) für Umkreis-/Bounding-Box-Abfragen.

Google/GitHub OAuth: in Supabase Dashboard → Authentication → Providers konfigurieren,
Redirect-URL `https://<domain>/auth/callback`.

## Architekturentscheidungen

- **Viewport-basiertes Laden statt "alle Bänke laden"**: `benches_in_bbox` RPC liefert nur Marker im sichtbaren Kartenausschnitt (debounced `moveend`), damit die Karte bei tausenden Einträgen performant bleibt. Clustering via `react-leaflet-cluster`.
- **PostGIS `geography(point)`**: erlaubt exakte Entfernungsberechnung (`benches_nearby`) statt Haversine im Client.
- **RLS auf jeder Tabelle**: Lesen ist öffentlich für veröffentlichte Inhalte, Schreiben ist strikt auf `auth.uid()` beschränkt. Admin/Moderator-Rechte über `profiles.role`.
- **Aggregatfelder (`avg_rating`, `rating_count`, `favorite_count`, `bench_count`) via DB-Trigger** statt Client-seitiger Berechnung – konsistent auch bei direkten SQL-Änderungen, keine Race Conditions.
- **Bild-Kompression im Browser vor Upload** (`PhotoUploader`, Canvas-Resize auf max. 2000px, JPEG q0.82), um Storage-Kosten und Ladezeit zu reduzieren.
- **Divicon-Marker statt PNG-Assets**: Theme-Farben via CSS-Variablen, kein zusätzlicher Netzwerk-Request pro Icon.
- **Lazy-loading aller Seiten** (`React.lazy`) + manualChunks für react/leaflet/query-vendor, um die initiale Bundle-Größe klein zu halten (Lighthouse-Ziel).
- **Mobile-first Layout**: Bottom-Nav + FAB nur `sm:hidden`, Desktop nutzt den Header als primäre Navigation.

## Offene Punkte für die nächste Iteration

- Foto-Upload nach Supabase Storage anbinden (`bench-photos` Bucket ist per Migration angelegt, Upload-Call fehlt noch in `AddBenchPage`)
- Bewertungs- und Kommentar-UI auf der Detailseite
- Admin-Dashboard (gemeldete Inhalte, Nutzer sperren)
- Volltextsuche (Ort/Stadt/Eigenschaft) im Header
- Service Worker für Offline-Hinweis + Asset-Caching
- QR-Code- und GPX-Export je Bank




----------------------------------------------------------
