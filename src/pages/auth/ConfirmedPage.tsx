import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import { useAuth } from '@/hooks/useAuthContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function ConfirmedPage() {
  useDocumentMeta({ title: 'E-Mail bestätigt' })
  const { session, loading } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Supabase haengt bei einem fehlgeschlagenen Bestaetigungslink
    // (z.B. abgelaufen/bereits benutzt) error_description an Query oder Hash an.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const searchParams = new URLSearchParams(window.location.search)
    const description = hashParams.get('error_description') || searchParams.get('error_description')
    if (description) setErrorMessage(description.replaceAll('+', ' '))
  }, [])

  if (loading) {
    return (
      <AuthCard title="Einen Moment..." subtitle="E-Mail wird geprüft.">
        <div />
      </AuthCard>
    )
  }

  if (errorMessage) {
    return (
      <AuthCard title="Bestätigung fehlgeschlagen" subtitle="Der Link ist ungültig oder abgelaufen.">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="text-red-500" size={40} />
          <p className="text-sm text-stone-600 dark:text-stone-300">{errorMessage}</p>
          <Link
            to="/registrieren"
            className="w-full rounded-xl bg-forest-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-forest-700"
          >
            Erneut registrieren
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="E-Mail bestätigt" subtitle="Dein Konto ist jetzt aktiv.">
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="text-forest-600 dark:text-forest-300" size={40} />
        <p className="text-sm text-stone-600 dark:text-stone-300">
          ✅ Deine E-Mail wurde erfolgreich bestätigt! {session ? 'Du bist bereits angemeldet.' : 'Du kannst dich jetzt anmelden.'}
        </p>
        <Link
          to={session ? '/' : '/login'}
          className="w-full rounded-xl bg-forest-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-forest-700"
        >
          {session ? 'Zur Karte' : 'Jetzt anmelden'}
        </Link>
      </div>
    </AuthCard>
  )
}
