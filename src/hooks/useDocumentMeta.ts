import { useEffect } from 'react'

interface DocumentMetaOptions {
  title: string
  description?: string
}

const DEFAULT_TITLE = 'BenchSpot – Finde die perfekte Parkbank'
const DEFAULT_DESCRIPTION = 'BenchSpot – Finde die perfekte Parkbank, überall.'

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) ?? document.querySelector(`meta[property="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      tag.setAttribute('property', name)
    } else {
      tag.setAttribute('name', name)
    }
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Setzt document.title + meta description/OG-Tags fuer die aktuelle Route.
 *
 * Wichtig: Das aendert nur das DOM im Browser (gut fuer Tab-Titel, Verlauf,
 * Lesezeichen, navigator.share). Social-Media-Crawler (WhatsApp, Discord,
 * Facebook, Slack) fuehren i.d.R. KEIN JavaScript aus und sehen weiterhin
 * nur die statischen Tags aus index.html. Fuer echte Link-Vorschaukarten
 * pro Bank braucht es serverseitiges Rendering/Prerendering der
 * /bank/:id-Route (z.B. ueber einen Cloudflare Worker, der Bot-User-Agents
 * abfaengt und vorgerendertes HTML ausliefert).
 */
export function useDocumentMeta({ title, description }: DocumentMetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} · BenchSpot` : DEFAULT_TITLE
    const desc = description ?? DEFAULT_DESCRIPTION

    document.title = fullTitle
    setMetaTag('description', desc)
    setMetaTag('og:title', fullTitle)
    setMetaTag('og:description', desc)
    setMetaTag('twitter:title', fullTitle)
    setMetaTag('twitter:description', desc)

    return () => {
      document.title = DEFAULT_TITLE
      setMetaTag('description', DEFAULT_DESCRIPTION)
      setMetaTag('og:title', DEFAULT_TITLE)
      setMetaTag('og:description', DEFAULT_DESCRIPTION)
      setMetaTag('twitter:title', DEFAULT_TITLE)
      setMetaTag('twitter:description', DEFAULT_DESCRIPTION)
    }
  }, [title, description])
}
