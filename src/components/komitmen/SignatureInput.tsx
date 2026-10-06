'use client'

import { useRef, useState } from 'react'

export type Signature = { base64: string; mime: 'image/png' | 'image/jpeg'; w: number; h: number; preview: string }

const MAX_FILE = 10 * 1024 * 1024
const MAX_SIDE = 1000 // px — cukup tajam untuk TTD 160px di surat, dan ringan dikirim

/**
 * Kecilkan gambar di browser sebelum dikirim (foto HP bisa 5–10 MB, batas request ±4 MB).
 * PNG tetap PNG supaya latar transparan terjaga; selain itu jadi JPEG berlatar putih.
 */
async function prepare(file: File): Promise<Signature> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Gambar tidak bisa dibaca'))
      el.src = url
    })
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    const png = file.type === 'image/png'
    if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h) }
    ctx.drawImage(img, 0, 0, w, h)

    let mime: Signature['mime'] = png ? 'image/png' : 'image/jpeg'
    let dataUrl = canvas.toDataURL(mime, 0.9)
    if (dataUrl.length > 2_500_000) {
      // PNG hasil foto bisa tetap besar — ratakan ke latar putih lalu jadikan JPEG
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      mime = 'image/jpeg'
      dataUrl = canvas.toDataURL(mime, 0.85)
    }
    return { base64: dataUrl.split(',')[1], mime, w, h, preview: dataUrl }
  } finally {
    URL.revokeObjectURL(url)
  }
}

interface SignatureInputProps {
  value: Signature | null
  onChange: (s: Signature | null) => void
  error?: string
}

export default function SignatureInput({ value, onChange, error }: SignatureInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [localErr, setLocalErr] = useState('')

  async function load(file: File | undefined) {
    if (!file) return
    setLocalErr('')
    if (!file.type.startsWith('image/')) return setLocalErr('File harus berupa gambar (PNG atau JPG).')
    if (file.size > MAX_FILE) return setLocalErr('Ukuran file melebihi 10 MB. Pakai gambar yang lebih kecil.')
    setBusy(true)
    try {
      onChange(await prepare(file))
    } catch {
      setLocalErr('Gambar tidak bisa dibaca. Coba simpan ulang sebagai PNG atau JPG.')
    } finally {
      setBusy(false)
    }
  }

  const err = localErr || error

  if (value) {
    return (
      <div className="km-sig">
        <img src={value.preview} alt="Pratinjau tanda tangan" />
        <button type="button" className="fp-change" onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}>
          Ganti gambar
        </button>
      </div>
    )
  }

  return (
    <>
      <label
        className={`km-drop${drag ? ' on' : ''}${err ? ' err' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); load(e.dataTransfer.files[0]) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => load(e.target.files?.[0])}
        />
        <span className="km-drop-ico" aria-hidden="true">✍️</span>
        <span className="km-drop-title">{busy ? 'Memproses gambar…' : 'Pilih gambar tanda tangan'}</span>
        <span className="km-drop-sub">atau seret file ke sini · PNG / JPG, latar putih atau transparan</span>
      </label>
      {err && <span className="fm-err">{err}</span>}
    </>
  )
}
