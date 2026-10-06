'use client'

import { useId, useMemo, useRef, useState } from 'react'

type Person = { id: string; nama: string }

interface NamePickerProps<T extends Person> {
  list: T[]
  loading: boolean
  error?: string
  value: string
  onChange: (p: T | null) => void
  invalid?: boolean
  inputId?: string
  /** Baris kecil di bawah nama (jabatan, dll.) */
  sub: (p: T) => string
  /** Teks tambahan yang ikut dicari selain nama */
  searchText?: (p: T) => string
  empty: React.ReactNode
}

// abaikan huruf besar, aksen, dan apostrof saat mencari (Nab'an = naban)
const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ'’`]/g, '').trim()

export default function NamePicker<T extends Person>({
  list, loading, error, value, onChange, invalid, inputId, sub, searchText, empty,
}: NamePickerProps<T>) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const selected = list.find((p) => p.id === value)

  const matches = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean)
    if (!words.length) return list
    return list.filter((p) => {
      const hay = norm(`${p.nama} ${searchText?.(p) ?? ''}`)
      return words.every((w) => hay.includes(w))
    })
  }, [list, query, searchText])

  function pick(p: T) {
    onChange(p)
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
          <div className="fp-sub">{sub(selected)}</div>
        </div>
        <button type="button" className="fp-change" onClick={clear}>Ganti</button>
      </div>
    )
  }

  return (
    <div className="fp" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
      <input
        ref={inputRef}
        id={inputId}
        className={`fm-input${invalid ? ' err' : ''}`}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[hi] ? `${listId}-${hi}` : undefined}
        autoComplete="off"
        placeholder={loading ? 'Memuat daftar nama…' : 'Ketik nama kamu…'}
        disabled={loading}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && !loading && (
        <ul className="fp-list" id={listId} role="listbox" ref={listRef}>
          {error && <li className="fp-empty">{error}</li>}
          {!error && matches.length === 0 && <li className="fp-empty">{empty}</li>}
          {matches.map((p, i) => (
            <li
              key={p.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === hi}
              className={`fp-opt${i === hi ? ' hi' : ''}`}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(p) }}
            >
              <span className="fp-opt-name">{p.nama}</span>
              <span className="fp-opt-sub">{sub(p)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
