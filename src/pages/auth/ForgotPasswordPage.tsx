import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuthContext'
import AuthCard from '@/components/auth/AuthCard'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Passwort vergessen" subtitle="Wir senden dir einen Link zum Zurücksetzen">
      {sent ? (
        <p className="text-center text-sm text-forest-700">
          E-Mail gesendet. Bitte Posteingang prüfen.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-forest-100 px-3.5 py-2.5 text-sm outline-none focus:border-forest-400 dark:border-white/10 dark:bg-white/5"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-forest-600 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:opacity-60"
          >
            {loading ? 'Sende…' : 'Link senden'}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-forest-600">Zurück zur Anmeldung</Link>
      </p>
    </AuthCard>
  )
}
