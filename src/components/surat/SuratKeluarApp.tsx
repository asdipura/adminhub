'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAB from '@/components/ui/FAB'
import SuratKeluarForm from './SuratKeluarForm'
import LacakStatus from './LacakStatus'

type Tab = 'request' | 'lacak'

export default function SuratKeluarApp() {
  const [tab, setTab] = useState<Tab>('request')
  const [kodeTiket, setKodeTiket] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [lacakQuery, setLacakQuery] = useState('')

  // Deep link: /surat-keluar?tab=lacak&q=SR-202610-004
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'lacak') {
      setLacakQuery(params.get('q') ?? '')
      setTab('lacak')
    }
  }, [])

  function switchTab(t: Tab) {
    setTab(t)
    const url = t === 'lacak' ? '?tab=lacak' : window.location.pathname
    window.history.replaceState(null, '', url)
  }

  function onDone(kode: string) {
    setKodeTiket(kode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function newRequest() {
    setKodeTiket('')
    setFormKey((k) => k + 1)
  }

  return (
    <>
      <Navbar />

      <div className="sk-page">
        <section className="kontak-hero sk-hero">
          <div className="kontak-hero-bg"></div>
          <div className="kontak-hero-grid"></div>
          <div className="kontak-hero-vignette"></div>
          <div className="kontak-hero-content">
            <div className="kontak-hero-eyebrow">HIMAIDE ITS &middot; Sistem Surat</div>
            <h1>Surat Keluar</h1>
            <p className="kontak-hero-sub">Ajukan surat resmi dan pantau prosesnya di satu tempat</p>
          </div>
        </section>

        <div className="kontak-search-wrap">
          <div className="kontak-search-line"></div>
          <div className="seg-ctrl sk-tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'request'} className={`seg-btn${tab === 'request' ? ' on' : ''}`} onClick={() => switchTab('request')}>
              ✉️ Request Surat
            </button>
            <button role="tab" aria-selected={tab === 'lacak'} className={`seg-btn${tab === 'lacak' ? ' on' : ''}`} onClick={() => switchTab('lacak')}>
              🔍 Lacak Status
            </button>
          </div>
          <div className="kontak-search-line"></div>
        </div>

        <div className="sk-body">
          {/* Tetap ter-mount saat pindah tab supaya isian tidak hilang */}
          {!kodeTiket && (
            <div hidden={tab !== 'request'}>
              <SuratKeluarForm key={formKey} onDone={onDone} onLacak={(q) => { setLacakQuery(q); switchTab('lacak') }} />
            </div>
          )}

          {tab === 'request' && kodeTiket && (
            <div className="fm-card sk-success">
              <div className="sk-success-icon" aria-hidden="true">✓</div>
              <h2>Request terkirim</h2>
              <p>Simpan kode tiket ini untuk melacak status surat kamu.</p>
              <div className="sk-ticket">
                <span>Kode tiket</span>
                <strong>{kodeTiket}</strong>
              </div>
              <ol className="sk-next">
                <li>Sekretaris menerima notifikasi berisi detail request kamu.</li>
                <li>Konfirmasi dan kabar selanjutnya dikirim lewat WhatsApp.</li>
                <li>Pantau status kapan saja di tab <b>Lacak Status</b>.</li>
              </ol>
              <div className="sk-nav sk-nav-center">
                <button type="button" className="mf-secondary" onClick={newRequest}>Ajukan surat lain</button>
                <button type="button" className="mf-primary" onClick={() => { setLacakQuery(kodeTiket); switchTab('lacak') }}>Lacak request ini</button>
              </div>
            </div>
          )}

          {tab === 'lacak' && <LacakStatus key={lacakQuery} initialQuery={lacakQuery} />}
        </div>
      </div>

      <Footer />
      <FAB />
    </>
  )
}
