import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldAlert, Ban, CheckCircle2, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminProfiles, useOpenReports } from '@/hooks/useBenches'
import { setProfileBlocked, updateReportStatus } from '@/lib/api/benches'
import PageSkeleton from '@/components/ui/PageSkeleton'

export default function AdminPage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [profileSearch, setProfileSearch] = useState('')
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'
  const { data: reports = [], isLoading: reportsLoading } = useOpenReports(isAdmin)
  const { data: profiles = [], isLoading: profilesLoading } = useAdminProfiles(profileSearch, isAdmin)

  const reportMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'resolved' | 'dismissed' }) => updateReportStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  })

  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) => setProfileBlocked(id, isBlocked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-profiles'] }),
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
    </div>
  )
}
