'use client'

import { useEffect, useState } from 'react'
import type { LacakResult, Penandatangan, Tujuan } from '@/types/surat'
import { MiniTable, SafeLink } from './shared'
import { actions } from '@/config/actions'
import { toWaLink } from '@/lib/whatsapp'

const SEARCH_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

function parse<T>(json: string, fallback: T): T {
  try { return JSON.parse(json) as T } catch { return fallback }
}

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)

function driveDownload(url: string) {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url
}


interface LacakStatusProps {
  initialQuery?: string
}

export default function LacakStatus({ initialQuery = '' }: LacakStatusProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<LacakResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<LacakResult | null>(null)

  async function search(q = query) {
    const s = q.trim()
    if (s.length < 2) { setError('Masukkan minimal 2 karakter'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/surat-keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lacak', query: s }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.message)
      setResults(j.results)
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Koneksi terputus. Coba cari lagi.')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  // Datang dari layar sukses → langsung cari kode tiketnya
  const [autoQuery] = useState(initialQuery)
  useEffect(() => { if (autoQuery) search(autoQuery) }, [autoQuery]) // hanya sekali saat mount

  return (
    <div className="sk-lacak">
      <form className="kontak-search-box sk-search" onSubmit={(e) => { e.preventDefault(); search() }} role="search">
        <span className="kontak-search-icon">{SEARCH_ICON}</span>
        <label htmlFor="sk-q" className="sr-only">Kode tiket, nama, atau nomor WA</label>
        <input
          id="sk-q"
          className="kontak-search-input"
          type="search"
          placeholder="Kode tiket, nama, atau nomor WA"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="sk-search-btn" disabled={loading}>{loading ? 'Mencari…' : 'Cari'}</button>
      </form>

      {error && <div className="sk-alert" role="alert">{error}</div>}

      {loading && !results && (
        <div className="sk-results" aria-busy="true">
          {[0, 1].map((i) => <div key={i} className="sk-skel" />)}
        </div>
      )}

      {results && results.length === 0 && (
        <div className="sk-empty">
          <p>Tidak ada request yang cocok dengan <b>&ldquo;{query}&rdquo;</b>.</p>
          <p>Cek lagi kode tiket (contoh SR-202610-004), atau coba cari pakai nama lengkap.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="sk-results">
          {results.map((r) => (
            <button type="button" key={r.kodeTiket} className="sk-result" onClick={() => setDetail(r)}>
              <div className="sk-result-top">
                <span className="sk-badge">{r.kodeTiket}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="sk-result-title">{r.perihal || '(tanpa perihal)'}</div>
              <div className="sk-result-meta">
                <span>{r.nama}</span>
                {r.jabatan && <span>{r.jabatan}</span>}
                {r.tanggalDibutuhkan && <span>Dibutuhkan {r.tanggalDibutuhkan}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {!results && !loading && !error && (
        <p className="sk-empty sk-empty-idle">Kode tiket dikirim lewat WhatsApp setelah request masuk, formatnya <code>SR-YYYYMM-XXX</code>.</p>
      )}

      {detail && <DetailModal r={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const done = status === 'Selesai'
  return <span className={`sk-status${done ? ' done' : ''}`}>{done ? '✓ Selesai' : 'Diproses'}</span>
}

function DetailModal({ r, onClose }: { r: LacakResult; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const done = r.status === 'Selesai'
  const tujuan = parse<Tujuan | null>(r.tujuanJSON, null)
  const tanda = parse<Penandatangan[]>(r.penandatanganJSON, [])
  const lampiran = parse<string[]>(r.lampiranJSON, [])
  const nomor = lines(r.nomorSurat)
  const pdfs = lines(r.linkPDF)

  // Label per PDF: kolom yang mengandung "nama", fallback ke kolom Tujuan
  const pdfLabels: string[] = []
  if (tujuan?.type === 'tabel') {
    const namaIdx = tujuan.data.headers.findIndex((h, i) => i > 0 && /nama/i.test(h))
    let last = ''
    tujuan.data.rows.forEach((row) => {
      if (row[0]?.trim()) last = row[0].trim()
      pdfLabels.push((namaIdx > 0 && row[namaIdx]?.trim()) || last)
    })
  }

  return (
    <div className="backdrop open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal sk-modal" role="dialog" aria-modal="true" aria-labelledby="dt-title">
        <div className="modal-head">
          <div className="m-titles">
            <div className="m-title" id="dt-title">{r.perihal || '(tanpa perihal)'}</div>
            <div className="m-tl">{r.kodeTiket}</div>
          </div>
          <button type="button" className="m-close" aria-label="Tutup" onClick={onClose}>✕</button>
        </div>

        <div className="m-body sk-rv">
          <ol className="sk-progress">
            <li className="done">Request masuk</li>
            <li className={done ? 'done' : 'active'}>Diproses sekretaris</li>
            <li className={done ? 'done' : ''}>Selesai</li>
          </ol>

          <dl className="sk-kv">
            <dt>Pemohon</dt><dd>{r.nama}</dd>
            {r.jabatan && (<><dt>Jabatan</dt><dd>{r.jabatan}</dd></>)}
            <dt>Dibutuhkan</dt><dd>{r.tanggalDibutuhkan || '—'}</dd>
          </dl>

          {done && (pdfs.length > 0 || r.linkFolder) && (
            <div className="sk-done">
              <h4>Surat sudah jadi</h4>
              {pdfs.map((url, i) => (
                <div className="sk-pdf" key={i}>
                  <div className="sk-pdf-info">
                    <div className="sk-pdf-no">{nomor[i] || `PDF ${i + 1}`}</div>
                    {pdfLabels[i] && <div className="sk-pdf-lbl">{pdfLabels[i]}</div>}
                  </div>
                  <div className="sk-pdf-act">
                    <SafeLink href={url}>Buka</SafeLink>
                    <SafeLink href={driveDownload(url)}>Unduh</SafeLink>
                  </div>
                </div>
              ))}
              {r.linkFolder && <SafeLink href={r.linkFolder}>Buka folder dokumen final →</SafeLink>}
            </div>
          )}

          {tujuan && (
            <>
              <h4>Tujuan</h4>
              {tujuan.type === 'tabel'
                ? <MiniTable headers={tujuan.data.headers} rows={tujuan.data.rows} />
                : <SafeLink href={tujuan.url} />}
            </>
          )}

          {r.konteks && (<><h4>Keperluan</h4><p className="sk-rv-text">{r.konteks}</p></>)}

          {tanda.length > 0 && (
            <>
              <h4>Penandatangan</h4>
              <MiniTable headers={['Jabatan', 'Nama', 'NRP/NIP']} rows={tanda.map((p) => [p.jabatan, p.nama, p.nrp])} />
            </>
          )}

          {lampiran.length > 0 && (
            <>
              <h4>Lampiran</h4>
              {lampiran.map((l, i) => <div key={i}><SafeLink href={l} /></div>)}
            </>
          )}
        </div>

        <div className="m-foot">
          <a className="mf-wa" href={toWaLink(actions.tanyaSekre.wa)} target="_blank" rel="noopener noreferrer">Tanya sekretaris</a>
          <button type="button" className="mf-secondary" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  )
}
