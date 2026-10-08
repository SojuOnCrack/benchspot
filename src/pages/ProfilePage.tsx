import { FormEvent, useEffect, useState } from 'react'
import { LogOut, TreeDeciduous, Star, Award, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuthContext'
import { Link, useNavigate } from 'react-router-dom'

const FIELD_CLASS = 'mt-1 w-full rounded-xl border border-forest-100 bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-forest-400 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500'

function cleanUsername(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '')
}

function profileErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'code' in err) {
    const code = String((err as { code?: unknown }).code)
    if (code === '23505') return 'Dieser Username ist schon vergeben.'
    if (code === '42501') return 'Supabase blockiert das Speichern. Bitte prüfe die profiles RLS-Policies/Migrationen.'
    if (code === 'PGRST116') return 'Profil wurde noch nicht angelegt. Bitte nochmal speichern.'
  }

  if (err instanceof Error) return err.message
  return 'Profil konnte nicht gespeichert werden.'
}

export default function ProfilePage() {
  const { profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setUsername(profile?.username ?? '')
    setDisplayName(profile?.display_name ?? '')
    setBio(profile?.bio ?? '')
  }, [profile])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    const nextUsername = cleanUsername(username)
    if (nextUsername.length < 3) {
      setError('Username muss mindestens 3 Zeichen haben.')
      setSaving(false)
      return
    }

    try {
      await updateProfile({
        username: nextUsername,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      })
      setUsername(nextUsername)
      setMessage('Profil gespeichert.')
    } catch (err) {
      setError(profileErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-5 pb-24 pt-6 text-stone-800 dark:text-stone-100">
      <div className="flex flex-col items-center gap-3">
        <img
          src={profile?.avatar_url ?? `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#3a6f3a"/><text x="32" y="40" text-anchor="middle" font-family="sans-serif" font-size="26" fill="white">${(profile?.display_name || profile?.username || 'B').slice(0, 1).toUpperCase()}</text></svg>`)}`}
          alt=""
          className="h-20 w-20 rounded-full border border-forest-100 bg-white object-cover dark:border-white/10"
        />
        <div className="text-center">
          <h1 className="text-lg font-semibold">
            {profile?.display_name ?? profile?.username ?? 'Nutzer'}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">@{profile?.username ?? 'username'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
        <div>
          <label htmlFor="username" className="text-sm font-medium text-stone-700 dark:text-stone-200">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            required
            placeholder="dein_username"
            className={FIELD_CLASS}
          />
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Nur Buchstaben, Zahlen und Unterstriche. Wird als @{cleanUsername(username) || 'username'} gespeichert.</p>
        </div>

        <div>
          <label htmlFor="displayName" className="text-sm font-medium text-stone-700 dark:text-stone-200">Anzeigename</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Name, der im Profil angezeigt wird"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="bio" className="text-sm font-medium text-stone-700 dark:text-stone-200">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            placeholder="Kurz etwas über dich"
            className={FIELD_CLASS}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-forest-700 dark:text-forest-300">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Speichere...' : 'Profil speichern'}
        </button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-forest-100 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
          <TreeDeciduous className="mx-auto mb-1 text-forest-600 dark:text-forest-300" size={20} />
          <p className="text-xl font-semibold">{profile?.bench_count ?? 0}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Baenke hinzugefuegt</p>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
          <Star className="mx-auto mb-1 text-amber-400" size={20} />
          <p className="text-xl font-semibold">{profile?.rating_count ?? 0}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Bewertungen</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200">
          <Award size={16} /> Errungenschaften
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Noch keine Errungenschaften freigeschaltet.</p>
      </div>

      <div className="mt-8 flex justify-center gap-4 text-xs text-stone-400 dark:text-stone-500">
        <Link to="/impressum" className="hover:text-stone-600 dark:hover:text-stone-300">Impressum</Link>
        <Link to="/datenschutz" className="hover:text-stone-600 dark:hover:text-stone-300">Datenschutz</Link>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
      >
        <LogOut size={16} />
        Abmelden
      </button>
    </div>
  )
}
