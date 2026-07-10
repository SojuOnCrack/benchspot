import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '@/components/auth/AuthCard'
import { useAuth } from '@/hooks/useAuthContext'

export default function ResetPasswordPage() {
  const { updatePassword, session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updatePassword(password)
      navigate('/profil', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passwort konnte nicht gespeichert werden')
    } finally {
      setSaving(false)
    }
  }

  if (!loading && !session) {
    return (
      <AuthCard title="Link abgelaufen" subtitle="Fordere bitte einen neuen Passwort-Link an">
        <Link to="/passwort-vergessen" className="block rounded-xl bg-forest-600 py-2.5 text-center text-sm font-semibold text-white">
          Neuen Link senden
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Neues Passwort" subtitle="Waehle ein sicheres Passwort">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="password"
          required
          minLength={8}
          placeholder="Neues Passwort"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-forest-100 px-3.5 py-2.5 text-sm outline-none focus:border-forest-400 dark:border-white/10 dark:bg-white/5"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={saving || loading}
          className="w-full rounded-xl bg-forest-600 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:opacity-60"
        >
          {saving ? 'Speichere...' : 'Passwort speichern'}
        </button>
      </form>
    </AuthCard>
  )
}
