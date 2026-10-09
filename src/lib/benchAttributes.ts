import {
  Accessibility,
  Baby,
  Dog,
  TreeDeciduous,
  Sun,
  Table2,
  Droplets,
  Trash2,
  Flame,
  Bike,
  Waves,
  Mountain,
  Building2,
} from 'lucide-react'
import type { Bench } from '@/types/database'

export const ATTRIBUTES: Array<{ key: keyof Bench; icon: typeof Accessibility; label: string }> = [
  { key: 'wheelchair_accessible', icon: Accessibility, label: 'Rollstuhlgerecht' },
  { key: 'stroller_friendly', icon: Baby, label: 'Kinderwagen geeignet' },
  { key: 'dog_friendly', icon: Dog, label: 'Hunde erlaubt' },
  { key: 'shade', icon: TreeDeciduous, label: 'Schatten' },
  { key: 'sun', icon: Sun, label: 'Sonnig' },
  { key: 'has_table', icon: Table2, label: 'Mit Tisch' },
  { key: 'has_water_fountain', icon: Droplets, label: 'Trinkbrunnen' },
  { key: 'has_trash_bin', icon: Trash2, label: 'Mülleimer' },
  { key: 'has_bbq', icon: Flame, label: 'Grillplatz' },
  { key: 'has_bike_rack', icon: Bike, label: 'Fahrradständer' },
  { key: 'view_lake', icon: Waves, label: 'Seeblick' },
  { key: 'view_mountain', icon: Mountain, label: 'Bergblick' },
  { key: 'view_city', icon: Building2, label: 'Stadtblick' },
]
