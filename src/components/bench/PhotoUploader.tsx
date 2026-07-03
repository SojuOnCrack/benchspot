import { useCallback, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface PhotoUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  max?: number
}

const MAX_DIMENSION = 2000
const JPEG_QUALITY = 0.82

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
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    async (incoming: FileList | null) => {
      if (!incoming) return
      setBusy(true)
      const remaining = max - files.length
      const selected = Array.from(incoming).slice(0, remaining)
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
        {files.map((file, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
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
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-forest-200 text-forest-500 transition hover:border-forest-400 disabled:opacity-50"
          >
            <ImagePlus size={20} />
            <span className="text-[11px]">{busy ? 'Komprimiere…' : 'Hinzufügen'}</span>
          </button>
        )}
      </div>
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
