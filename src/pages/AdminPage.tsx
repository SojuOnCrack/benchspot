import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldAlert, Ban, CheckCircle2, Search, Trash2, TreePine, Plus, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuthContext'
import { useAdminProfiles, useAdminBenches, useOpenReports } from '@/hooks/useBenches'
import { setProfileBlocked, updateReportStatus, updateBenchStatusAdmin, deleteBenchAdmin, createBench } from '@/lib/api/benches'
import { benchSchema, benchFormDefaults, type BenchFormValues } from '@/lib/schemas/benchSchema'
import type { Bench } from '@/types/database'
import LocationPicker from '@/components/bench/LocationPicker'
import PageSkeleton from '@/components/ui/PageSkeleton'

const FIELD_CLASS = 'mt-1 w-full rounded-xl border border-forest-100 bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-forest-400 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500'

const BENCH_STATUS_LABEL: Record<Bench['status'], string> = {
  published: 'Veröffentlicht',
  pending: 'Ausstehend',
  hidden: 'Versteckt',
  removed: 'Entfernt',
}

export default function AdminPage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [profileSearch, setProfileSearch] = useState('')
  const [benchSearch, setBenchSearch] = useState('')
  const [showAddBench, setShowAddBench] = useState(false)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'
  const { data: reports = [], isLoading: reportsLoading } = useOpenReports(isAdmin)
  const { data: profiles = [], isLoading: profilesLoading } = useAdminProfiles(profileSearch, isAdmin)
  const { data: benches = [], isLoading: benchesLoading } = useAdminBenches(benchSearch, isAdmin)

  const reportMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'resolved' | 'dismissed' }) => updateReportStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  })

  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) => setProfileBlocked(id, isBlocked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-profiles'] }),
  })

  const benchStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Bench['status'] }) => updateBenchStatusAdmin(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-benches'] }),
  })

  const benchDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteBenchAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-benches'] }),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BenchFormValues>({
    resolver: zodResolver(benchSchema),
    defaultValues: benchFormDefaults,
  })
  const pickedLat = watch('lat')
  const pickedLng = watch('lng')

  const benchCreateMutation = useMutation({
    mutationFn: (values: BenchFormValues) =>
      createBench(
        {
          ...values,
          description: values.description ?? null,
          notes: values.notes ?? null,
          seats: values.seats ?? null,
          material: values.material ?? null,
        },
        profile!.id
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-benches'] })
      reset(benchFormDefaults)
      setShowAddBench(false)
    },
  })

  if (!profile) return <PageSkeleton />
  if (!isAdmin) {
    return <p className="p-6 text-center text-sm text-stone-600 dark:text-stone-300">Kein Admin-Zugriff.</p>
  }

  return (
    <div className="h-full overflow-y-auto px-5 pb-24 pt-5 text-stone-800 dark:text-stone-100">
      <div className="flex items-center gap-2">
        <ShieldAlert size={22} className="text-forest-700 dark:text-forest-200" />
        <h1 className="text-lg font-semibold">Admin</h1>
      </div>

      <section className="mt-6">
        <h2 className="text-base font-semibold">Gemeldete Inhalte</h2>
        {reportsLoading ? (
          <p className="mt-3 text-sm text-stone-500">Lade Meldungen...</p>
        ) : (
          <div className="mt-3 space-y-2">
            {reports.length === 0 && <p className="text-sm text-stone-500 dark:text-stone-400">Keine offenen Meldungen.</p>}
            {reports.map((report) => (
              <article key={report.id} className="rounded-2xl bg-white p-4 text-sm shadow-sm dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{report.target_type} · {report.reason}</p>
                    <p className="mt-1 text-stone-600 dark:text-stone-300">{report.details || 'Keine Details'}</p>
                    <p className="mt-2 text-xs text-stone-500">Ziel: {report.target_id}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => reportMutation.mutate({ id: report.id, status: 'resolved' })}
                      className="rounded-full bg-forest-600 p-2 text-white"
                      aria-label="Meldung erledigen"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => reportMutation.mutate({ id: report.id, status: 'dismissed' })}
                      className="rounded-full bg-stone-200 p-2 text-stone-700 dark:bg-white/10 dark:text-stone-100"
                      aria-label="Meldung abweisen"
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold">Nutzer sperren</h2>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-stone-900">
          <Search size={16} className="text-stone-500" />
          <input
            value={profileSearch}
            onChange={(event) => setProfileSearch(event.target.value)}
            placeholder="Username suchen..."
            className="min-w-0 flex-1 bg-transparent text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100"
          />
        </label>
        {profilesLoading ? (
          <p className="mt-3 text-sm text-stone-500">Lade Nutzer...</p>
        ) : (
          <div className="mt-3 space-y-2">
            {profiles.map((item) => (
              <article key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm dark:bg-white/5">
                <div>
                  <p className="font-medium">{item.display_name || item.username}</p>
                  <p className="text-xs text-stone-500">{item.role}{item.is_blocked ? ' · gesperrt' : ''}</p>
                </div>
                <button
                  type="button"
                  disabled={item.id === profile.id || blockMutation.isPending}
                  onClick={() => blockMutation.mutate({ id: item.id, isBlocked: !item.is_blocked })}
                  className="rounded-full bg-stone-200 px-3 py-1.5 text-xs font-medium text-stone-800 transition hover:bg-stone-300 disabled:opacity-50 dark:bg-white/10 dark:text-stone-100"
                >
                  {item.is_blocked ? 'Entsperren' : 'Sperren'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Bänke</h2>
          <button
            type="button"
            onClick={() => setShowAddBench((open) => !open)}
            className="flex items-center gap-1.5 rounded-full bg-forest-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-forest-700"
          >
            {showAddBench ? <X size={14} /> : <Plus size={14} />}
            {showAddBench ? 'Abbrechen' : 'Bank hinzufügen'}
          </button>
        </div>

        {showAddBench && (
          <form
            onSubmit={handleSubmit((values) => benchCreateMutation.mutate(values))}
            className="mt-3 space-y-3 rounded-2xl border border-forest-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Titel</label>
              <input {...register('title')} placeholder="z.B. Bank am Seeufer" className={FIELD_CLASS} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Beschreibung</label>
              <textarea {...register('description')} rows={2} className={FIELD_CLASS} />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Kategorie</label>
              <select {...register('category')} className={FIELD_CLASS}>
                <option value="standard">Standard</option>
                <option value="panorama">Panorama</option>
                <option value="waterfront">Am Wasser</option>
                <option value="forest">Wald</option>
                <option value="urban">Urban</option>
                <option value="picnic">Picknick</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">
                Standort (auf Karte klicken oder Marker ziehen)
              </label>
              <div className="mt-1">
                <LocationPicker lat={pickedLat} lng={pickedLng} onChange={(lat, lng) => {
                  setValue('lat', lat)
                  setValue('lng', lng)
                }} />
              </div>
              <p className="mt-1 text-xs text-stone-500">{pickedLat.toFixed(5)}, {pickedLng.toFixed(5)}</p>
            </div>

            {benchCreateMutation.isError && (
              <p className="text-xs text-red-500">Fehler beim Speichern. Bitte erneut versuchen.</p>
            )}

            <button
              type="submit"
              disabled={benchCreateMutation.isPending}
              className="w-full rounded-xl bg-forest-600 py-2.5 text-sm font-medium text-white transition hover:bg-forest-700 disabled:opacity-50"
            >
              {benchCreateMutation.isPending ? 'Wird gespeichert...' : 'Bank erstellen'}
            </button>
          </form>
        )}

        <label className="mt-3 flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-stone-900">
          <Search size={16} className="text-stone-500" />
          <input
            value={benchSearch}
            onChange={(event) => setBenchSearch(event.target.value)}
            placeholder="Titel suchen..."
            className="min-w-0 flex-1 bg-transparent text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100"
          />
        </label>
        {benchesLoading ? (
          <p className="mt-3 text-sm text-stone-500">Lade Bänke...</p>
        ) : (
          <div className="mt-3 space-y-2">
            {benches.length === 0 && <p className="text-sm text-stone-500 dark:text-stone-400">Keine Bänke gefunden.</p>}
            {benches.map((bench) => (
              <article key={bench.id} className="rounded-2xl bg-white p-4 text-sm shadow-sm dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <TreePine size={16} className="mt-0.5 shrink-0 text-forest-600 dark:text-forest-300" />
                    <div>
                      <p className="font-medium">{bench.title}</p>
                      <p className="mt-0.5 text-xs text-stone-500">{BENCH_STATUS_LABEL[bench.status]}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${bench.title}" endgültig löschen?`)) benchDeleteMutation.mutate(bench.id)
                    }}
                    disabled={benchDeleteMutation.isPending}
                    className="shrink-0 rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                    aria-label="Bank löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(Object.keys(BENCH_STATUS_LABEL) as Bench['status'][]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={bench.status === status || benchStatusMutation.isPending}
                      onClick={() => benchStatusMutation.mutate({ id: bench.id, status })}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-default ${
                        bench.status === status
                          ? 'bg-forest-600 text-white'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-white/10 dark:text-stone-100 dark:hover:bg-white/20'
                      }`}
                    >
                      {BENCH_STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
