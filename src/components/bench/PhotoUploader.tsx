import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface PhotoUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  max?: number
}

const MAX_DIMENSION = 2000
const JPEG_QUALITY = 0.82
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', JPEG_QUALITY)
  )
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}

export default function PhotoUploader({ files, onChange, max = 8 }: PhotoUploaderProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  const addFiles = useCallback(
    async (incoming: FileList | null) => {
      if (!incoming) return
      setBusy(true)
      setError(null)
      const remaining = max - files.length
      const selected = Array.from(incoming)
        .filter((file) => ALLOWED_IMAGE_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE)
        .slice(0, remaining)

      if (selected.length < Math.min(incoming.length, remaining)) {
        setError('Nur JPG, PNG oder WebP bis 5 MB pro Datei.')
      }

      const compressed = await Promise.all(selected.map(compressImage))
      onChange([...files, ...compressed])
      setBusy(false)
    },
    [files, max, onChange]
  )

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {files.map((_file, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            <img src={previews[i]} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              aria-label="Bild entfernen"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {files.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-forest-200 bg-white text-forest-700 transition hover:border-forest-400 disabled:opacity-50 dark:border-white/10 dark:bg-stone-900 dark:text-forest-200"
          >
            <ImagePlus size={20} />
            <span className="text-[11px]">{busy ? 'Komprimiere…' : 'Hinzufügen'}</span>
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  )
}
