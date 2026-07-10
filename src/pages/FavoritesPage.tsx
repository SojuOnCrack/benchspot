import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuthContext'
import { fetchFavoriteBenchIds } from '@/lib/api/benches'
import { supabase } from '@/lib/supabase'
import EmptyState from '@/components/ui/EmptyState'
import PageSkeleton from '@/components/ui/PageSkeleton'
import type { Bench } from '@/types/database'

export default function FavoritesPage() {
  const { user } = useAuth()

  const { data: benches, isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const ids = await fetchFavoriteBenchIds(user!.id)
      if (ids.length === 0) return []
      const { data, error } = await supabase.from('benches').select('*').in('id', ids)
      if (error) throw error
      return data as Bench[]
    },
    enabled: !!user,
  })

  if (isLoading) return <PageSkeleton />

  if (!benches || benches.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Noch keine Favoriten"
        description="Speichere Parkbänke, die dir gefallen, um sie hier wiederzufinden."
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h1 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-100">Deine Favoriten</h1>
      <div className="space-y-2">
        {benches.map((bench) => (
          <Link
            key={bench.id}
            to={`/bank/${bench.id}`}
            className="flex items-center justify-between rounded-2xl border border-forest-100 p-3.5 transition hover:border-forest-300 dark:border-white/10"
          >
            <div>
              <h3 className="text-sm font-medium text-stone-800 dark:text-stone-100">{bench.title}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {bench.avg_rating > 0 ? bench.avg_rating.toFixed(1) : 'Neu'}
              </div>
            </div>
            <Heart size={18} className="fill-forest-600 text-forest-600" />
          </Link>
        ))}
      </div>
    </div>
  )
}
