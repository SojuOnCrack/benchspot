import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Accessibility, Baby, Dog, TreeDeciduous, Sun, Table2, Droplets, Trash2, Flame, Bike,
  Waves, Mountain, Building2, Umbrella, Armchair, VolumeX, Heart, Briefcase, UtensilsCrossed,
} from 'lucide-react'
import { benchSchema, benchFormDefaults, type BenchFormValues } from '@/lib/schemas/benchSchema'
import { createBench, uploadBenchPhotos } from '@/lib/api/benches'
import { useAuth } from '@/hooks/useAuth'
import { useGeolocation } from '@/hooks/useGeolocation'
import LocationPicker from '@/components/bench/LocationPicker'
import PhotoUploader from '@/components/bench/PhotoUploader'
import ToggleField from '@/components/ui/ToggleField'

const FIELD_CLASS = 'mt-1 w-full rounded-xl border border-forest-100 bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-forest-400 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500'

const FEATURE_TOGGLES: Array<{ key: keyof BenchFormValues; icon: typeof Accessibility; label: string }> = [
  { key: 'has_roof', icon: Umbrella, label: 'Ueberdacht' },
  { key: 'has_backrest', icon: Armchair, label: 'Mit Lehne' },
  { key: 'has_table', icon: Table2, label: 'Mit Tisch' },
  { key: 'wheelchair_accessible', icon: Accessibility, label: 'Rollstuhlgerecht' },
  { key: 'stroller_friendly', icon: Baby, label: 'Kinderwagen geeignet' },
  { key: 'has_bike_rack', icon: Bike, label: 'Fahrradstaender' },
  { key: 'has_water_fountain', icon: Droplets, label: 'Trinkbrunnen' },
  { key: 'has_trash_bin', icon: Trash2, label: 'Muelleimer' },
  { key: 'has_bbq', icon: Flame, label: 'Grillplatz' },
  { key: 'has_playground', icon: Baby, label: 'Spielplatz' },
  { key: 'dog_friendly', icon: Dog, label: 'Hunde erlaubt' },
  { key: 'shade', icon: TreeDeciduous, label: 'Schatten' },
  { key: 'sun', icon: Sun, label: 'Sonnig' },
  { key: 'view_lake', icon: Waves, label: 'Seeblick' },
  { key: 'view_river', icon: Waves, label: 'Flussblick' },
  { key: 'view_mountain', icon: Mountain, label: 'Bergblick' },
  { key: 'view_city', icon: Building2, label: 'Stadtblick' },
  { key: 'is_quiet', icon: VolumeX, label: 'Ruhig' },
  { key: 'is_romantic', icon: Heart, label: 'Romantisch' },
  { key: 'picnic_friendly', icon: UtensilsCrossed, label: 'Picknick geeignet' },
  { key: 'workspace_friendly', icon: Briefcase, label: 'Arbeitsplatz geeignet' },
]

export default function AddBenchPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const geo = useGeolocation()
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, control, watch, setValue, formState } = useForm<BenchFormValues>({
    resolver: zodResolver(benchSchema),
    defaultValues: {
      ...benchFormDefaults,
      lat: geo.lat ?? 51.1657,
      lng: geo.lng ?? 10.4515,
    },
  })

  const lat = watch('lat')
  const lng = watch('lng')

  useEffect(() => {
    if (!geo.lat || !geo.lng) return
    setValue('lat', geo.lat)
    setValue('lng', geo.lng)
  }, [geo.lat, geo.lng, setValue])

  const onSubmit = async (values: BenchFormValues) => {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      const bench = await createBench(
        {
          ...values,
          description: values.description ?? null,
          notes: values.notes ?? null,
          seats: values.seats ?? null,
          material: values.material ?? null,
        },
        user.id
      )
      await uploadBenchPhotos(bench.id, user.id, photos)
      navigate(`/bank/${bench.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full overflow-y-auto px-5 pb-28 pt-5 text-stone-800 dark:text-stone-100">
      <h1 className="text-lg font-semibold">Neue Parkbank</h1>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Position, Details und Fotos hinzufuegen.</p>

      <section className="mt-5 space-y-2">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Position</label>
        <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => {
          setValue('lat', la)
          setValue('lng', ln)
        }} />
        <button
          type="button"
          onClick={() => {
            if (geo.lat && geo.lng) {
              setValue('lat', geo.lat)
              setValue('lng', geo.lng)
              return
            }
            geo.requestLocation()
          }}
          className="text-xs font-medium text-forest-700 dark:text-forest-300"
        >
          {geo.loading ? 'Standort wird gesucht...' : 'Aktuellen Standort uebernehmen'}
        </button>
        {geo.error && <p className="text-xs text-red-500">{geo.error}</p>}
      </section>

      <section className="mt-6 space-y-3">
        <div>
          <label htmlFor="title" className="text-sm font-medium text-stone-700 dark:text-stone-200">Titel</label>
          <input id="title" {...register('title')} className={FIELD_CLASS} placeholder="z. B. Bank mit Seeblick" />
          {formState.errors.title && <p className="mt-1 text-xs text-red-500">{formState.errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-stone-700 dark:text-stone-200">Beschreibung</label>
          <textarea id="description" {...register('description')} rows={3} className={FIELD_CLASS} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="text-sm font-medium text-stone-700 dark:text-stone-200">Kategorie</label>
            <select id="category" {...register('category')} className={FIELD_CLASS}>
              <option value="standard">Standard</option>
              <option value="panorama">Panorama</option>
              <option value="waterfront">Am Wasser</option>
              <option value="forest">Wald</option>
              <option value="urban">Stadt</option>
              <option value="picnic">Picknick</option>
            </select>
          </div>
          <div>
            <label htmlFor="seats" className="text-sm font-medium text-stone-700 dark:text-stone-200">Sitzplaetze</label>
            <input id="seats" type="number" min={1} max={20} {...register('seats', { valueAsNumber: true })} className={FIELD_CLASS} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Eigenschaften</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FEATURE_TOGGLES.map(({ key, icon, label }) => (
            <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) => (
                <ToggleField icon={icon} label={label} checked={Boolean(field.value)} onChange={field.onChange} />
              )}
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Fotos</label>
        <div className="mt-2">
          <PhotoUploader files={photos} onChange={setPhotos} />
        </div>
      </section>

      <section className="mt-6">
        <label htmlFor="notes" className="text-sm font-medium text-stone-700 dark:text-stone-200">Notizen</label>
        <textarea id="notes" {...register('notes')} rows={2} className={FIELD_CLASS} />
      </section>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="fixed inset-x-5 bottom-24 rounded-2xl bg-forest-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-forest-600/25 transition hover:bg-forest-700 disabled:opacity-60 sm:static sm:mt-6"
      >
        {submitting ? 'Speichere...' : 'Parkbank speichern'}
      </button>
    </form>
  )
}
