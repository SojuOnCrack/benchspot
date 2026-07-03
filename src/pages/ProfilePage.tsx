import { LogOut, TreeDeciduous, Star, Award } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { profile, signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="h-full overflow-y-auto px-5 pt-6">
      <div className="flex flex-col items-center gap-3">
        <img
          src={profile?.avatar_url ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${user?.id}`}
          alt=""
          className="h-20 w-20 rounded-full border border-forest-100 object-cover"
        />
        <div className="text-center">
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            {profile?.display_name ?? profile?.username ?? 'Nutzer'}
          </h1>
          <p className="text-sm text-stone-500">@{profile?.username}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-forest-100 p-4 text-center dark:border-white/10">
          <TreeDeciduous className="mx-auto mb-1 text-forest-600" size={20} />
          <p className="text-xl font-semibold text-stone-800 dark:text-stone-100">{profile?.bench_count ?? 0}</p>
          <p className="text-xs text-stone-500">Bänke hinzugefügt</p>
        </div>
        <div className="rounded-2xl border border-forest-100 p-4 text-center dark:border-white/10">
          <Star className="mx-auto mb-1 text-amber-400" size={20} />
          <p className="text-xl font-semibold text-stone-800 dark:text-stone-100">{profile?.rating_count ?? 0}</p>
          <p className="text-xs text-stone-500">Bewertungen</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200">
          <Award size={16} /> Errungenschaften
        </h2>
        {/* user_badges per user_id laden und hier als Icon-Reihe rendern */}
        <p className="text-sm text-stone-500">Noch keine Errungenschaften freigeschaltet.</p>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
      >
        <LogOut size={16} />
        Abmelden
      </button>
    </div>
  )
}
