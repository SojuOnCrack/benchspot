import { FormEvent, useState } from 'react'
<<<<<<< HEAD
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Navigation, Star, Heart, Share2, Send, Flag, X, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuthContext'
import { useBench, useBenchComments, useBenchPhotos, useBenchRatings } from '@/hooks/useBenches'
import {
  addBenchComment,
  createReport,
  deleteBenchPhoto,
  fetchFavoriteBenchIds,
  toggleFavorite,
  upsertBenchRating,
} from '@/lib/api/benches'
=======
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Navigation, Star, Heart, Share2, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuthContext'
import { useBench, useBenchComments, useBenchPhotos, useBenchRatings } from '@/hooks/useBenches'
import { addBenchComment, fetchFavoriteBenchIds, toggleFavorite, upsertBenchRating } from '@/lib/api/benches'
>>>>>>> a4da0105706eb3aa3b0a7e27e0158bb9469657c9
import PageSkeleton from '@/components/ui/PageSkeleton'
import BenchAttributeGrid from '@/components/bench/BenchAttributeGrid'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import type { Report } from '@/types/database'

export default function BenchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: bench, isLoading } = useBench(id)
  const { data: photos = [], isLoading: photosLoading, isError: photosError } = useBenchPhotos(id)
  const { data: ratings = [], isLoading: ratingsLoading, isError: ratingsError } = useBenchRatings(id)
  const { data: comments = [], isLoading: commentsLoading, isError: commentsError } = useBenchComments(id)
  const { data: favoriteIds = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => fetchFavoriteBenchIds(user?.id as string),
    enabled: !!user,
  })
  const [comment, setComment] = useState('')
<<<<<<< HEAD
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState<Report['reason']>('spam')
  const [reportDetails, setReportDetails] = useState('')
=======
  const [shareHint, setShareHint] = useState<string | null>(null)
  const { data: favoriteIds = [] } = useQuery({
    queryKey: ['favorite-ids', user?.id],
    queryFn: () => fetchFavoriteBenchIds(user!.id),
    enabled: !!user,
  })
  const isFavorite = !!id && favoriteIds.includes(id)

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(user!.id, id as string, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    },
  })

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: bench?.title ?? 'BenchSpot', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareHint('Link kopiert')
    } catch {
      setShareHint(null)
    }
  }
