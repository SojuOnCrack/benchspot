const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY as string | undefined

export const MAP_TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ||
  (mapTilerKey
    ? `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${mapTilerKey}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

export const MAP_TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
  (mapTilerKey
    ? '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende')
