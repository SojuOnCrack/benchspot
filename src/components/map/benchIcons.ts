import L from 'leaflet'

// Divicons statt PNG-Assets: skalierbar, themebar via CSS-Variablen, kein Extra-Request.

export const benchMarkerIcon = L.divIcon({
  className: 'benchspot-marker',
  html: `
    <div class="benchspot-marker__pin">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 11h18v2H3v-2Zm1-4h2v11H4V7Zm14 0h2v11h-2V7ZM3 15h18v2H3v-2Z" fill="currentColor"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
  popupAnchor: [0, -28],
})

export const userLocationIcon = L.divIcon({
  className: 'benchspot-user-marker',
  html: `<div class="benchspot-user-marker__dot"><div class="benchspot-user-marker__pulse"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})
