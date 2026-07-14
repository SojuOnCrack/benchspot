import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function ImpressumPage() {
  useDocumentMeta({ title: 'Impressum' })

  return (
    <div className="mx-auto h-full max-w-xl overflow-y-auto px-4 py-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-600">
        <ArrowLeft size={16} /> Zurück
      </Link>

      <h1 className="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">Impressum</h1>

      <div className="space-y-4 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ Platzhalter – vor Launch mit echten Angaben nach §5 DDG ersetzen.
        </p>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">Angaben gemäß §5 DDG</h2>
          <p>
            [Vor- und Nachname bzw. Firmenname]
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ und Ort]
            <br />
            [Land]
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">Kontakt</h2>
          <p>
            E-Mail: [kontakt@example.com]
            <br />
            [Optional: Telefonnummer]
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p>[Name, Anschrift wie oben – falls abweichend]</p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">Hinweis zu nutzergenerierten Inhalten</h2>
          <p>
            BenchSpot ermöglicht Nutzer:innen das Hochladen von Bank-Einträgen, Fotos und Kommentaren. Für diese
            fremden Inhalte übernehmen wir keine Gewähr. Bei Kenntnis von Rechtsverletzungen werden entsprechende
            Inhalte umgehend entfernt.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noreferrer"
              className="text-forest-600 underline"
            >
              ec.europa.eu/consumers/odr
            </a>
            . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen. [Falls doch: hier ergänzen]
          </p>
        </section>
      </div>
    </div>
  )
}
