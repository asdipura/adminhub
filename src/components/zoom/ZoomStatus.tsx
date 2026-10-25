'use client'

import { useEffect, useState } from 'react'
import { SafeLink, useElapsed } from '@/components/surat/shared'
import { toWaLink } from '@/lib/whatsapp'
import { KODE_ZOOM } from '@/config/zoom'
import type { ZoomConfig, ZoomSearchItem, ZoomStatus as Status } from '@/types/zoom'

const SEARCH_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

// Sheet: "Menunggu Approve" → "Approved" (diisi sekretaris)
const isApproved = (s: string) => s.trim().toLowerCase() === 'approved'

function StatusBadge({ status }: { status: string }) {
  const ok = isApproved(status)
  return <span className={`sk-status${ok ? ' done' : ''}`}>{ok ? '✓ Disetujui' : status || 'Menunggu'}</span>
}

async function post<T>(body: object): Promise<T> {
  const res = await fetch('/api/zoom', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const j = await res.json()
  if (!j.success) throw new Error(j.message)
  return j
}

interface ZoomStatusProps {
  initialQuery?: string
  config: ZoomConfig | null
}

export default function ZoomStatus({ initialQuery = '', config }: ZoomStatusProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<ZoomSearchItem[] | null>(null)
  const [detail, setDetail] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const elapsed = useElapsed(loading)

  async function run(q = query) {
    const s = q.trim()
    if (s.length < 2) { setError('Masukkan minimal 2 karakter'); return }
    setLoading(true)
    setError('')
    setDetail(null)
    try {
      // Kode lengkap → langsung buka detail; selain itu cari nama/topik
      if (KODE_ZOOM.test(s.toUpperCase())) {
        const j = await post<{ data: Status }>({ action: 'status', code: s.toUpperCase() })
        setDetail(j.data)
        setResults(null)
      } else {
        const j = await post<{ results: ZoomSearchItem[] }>({ action: 'search', query: s })
        setResults(j.results)
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Koneksi terputus. Coba cari lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function open(code: string) {
    setLoading(true)
    setError('')
    try {
      const j = await post<{ data: Status }>({ action: 'status', code })
      setDetail(j.data)
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Koneksi terputus. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const [autoQuery] = useState(initialQuery)
  useEffect(() => { if (autoQuery) run(autoQuery) }, [autoQuery]) // hanya sekali saat mount

  return (
    <div className="sk-lacak">
      <form className="kontak-search-box sk-search" onSubmit={(e) => { e.preventDefault(); run() }} role="search">
        <span className="kontak-search-icon">{SEARCH_ICON}</span>
        <label htmlFor="zm-q" className="sr-only">Kode request, nama PIC, atau topik</label>
        <input
          id="zm-q"
          className="kontak-search-input"
          type="search"
          placeholder="Kode request, nama PIC, atau topik"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="sk-search-btn" disabled={loading}>{loading ? 'Mencari…' : 'Cari'}</button>
      </form>

      {error && <div className="sk-alert" role="alert">{error}</div>}
      {loading && elapsed >= 4 && (
        <div className="sk-wait" role="status">Server Zoom sedang lambat merespons, tunggu sebentar… ({elapsed} dtk)</div>
      )}
      {loading && !results && !detail && <div className="sk-results" aria-busy="true"><div className="sk-skel" /></div>}

      {!results && !detail && !loading && !error && (
        <p className="sk-empty sk-empty-idle">Kode request didapat saat request berhasil dikirim, formatnya <code>IDE-XXXXX</code>.</p>
      )}

      {detail && (
        <Detail
          r={detail}
          config={config}
          onBack={results ? () => setDetail(null) : undefined}
        />
      )}

      {!detail && results && results.length === 0 && (
        <div className="sk-empty">
          <p>Tidak ada request yang cocok dengan <b>&ldquo;{query}&rdquo;</b>.</p>
          <p>Coba pakai kode request (contoh IDE-AB12C) atau nama lengkap PIC.</p>
        </div>
      )}

      {!detail && results && results.length > 0 && (
        <div className="sk-results">
          {results.map((r) => (
            <button type="button" key={r.code} className="sk-result" onClick={() => open(r.code)} disabled={loading}>
              <div className="sk-result-top">
                <span className="sk-badge">{r.code}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="sk-result-title">{r.topik || '(tanpa topik)'}</div>
              <div className="sk-result-meta">
                <span>{r.namaPIC}</span>
                {r.tanggal && <span>{r.tanggal}{r.jam && ` · ${r.jam} WIB`}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Detail({ r, config, onBack }: { r: Status; config: ZoomConfig | null; onBack?: () => void }) {
  const [copied, setCopied] = useState('')
  const ok = isApproved(r.status)
  const host = r.hostEmail || r.emailHost
  const msg = `Halo Ka Sekre, saya ${r.namaPIC} ingin menanyakan request Zoom kode ${r.code} 🙏`
  const invitation = `📹 UNDANGAN ZOOM MEETING\nHIMA IDE ITS\n\n${r.topik}\n📅 ${r.tanggal} · ${r.jam} WIB\n⏱ ${r.durasi} menit\n\n🔗 ${r.zoomLink}\nHost: ${host}\n\nSalam,\nHIMA IDE ITS`

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied((c) => (c === label ? '' : c)), 1800)
    })
  }

  return (
    <div className="st-result">
      {onBack && <button type="button" className="fm-add zm-back" onClick={onBack}>← Kembali ke hasil</button>}

      <section className="fm-card sk-rv">
        <div className="sk-result-top">
          <span className="sk-badge">{r.code}</span>
          <StatusBadge status={r.status} />
        </div>
        <div className="sk-rv-perihal">{r.topik}</div>

        <ol className="sk-progress">
          <li className="done">Request masuk</li>
          <li className={ok ? 'done' : 'active'}>Diproses sekretaris</li>
          <li className={ok ? 'done' : ''}>Link Zoom siap</li>
        </ol>

        <dl className="sk-kv">
          <dt>PIC</dt><dd>{r.namaPIC}{r.nrp && ` · ${r.nrp}`}</dd>
          <dt>Jadwal</dt><dd>{r.tanggal} · {r.jam} WIB</dd>
          <dt>Durasi</dt><dd>{r.durasi} menit</dd>
          <dt>Host</dt><dd>{host || '—'}</dd>
          {ok && r.cohostEmails && (<><dt>Co-host</dt><dd>{r.cohostEmails}</dd></>)}
        </dl>

        {ok ? (
          <div className="sk-done">
            <h4>Link Zoom meeting</h4>
            {r.zoomLink ? (
              <div className="zm-link">
                <SafeLink href={r.zoomLink} />
                <button type="button" className="fm-add" onClick={() => copy(r.zoomLink, 'link')}>{copied === 'link' ? '✓ Disalin' : 'Salin'}</button>
              </div>
            ) : <p className="sk-rv-text">Link belum diisi sekretaris.</p>}
            <div className="zm-room-act">
              {/^https:\/\//.test(r.gcalUrl) && (
                <a className="mf-secondary" href={r.gcalUrl} target="_blank" rel="noopener noreferrer">📅 Tambah ke kalender</a>
              )}
              {r.zoomLink && (
                <button type="button" className="mf-secondary" onClick={() => copy(invitation, 'inv')}>{copied === 'inv' ? '✓ Undangan disalin' : 'Salin undangan'}</button>
              )}
              {config?.notulensiUrl && /^https?:\/\//.test(config.notulensiUrl) && (
                <a className="mf-secondary" href={config.notulensiUrl} target="_blank" rel="noopener noreferrer">📝 Notulensi ↗</a>
              )}
            </div>
          </div>
        ) : (
          <p className="sk-rv-text zm-pending-note">Hubungi sekretaris untuk memberi tahu bahwa request sudah diajukan — request baru diproses setelah kamu menghubungi narahubung.</p>
        )}
      </section>

      <div className="sk-nav sk-nav-center">
        {config?.sekre1Wa && (
          <a className="mf-wa" href={`${toWaLink(config.sekre1Wa)}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">Hubungi Sekre 1</a>
        )}
        {config?.sekre2Wa && (
          <a className="mf-wa" href={`${toWaLink(config.sekre2Wa)}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">Hubungi Sekre 2</a>
        )}
      </div>
    </div>
  )
}
