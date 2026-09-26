'use client'

import { useId, useMemo, useRef, useState } from 'react'
import type { FungsioPublic } from '@/types/pemohon'

interface FungsioPickerProps {
  list: FungsioPublic[]
  loading: boolean
  error?: string
  value: string
  onChange: (f: FungsioPublic | null) => void
  invalid?: boolean
}

export function jabatanLabel(f: FungsioPublic) {
  return !f.dept || f.dept === 'BPH' || f.jabatan.includes(f.dept) ? f.jabatan : `${f.jabatan} · ${f.dept}`
}

function subLabel(f: FungsioPublic) {
  return `${jabatanLabel(f)} – ${f.waMasked}`
}

export default function FungsioPicker({ list, loading, error, value, onChange, invalid }: FungsioPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const selected = list.find((f) => f.id === value)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((f) => `${f.nama} ${f.jabatan} ${f.dept}`.toLowerCase().includes(q))
  }, [list, query])

  function pick(f: FungsioPublic) {
    onChange(f)
    setQuery('')
    setOpen(false)
  }

  function clear() {
    onChange(null)
    setQuery('')
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function move(delta: number) {
    const next = Math.max(0, Math.min(matches.length - 1, hi + delta))
    setHi(next)
    listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter' && open && matches[hi]) { e.preventDefault(); pick(matches[hi]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  if (selected) {
    return (
      <div className="fp-selected">
        <div className="fp-avatar" aria-hidden="true">{selected.nama.charAt(0)}</div>
        <div className="fp-info">
          <div className="fp-name">{selected.nama}</div>
          <div className="fp-sub">{subLabel(selected)}</div>
        </div>
        <button type="button" className="fp-change" onClick={clear}>Ganti</button>
      </div>
    )
  }

  return (
    <div className="fp" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
      <input
        ref={inputRef}
        id="fm-fungsio"
        className={`fm-input${invalid ? ' err' : ''}`}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[hi] ? `${listId}-${hi}` : undefined}
        autoComplete="off"
        placeholder={loading ? 'Memuat daftar fungsio…' : 'Ketik nama kamu…'}
        disabled={loading}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && !loading && (
        <ul className="fp-list" id={listId} role="listbox" ref={listRef}>
          {error && <li className="fp-empty">{error}</li>}
          {!error && matches.length === 0 && (
            <li className="fp-empty">Nama tidak ditemukan. Belum isi Kontrak Kerja? Pilih <b>Warga</b>.</li>
          )}
          {matches.map((f, i) => (
            <li
              key={f.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === hi}
              className={`fp-opt${i === hi ? ' hi' : ''}`}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(f) }}
            >
              <span className="fp-opt-name">{f.nama}</span>
              <span className="fp-opt-sub">{subLabel(f)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
