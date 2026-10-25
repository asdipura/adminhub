'use client'

import { useCallback, useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAB from '@/components/ui/FAB'
import { toWaLink } from '@/lib/whatsapp'
import RoomList from './RoomList'
import ZoomForm from './ZoomForm'
import ZoomStatus from './ZoomStatus'
import type { Room, ZoomConfig } from '@/types/zoom'

type Tab = 'ruang' | 'request' | 'status'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ruang', label: '🟢 Ruang Rapat' },
  { id: 'request', label: '📅 Request Zoom' },
  { id: 'status', label: '🔍 Cek Status' },
]

const POLL_MS = 30_000

export default function ZoomApp() {
  const [tab, setTab] = useState<Tab>('ruang')
  const [config, setConfig] = useState<ZoomConfig | null>(null)
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [roomsError, setRoomsError] = useState('')
  const [done, setDone] = useState<{ code: string; nama: string } | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [statusQuery, setStatusQuery] = useState('')

  // Config ikut di panggilan pertama; selanjutnya cukup status ruang
  const load = useCallback(async (onlyRooms: boolean) => {
    try {
      const res = await fetch(onlyRooms ? '/api/zoom?only=rooms' : '/api/zoom', { cache: 'no-store' })
      const j = await res.json()
      if (!j.success) throw new Error(j.message)
      if (j.config) setConfig(j.config)
      setRooms(j.rooms)
      setRoomsError('')
    } catch (err) {
      setRoomsError(err instanceof Error && err.message ? err.message : 'Status ruang belum bisa dimuat.')
    }
  }, [])

  useEffect(() => {
    load(false)
    const params = new URLSearchParams(window.location.search)
    const t = params.get('tab')
    if (t === 'request' || t === 'status') setTab(t)
    if (t === 'status') setStatusQuery(params.get('q') ?? '')
  }, [load])

  // Perbarui status ruang berkala selama tab Ruang Rapat terbuka & halaman terlihat
  useEffect(() => {
    if (tab !== 'ruang') return
    const id = setInterval(() => { if (!document.hidden) load(true) }, POLL_MS)
    return () => clearInterval(id)
  }, [tab, load])

  function switchTab(t: Tab) {
    setTab(t)
    window.history.replaceState(null, '', t === 'ruang' ? window.location.pathname : `?tab=${t}`)
  }

  function openStatus(q: string) {
    setStatusQuery(q)
    switchTab('status')
  }

  const waMsg = done ? `Halo Ka Sekre, saya ${done.nama} sudah mengajukan request Zoom kode ${done.code}. Mohon diproses ya 🙏` : ''

  return (
    <>
      <Navbar />

      <div className="sk-page">
        <section className="kontak-hero sk-hero">
          <div className="kontak-hero-bg"></div>
          <div className="kontak-hero-grid"></div>
          <div className="kontak-hero-vignette"></div>
          <div className="kontak-hero-content">
            <div className="kontak-hero-eyebrow">HIMAIDE ITS &middot; Zoom Meeting</div>
            <h1>Zoom</h1>
            <p className="kontak-hero-sub">Pakai ruang rapat instan, atau ajukan Zoom terjadwal untuk kegiatan resmi</p>
          </div>
        </section>

        <div className="kontak-search-wrap">
          <div className="kontak-search-line"></div>
          <div className="seg-ctrl sk-tabs zm-tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={`seg-btn${tab === t.id ? ' on' : ''}`} onClick={() => switchTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="kontak-search-line"></div>
        </div>

        <div className="sk-body">
          {tab === 'ruang' && <RoomList rooms={rooms} config={config} error={roomsError} onRefresh={() => load(true)} />}

          {/* Tetap ter-mount saat pindah tab supaya isian tidak hilang */}
          {!done && (
            <div hidden={tab !== 'request'}>
              <ZoomForm key={formKey} calendarId={config?.calendarId ?? ''} onDone={(code, nama) => { setDone({ code, nama }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onCari={openStatus} />
            </div>
          )}

          {tab === 'request' && done && (
            <div className="fm-card sk-success">
              <div className="sk-success-icon" aria-hidden="true">✓</div>
              <h2>Request terkirim</h2>
              <p>Simpan kode ini untuk memantau status request Zoom kamu.</p>
              <div className="sk-ticket">
                <span>Kode request</span>
                <strong>{done.code}</strong>
              </div>
              <ol className="sk-next">
                <li><b>Hubungi sekretaris</b> — request baru diproses setelah kamu konfirmasi.</li>
                <li>Sekretaris membuatkan link Zoom dan mengisi host &amp; co-host.</li>
                <li>Link Zoom muncul di tab <b>Cek Status</b> setelah disetujui.</li>
              </ol>
              <div className="sk-nav sk-nav-center">
                {config?.sekre1Wa && <a className="mf-wa" href={`${toWaLink(config.sekre1Wa)}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer">Chat Sekre 1</a>}
                {config?.sekre2Wa && <a className="mf-wa" href={`${toWaLink(config.sekre2Wa)}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer">Chat Sekre 2</a>}
              </div>
              <div className="sk-nav sk-nav-center">
                <button type="button" className="mf-secondary" onClick={() => { setDone(null); setFormKey((k) => k + 1) }}>Request lain</button>
                <button type="button" className="mf-primary" onClick={() => openStatus(done.code)}>Pantau status</button>
              </div>
            </div>
          )}

          {tab === 'status' && <ZoomStatus key={statusQuery} initialQuery={statusQuery} config={config} />}
        </div>
      </div>

      <Footer />
      <FAB />
    </>
  )
}
