'use client'

import { useEffect, useState } from 'react'
import FungsioPicker, { jabatanLabel } from './FungsioPicker'
import type { FungsioPublic, Pemohon } from '@/types/pemohon'

export type PemohonState = {
  tipe: 'fungsio' | 'warga'
  fungsioId: string
  /** Label tampilan fungsio terpilih (WA sudah dimasking dari server) */
  fungsioNama: string
  fungsioJabatan: string
  fungsioWA: string
  nama: string
  noWA: string
  nrp: string
}

export type PemohonErrors = Partial<Record<'fungsio' | 'nama' | 'noWA' | 'nrp', string>>

const STORAGE_KEY = 'himaide:pemohon'

export const emptyPemohon: PemohonState = { tipe: 'fungsio', fungsioId: '', fungsioNama: '', fungsioJabatan: '', fungsioWA: '', nama: '', noWA: '62', nrp: '' }

/** Pemohon terakhir di browser ini — supaya request berikutnya tinggal lanjut. */
export function loadSavedPemohon(): PemohonState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...emptyPemohon, ...JSON.parse(raw) } : emptyPemohon
  } catch {
    return emptyPemohon
  }
}

export function savePemohon(p: PemohonState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch { /* abaikan */ }
}

export function validatePemohon(p: PemohonState): PemohonErrors {
  const e: PemohonErrors = {}
  if (p.tipe === 'fungsio') {
    if (!p.fungsioId) e.fungsio = 'Pilih nama kamu dari daftar'
    return e
  }
  if (!p.nama.trim()) e.nama = 'Nama wajib diisi'
  if (p.noWA === '62') e.noWA = 'Nomor WhatsApp wajib diisi'
  else if (!/^62\d{8,13}$/.test(p.noWA)) e.noWA = 'Nomor WA belum lengkap, contoh 6281234567890'
  if (!/^\d{10,14}$/.test(p.nrp.trim())) e.nrp = 'NRP harus 10–14 digit angka'
  return e
}

export function toPemohon(p: PemohonState): Pemohon {
  return p.tipe === 'fungsio'
    ? { tipe: 'fungsio', id: p.fungsioId }
    : { tipe: 'warga', nama: p.nama.trim(), noWA: p.noWA, nrp: p.nrp.trim() }
}

/** 0812… / 812… / +62 812-… → 62812… */
function cleanWA(v: string) {
  let d = v.replace(/\D/g, '')
  if (d.startsWith('0')) d = '62' + d.slice(1)
  else if (d && !d.startsWith('62')) d = '62' + d
  return d || '62'
}

interface PemohonFieldsProps {
  value: PemohonState
  onChange: (v: PemohonState) => void
  errors: PemohonErrors
  onClearError: (k: keyof PemohonErrors) => void
}

export default function PemohonFields({ value, onChange, errors, onClearError }: PemohonFieldsProps) {
  const [list, setList] = useState<FungsioPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()

  useEffect(() => {
    fetch('/api/fungsio')
      .then((r) => r.json())
      .then((j) => { setList(j.data ?? []); if (j.error) setLoadError(j.error) })
      .catch(() => setLoadError('Daftar fungsio belum bisa dimuat. Coba muat ulang halaman.'))
      .finally(() => setLoading(false))
  }, [])

  // Pilihan tersimpan (localStorage) yang sudah tidak ada di daftar dianggap belum dipilih
  const fungsioId = !loading && !list.some((f) => f.id === value.fungsioId) ? '' : value.fungsioId

  const set = (patch: Partial<PemohonState>, clear?: keyof PemohonErrors) => {
    onChange({ ...value, ...patch })
    if (clear) onClearError(clear)
  }

  return (
    <div className="fm-pemohon">
      <div className="fm-toggle" role="radiogroup" aria-label="Kamu mengajukan sebagai">
        {(['fungsio', 'warga'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={value.tipe === t}
            className={`fm-toggle-btn${value.tipe === t ? ' on' : ''}`}
            onClick={() => set({ tipe: t })}
          >
            <span className="fm-toggle-title">{t === 'fungsio' ? 'Fungsio HIMAIDE' : 'Warga IDE'}</span>
            <span className="fm-toggle-sub">{t === 'fungsio' ? 'Cukup pilih nama kamu' : 'Belum terdaftar sebagai fungsio'}</span>
          </button>
        ))}
      </div>

      {value.tipe === 'fungsio' ? (
        <div className="fm-field">
          <label className="fm-label" htmlFor="fm-fungsio">Nama kamu</label>
          <FungsioPicker
            list={list}
            loading={loading}
            error={loadError}
            value={fungsioId}
            onChange={(f) => set({ fungsioId: f?.id ?? '', fungsioNama: f?.nama ?? '', fungsioJabatan: f ? jabatanLabel(f) : '', fungsioWA: f?.waMasked ?? '' }, 'fungsio')}
            invalid={!!errors.fungsio}
          />
          {errors.fungsio
            ? <span className="fm-err">{errors.fungsio}</span>
            : <span className="fm-hint">Data diambil dari Kontrak Kerja. Konfirmasi dikirim ke nomor WA yang terdaftar.</span>}
        </div>
      ) : (
        <>
          <div className="fm-field">
            <label className="fm-label" htmlFor="fm-nama">Nama lengkap</label>
            <input
              id="fm-nama"
              className={`fm-input${errors.nama ? ' err' : ''}`}
              autoComplete="name"
              value={value.nama}
              onChange={(e) => set({ nama: e.target.value }, 'nama')}
            />
            {errors.nama && <span className="fm-err">{errors.nama}</span>}
          </div>
          <div className="fm-row">
            <div className="fm-field">
              <label className="fm-label" htmlFor="fm-wa">Nomor WhatsApp</label>
              <input
                id="fm-wa"
                className={`fm-input${errors.noWA ? ' err' : ''}`}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={16}
                value={value.noWA}
                onChange={(e) => set({ noWA: cleanWA(e.target.value) }, 'noWA')}
              />
              {errors.noWA ? <span className="fm-err">{errors.noWA}</span> : <span className="fm-hint">Format 62xxx</span>}
            </div>
            <div className="fm-field">
              <label className="fm-label" htmlFor="fm-nrp">NRP</label>
              <input
                id="fm-nrp"
                className={`fm-input${errors.nrp ? ' err' : ''}`}
                inputMode="numeric"
                maxLength={14}
                placeholder="5028xxxxxx"
                value={value.nrp}
                onChange={(e) => set({ nrp: e.target.value.replace(/\D/g, '') }, 'nrp')}
              />
              {errors.nrp && <span className="fm-err">{errors.nrp}</span>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
