import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import AuthCard from '@/components/auth/AuthCard'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signUp(email, password, username)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Konto erstellen" subtitle="Finde und teile Parkbänke weltweit">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="text"
          required
          minLength={3}
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border border-forest-100 px-3.5 py-2.5 text-sm outline-none focus:border-forest-400 dark:border-white/10 dark:bg-white/5"
        />
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
          minLength={8}
          placeholder="Passwort (min. 8 Zeichen)"
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
          {loading ? 'Erstelle Konto…' : 'Registrieren'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        Bereits registriert? <Link to="/login" className="font-medium text-forest-600">Anmelden</Link>
      </p>
    </AuthCard>
  )
}