>>>>>>> a4da0105706eb3aa3b0a7e27e0158bb9469657c9

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

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(user?.id as string, id as string, favoriteIds.includes(id as string)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] }),
  })

  const reportMutation = useMutation({
    mutationFn: () => createReport(user?.id as string, 'bench', id as string, reportReason, reportDetails),
    onSuccess: () => {
      setReportOpen(false)
      setReportDetails('')
    },
  })

  const photoDeleteMutation = useMutation({
    mutationFn: deleteBenchPhoto,
    onSuccess: () => {
      setSelectedPhoto(null)
      queryClient.invalidateQueries({ queryKey: ['bench-photos', id] })
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
  const isFavorite = favoriteIds.includes(bench.id)
  const isOwner = user?.id === bench.owner_id

  return (
    <div className="h-full overflow-y-auto pb-24 text-stone-800 dark:text-stone-100">
      <div className="relative h-64 bg-forest-100 dark:bg-stone-900">
        <Link
          to="/"
          className="absolute left-4 top-4 z-10 rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur dark:bg-stone-900/95 dark:text-stone-100"
          aria-label="Zurück"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <button
            type="button"
<<<<<<< HEAD
            onClick={() => user && favoriteMutation.mutate()}
            disabled={!user || favoriteMutation.isPending}
            className="rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur disabled:opacity-50 dark:bg-stone-900/95 dark:text-stone-100"
            aria-label="Favorisieren"
=======
            onClick={() => (user ? favoriteMutation.mutate() : navigate('/login', { state: { from: location } }))}
            disabled={favoriteMutation.isPending}
            aria-pressed={isFavorite}
            className="rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur disabled:opacity-60 dark:bg-stone-900/95 dark:text-stone-100"
            aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
>>>>>>> a4da0105706eb3aa3b0a7e27e0158bb9469657c9
          >
            <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>
          <button
            type="button"
            onClick={share}
            className="rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur dark:bg-stone-900/95 dark:text-stone-100"
            aria-label="Teilen"
          >
            <Share2 size={18} />
          </button>
<<<<<<< HEAD
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            disabled={!user}
            className="rounded-full bg-white/95 p-2 text-stone-800 shadow-sm backdrop-blur disabled:opacity-50 dark:bg-stone-900/95 dark:text-stone-100"
            aria-label="Melden"
          >
            <Flag size={18} />
          </button>
=======
          {shareHint && (
            <span role="status" className="self-center rounded-full bg-white/95 px-2.5 py-1 text-xs text-stone-800 shadow-sm dark:bg-stone-900/95 dark:text-stone-100">{shareHint}</span>
          )}
>>>>>>> a4da0105706eb3aa3b0a7e27e0158bb9469657c9
        </div>
        {photosLoading ? (
          <div className="flex h-full items-center justify-center bg-forest-50 text-forest-700 dark:bg-stone-900 dark:text-forest-200">
            Fotos werden geladen...
          </div>
        ) : photosError ? (
          <div className="flex h-full items-center justify-center bg-red-50 px-6 text-center text-sm text-red-600 dark:bg-red-500/10">
            Fotos konnten nicht geladen werden.
          </div>
        ) : photos.length > 0 ? (
          <div className="flex h-full snap-x overflow-x-auto">
            {photos.map((photo, index) => (
              <button key={photo.id} type="button" onClick={() => setSelectedPhoto(index)} className="h-full min-w-full snap-center">
                <img src={photo.public_url} alt="" className="h-full w-full object-cover" />
              </button>
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
          {ratingsLoading && <p className="text-sm text-stone-500 dark:text-stone-400">Bewertungen werden geladen...</p>}
          {ratingsError && <p className="text-sm text-red-500">Bewertungen konnten nicht geladen werden.</p>}
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
            {commentsLoading && <p className="text-sm text-stone-500 dark:text-stone-400">Kommentare werden geladen...</p>}
            {commentsError && <p className="text-sm text-red-500">Kommentare konnten nicht geladen werden.</p>}
            {!commentsLoading && comments.length === 0 && <p className="text-sm text-stone-500 dark:text-stone-400">Noch keine Kommentare.</p>}
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

      {selectedPhoto !== null && photos[selectedPhoto] && (
        <div className="fixed inset-0 z-[2000] bg-black/90 p-4 text-white">
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2"
            aria-label="Schliessen"
          >
            <X size={22} />
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => photoDeleteMutation.mutate(photos[selectedPhoto])}
              disabled={photoDeleteMutation.isPending}
              className="absolute left-4 top-4 rounded-full bg-white/10 p-2 disabled:opacity-50"
              aria-label="Foto loeschen"
            >
              <Trash2 size={22} />
            </button>
          )}
          <img src={photos[selectedPhoto].public_url} alt="" className="h-full w-full object-contain" />
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-[2000] flex items-end bg-black/40 p-4 sm:items-center sm:justify-center">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (user) reportMutation.mutate()
            }}
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-stone-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Bank melden</h2>
              <button type="button" onClick={() => setReportOpen(false)} aria-label="Schliessen">
                <X size={18} />
              </button>
            </div>
            <select
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value as Report['reason'])}
              className="mt-3 w-full rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-stone-900"
            >
              <option value="spam">Spam</option>
              <option value="inappropriate">Unpassend</option>
              <option value="duplicate">Duplikat</option>
              <option value="offensive">Beleidigend</option>
              <option value="fake">Falscher Eintrag</option>
              <option value="other">Sonstiges</option>
            </select>
            <textarea
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              rows={3}
              placeholder="Optional: kurzer Hinweis"
              className="mt-3 w-full rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-stone-900"
            />
            {reportMutation.isError && <p className="mt-2 text-sm text-red-500">Meldung konnte nicht gesendet werden.</p>}
            <button
              type="submit"
              disabled={!user || reportMutation.isPending}
              className="mt-3 w-full rounded-xl bg-forest-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {reportMutation.isPending ? 'Sende...' : 'Melden'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
