import { FormEvent, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Navigation, Star, Heart, Share2, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuthContext'
import { useBench, useBenchComments, useBenchPhotos, useBenchRatings } from '@/hooks/useBenches'
import { addBenchComment, upsertBenchRating } from '@/lib/api/benches'
import PageSkeleton from '@/components/ui/PageSkeleton'
import BenchAttributeGrid from '@/components/bench/BenchAttributeGrid'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function BenchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: bench, isLoading } = useBench(id)
  const { data: photos = [] } = useBenchPhotos(id)
  const { data: ratings = [] } = useBenchRatings(id)
  const { data: comments = [] } = useBenchComments(id)
  const [comment, setComment] = useState('')

  useDocumentMeta({
    title: bench?.title ?? 'Parkbank',
    description: bench?.description || `Eine Parkbank auf BenchSpot${bench?.title ? `: ${bench.title}` : ''}.`,
  })

  const ratingMutation = useMutation({
    mutationFn: (stars: number) => upsertBenchRating(id as string, user?.id as string, stars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bench', id] })
      queryClient.invalidateQueries({ queryKey: ['bench-ratings', id] })
    },
  })

  const commentMutation = useMutation({
    mutationFn: (body: string) => addBenchComment(id as string, user?.id as string, body),
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['bench-comments', id] })
    },
  })

  const submitComment = (event: FormEvent) => {
    event.preventDefault()
    if (!user || !comment.trim()) return
    commentMutation.mutate(comment.trim())
  }

  if (isLoading) return <PageSkeleton />
  if (!bench) return <p className="p-6 text-center text-stone-500">Parkbank nicht gefunden.</p>

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bench.lat},${bench.lng}`
  const ownRating = ratings.find((rating) => rating.user_id === user?.id)?.stars ?? 0

  return (
    <div className="h-full overflow-y-auto pb-24 text-stone-800 dark:text-stone-100">
      <div className="relative h-64 bg-forest-100 dark:bg-stone-900">
        <Link
          to="/"
          className="absolute left-4 top-4 z-10 rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur dark:bg-stone-900/95 dark:text-stone-100"
          aria-label="Zurueck"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <button className="rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur dark:bg-stone-900/95 dark:text-stone-100" aria-label="Favorisieren">
            <Heart size={18} />
          </button>
          <button className="rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur dark:bg-stone-900/95 dark:text-stone-100" aria-label="Teilen">
            <Share2 size={18} />
          </button>
        </div>
        {photos.length > 0 ? (
          <div className="flex h-full snap-x overflow-x-auto">
            {photos.map((photo) => (
              <img key={photo.id} src={photo.public_url} alt="" className="h-full min-w-full snap-center object-cover" />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center bg-forest-50 text-forest-700 dark:bg-stone-900 dark:text-forest-200">
            Noch keine Fotos
          </div>
        )}
      </div>

      <div className="space-y-6 px-5 pt-5">
        <div>
          <h1 className="text-xl font-semibold">{bench.title}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-stone-600 dark:text-stone-300">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span>
              {bench.avg_rating > 0 ? bench.avg_rating.toFixed(1) : 'Neu'}
              {bench.rating_count > 0 && ` · ${bench.rating_count} Bewertungen`}
            </span>
          </div>
        </div>

        {bench.description && <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{bench.description}</p>}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-forest-600 py-3 text-sm font-medium text-white transition hover:bg-forest-700"
        >
          <Navigation size={16} />
          Navigation starten
        </a>

        <BenchAttributeGrid bench={bench} />

        {bench.notes && (
          <div className="rounded-2xl bg-white p-4 text-sm text-stone-700 shadow-sm dark:bg-white/5 dark:text-stone-300">
            {bench.notes}
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Bewerten</h2>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((stars) => (
              <button
                key={stars}
                type="button"
                disabled={!user || ratingMutation.isPending}
                onClick={() => ratingMutation.mutate(stars)}
                className="rounded-full p-1 text-amber-400 disabled:opacity-40"
                aria-label={`${stars} Sterne vergeben`}
              >
                <Star size={28} className={stars <= ownRating ? 'fill-amber-400' : ''} />
              </button>
            ))}
          </div>
          {!user && <p className="text-sm text-stone-500 dark:text-stone-400">Zum Bewerten bitte anmelden.</p>}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Kommentare</h2>
          {user && (
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Kommentar schreiben..."
                className="min-w-0 flex-1 rounded-xl border border-forest-100 bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-forest-400 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100"
              />
              <button
                type="submit"
                disabled={!comment.trim() || commentMutation.isPending}
                className="rounded-xl bg-forest-600 px-3 text-white transition hover:bg-forest-700 disabled:opacity-50"
                aria-label="Kommentar senden"
              >
                <Send size={18} />
              </button>
            </form>
          )}
          <div className="space-y-2">
            {comments.length === 0 && <p className="text-sm text-stone-500 dark:text-stone-400">Noch keine Kommentare.</p>}
            {comments.map((item) => (
              <article key={item.id} className="rounded-2xl bg-white p-4 text-sm shadow-sm dark:bg-white/5">
                <div className="font-medium text-stone-800 dark:text-stone-100">
                  {item.profiles?.display_name || item.profiles?.username || 'BenchSpot Nutzer'}
                </div>
                <p className="mt-1 text-stone-700 dark:text-stone-300">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
