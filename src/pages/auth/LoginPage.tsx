import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import AuthCard from '@/components/auth/AuthCard'

export default function LoginPage() {
  const { signInWithPassword, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithPassword(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Willkommen zurück" subtitle="Melde dich bei BenchSpot an">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-forest-100 px-3.5 py-2.5 text-sm outline-none focus:border-forest-400 dark:border-white/10 dark:bg-white/5"
        />
        <input
          type="password"
          required
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-forest-100 px-3.5 py-2.5 text-sm outline-none focus:border-forest-400 dark:border-white/10 dark:bg-white/5"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-forest-600 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:opacity-60"
        >
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-stone-400">
        <div className="h-px flex-1 bg-forest-100 dark:bg-white/10" />
        oder
        <div className="h-px flex-1 bg-forest-100 dark:bg-white/10" />
      </div>

      <div className="space-y-2">
        <button
          onClick={() => signInWithOAuth('google')}
          className="w-full rounded-xl border border-forest-100 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-forest-50 dark:border-white/10 dark:text-stone-200"
        >
          Mit Google anmelden
        </button>
        <button
          onClick={() => signInWithOAuth('github')}
          className="w-full rounded-xl border border-forest-100 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-forest-50 dark:border-white/10 dark:text-stone-200"
        >
          Mit GitHub anmelden
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Noch kein Konto?{' '}
        <Link to="/registrieren" className="font-medium text-forest-600">Registrieren</Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link to="/passwort-vergessen" className="text-forest-600">Passwort vergessen?</Link>
      </p>
      <p className="mt-4 text-center">
        <Link to="/" className="text-xs text-stone-400">Als Gast weiter</Link>
      </p>
    </AuthCard>
  )
}
