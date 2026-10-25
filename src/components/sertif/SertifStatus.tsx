'use client'

import { useEffect, useState } from 'react'
import { SafeLink, useElapsed } from '@/components/surat/shared'
import { toWaLink } from '@/lib/whatsapp'
import { KODE_SERT } from '@/config/sertif'
import CimdModal from './CimdModal'
import type { SertifStatus as Status } from '@/types/sertif'

const SEARCH_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

/** Warna badge dari teks status di sheet (mis. "✅ Selesai", "⚠️ Perlu Revisi") */
function tone(s: string) {
  if (/selesai|acc/i.test(s)) return ' done'
  if (/revisi|perlu/i.test(s)) return ' rev'
  return ''
}

function downloadCSV(st: Status) {
  const rows = [['No', 'Nama Peserta', 'Role', 'Nomor Sertifikat'], ...st.details.map((d, i) => [String(i + 1), d.namaPeserta, d.role, d.nomor])]
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `Sertifikat_${st.request.kode}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

interface SertifStatusProps {
  initialKode?: string
}

export default function SertifStatus({ initialKode = '' }: SertifStatusProps) {
  const [kode, setKode] = useState(initialKode)
  const [data, setData] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [cimdOpen, setCimdOpen] = useState(false)
  const elapsed = useElapsed(loading)

  async function search(q = kode) {
    const k = q.trim().toUpperCase()
    if (!KODE_SERT.test(k)) { setError('Format kode salah. Contoh: SERT-20261012-001'); return }
    setKode(k)
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sertif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', kode: k }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.message)
      setData(j)
      window.history.replaceState(null, '', `?tab=status&kode=${k}`)
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Koneksi terputus. Coba cek lagi.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const [autoKode] = useState(initialKode)
  useEffect(() => { if (autoKode) search(autoKode) }, [autoKode]) // hanya sekali saat mount

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied((c) => (c === label ? '' : c)), 1800)
    })
  }

  const r = data?.request
  const done = !!r && /selesai/i.test(r.status)
  const hasNomor = !!data?.details.some((d) => d.nomor)
  const waMsg = r ? `Halo, saya ingin menanyakan request sertifikat kode *${r.kode}* (${r.namaKegiatan}).` : ''

  return (
    <div className="sk-lacak">
      <form className="kontak-search-box sk-search" onSubmit={(e) => { e.preventDefault(); search() }} role="search">
        <span className="kontak-search-icon">{SEARCH_ICON}</span>
        <label htmlFor="st-q" className="sr-only">Kode request sertifikat</label>
        <input
          id="st-q"
          className="kontak-search-input"
          type="search"
          placeholder="SERT-20261012-001"
          autoComplete="off"
          maxLength={24}
          value={kode}
          onChange={(e) => setKode(e.target.value.toUpperCase())}
        />
        <button type="submit" className="sk-search-btn" disabled={loading}>{loading ? 'Mencari…' : 'Cek'}</button>
      </form>

      {error && <div className="sk-alert" role="alert">{error}</div>}
      {loading && elapsed >= 4 && (
        <div className="sk-wait" role="status">Server sertifikat sedang lambat merespons, tunggu sebentar… ({elapsed} dtk)</div>
      )}
      {loading && !data && <div className="sk-results" aria-busy="true"><div className="sk-skel" /></div>}

      {!data && !loading && !error && (
        <p className="sk-empty sk-empty-idle">Kode didapat saat request berhasil dikirim, formatnya <code>SERT-YYYYMMDD-001</code>.</p>
      )}

      {data && r && (
        <div className="st-result">
          <section className="fm-card">
            <div className="sk-result-top">
              <span className="sk-badge">{r.kode}</span>
              <span className="st-badges">
                {r.statusCIMD && <span className={`sk-status${tone(r.statusCIMD)}`}>Master: {r.statusCIMD}</span>}
                <span className={`sk-status${tone(r.status)}`}>{r.status || 'Menunggu'}</span>
              </span>
            </div>
            <div className="sk-rv-perihal">{r.namaKegiatan}</div>
            <dl className="sk-kv">
              <dt>Pemohon</dt><dd>{r.nama}{r.nrp && ` · ${r.nrp}`}</dd>
              <dt>Jabatan</dt><dd>{r.jabatan || '—'}</dd>
              <dt>Jumlah</dt><dd>{r.jumlah || '—'} nomor</dd>
              <dt>Selesai acara</dt><dd>{r.tglSelesai || '—'}</dd>
              <dt>Dikirim</dt><dd>{r.timestamp || '—'}</dd>
              <dt>Master</dt><dd>{r.linkMaster ? <SafeLink href={r.linkMaster}>Lihat master desain</SafeLink> : 'Belum ada'}</dd>
            </dl>
            {r.noteCIMD && (
              <div className="st-note">
                <span>Catatan sekretaris / CIMD</span>
                <p>{r.noteCIMD}</p>
              </div>
            )}
          </section>

          {done && (
            <section className="fm-card st-cetak">
              <div>
                <h3>Siap cetak sertifikat?</h3>
                <p>Cetak massal sendiri pakai desainmu, atau minta tim CIMD yang mendesain dan memproduksi.</p>
              </div>
              <div className="st-cetak-btns">
                {data.config.tutorialUrl && (
                  <a className="mf-secondary" href={data.config.tutorialUrl} target="_blank" rel="noopener noreferrer">Generate sendiri ↗</a>
                )}
                <button type="button" className="mf-primary" onClick={() => setCimdOpen(true)}>Minta ke CIMD</button>
              </div>
            </section>
          )}

          <section className="fm-card">
            <header className="fm-card-head st-det-head">
              <h3>Nomor sertifikat{data.details.length > 0 && ` (${data.details.length})`}</h3>
              {hasNomor && (
                <div className="st-det-act">
                  <button type="button" className="fm-add" onClick={() => copy(data.details.map((d) => d.nomor).filter(Boolean).join('\n'), 'all')}>
                    {copied === 'all' ? '✓ Disalin' : 'Salin semua'}
                  </button>
                  <button type="button" className="fm-add" onClick={() => downloadCSV(data)}>Unduh CSV</button>
                </div>
              )}
            </header>
            {data.details.length === 0 ? (
              <p className="sk-empty sk-empty-idle st-det-empty">Nomor belum dibuat. Menunggu review sekretaris.</p>
            ) : (
              <div className="sk-mini-wrap">
                <table className="sk-mini st-det">
                  <thead><tr><th>#</th><th>Nama peserta</th><th>Role</th><th>Nomor</th></tr></thead>
                  <tbody>
                    {data.details.map((d, i) => (
                      <tr key={d.id || i}>
                        <td>{i + 1}</td>
                        <td>{d.namaPeserta || '—'}</td>
                        <td>{d.role || '—'}</td>
                        <td>
                          {d.nomor ? (
                            <button type="button" className="st-nomor" title="Klik untuk salin" onClick={() => copy(d.nomor, `n${i}`)}>
                              {d.nomor}{copied === `n${i}` && <span> ✓</span>}
                            </button>
                          ) : <span className="st-pending">belum dibuat</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="sk-nav sk-nav-center">
            {data.config.waSekre1 && (
              <a className="mf-wa" href={`${toWaLink(data.config.waSekre1)}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer">
                Tanya {data.config.namaSekre1 || 'Sekretaris 1'}
              </a>
            )}
            {data.config.waSekre2 && (
              <a className="mf-wa" href={`${toWaLink(data.config.waSekre2)}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer">
                Tanya {data.config.namaSekre2 || 'Sekretaris 2'}
              </a>
            )}
          </div>
        </div>
      )}

      {cimdOpen && data && <CimdModal status={data} onClose={() => setCimdOpen(false)} />}
    </div>
  )
}
