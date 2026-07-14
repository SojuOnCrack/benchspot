import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function DatenschutzPage() {
  useDocumentMeta({ title: 'Datenschutzerklärung' })

  return (
    <div className="mx-auto h-full max-w-xl overflow-y-auto px-4 py-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-600">
        <ArrowLeft size={16} /> Zurück
      </Link>

      <h1 className="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">Datenschutzerklärung</h1>

      <div className="space-y-4 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ Entwurf auf Basis des tatsächlichen Tech-Stacks (Cloudflare Pages, Supabase). Ersetzt die [Platzhalter]
          und lasst den Text vor dem Launch von einem/einer Fachanwält:in für Datenschutz prüfen – das ersetzt keine
          Rechtsberatung.
        </p>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">1. Verantwortlicher</h2>
          <p>
            [Name, Anschrift, E-Mail – siehe <Link to="/impressum" className="text-forest-600 underline">Impressum</Link>]
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">2. Welche Daten wir verarbeiten</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account: E-Mail-Adresse, Username, optionaler Anzeigename, optionale Bio, optionales Profilbild</li>
            <li>Inhalte: von euch erstellte Bank-Einträge (inkl. GPS-Koordinaten des Standorts), Fotos, Bewertungen, Kommentare</li>
            <li>Technisch: Login-Session (per Cookie/Local Storage von Supabase Auth verwaltet)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">3. Hosting &amp; Auftragsverarbeiter</h2>
          <p>
            Diese Website wird über <strong>Cloudflare Pages</strong> ausgeliefert. Datenbank, Authentifizierung und
            Datei-Speicher (Fotos/Avatare) laufen über <strong>Supabase</strong> (Serverstandort: [Region in Supabase-
            Projekteinstellungen prüfen, z.B. EU/Frankfurt]). Mit beiden Anbietern besteht bzw. muss ein
            Auftragsverarbeitungsvertrag (AVV) nach Art. 28 DSGVO abgeschlossen werden.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">4. Zwecke &amp; Rechtsgrundlage</h2>
          <p>
            Verarbeitung zur Bereitstellung des Dienstes (Kontoerstellung, Anzeige/Verwaltung von Bank-Einträgen) auf
            Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). [Falls Analytics/Newsletter genutzt wird:
            hier per Einwilligung, Art. 6 Abs. 1 lit. a DSGVO, ergänzen.]
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">5. Speicherdauer</h2>
          <p>
            Accountdaten und Inhalte werden gespeichert, bis ihr euren Account löscht bzw. den Inhalt entfernt.
            [Konkrete Löschfristen für Backups ergänzen, falls vorhanden.]
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">6. Eure Rechte</h2>
          <p>
            Ihr habt das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
            Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21).
            Zudem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold text-stone-800 dark:text-stone-100">7. Kontakt</h2>
          <p>Für Anfragen zum Datenschutz: [kontakt@example.com]</p>
        </section>
      </div>
    </div>
  )
}
