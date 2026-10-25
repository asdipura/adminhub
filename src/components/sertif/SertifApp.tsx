'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAB from '@/components/ui/FAB'
import SertifForm from './SertifForm'
import SertifStatus from './SertifStatus'

type Tab = 'request' | 'status'

export default function SertifApp() {
  const [tab, setTab] = useState<Tab>('request')
  const [kode, setKode] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [statusKode, setStatusKode] = useState('')

  // Deep link: /sertif?tab=status&kode=SERT-20261012-001
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'status') {
      setStatusKode(params.get('kode') ?? '')
      setTab('status')
    }
  }, [])

  function switchTab(t: Tab) {
    setTab(t)
    window.history.replaceState(null, '', t === 'status' ? '?tab=status' : window.location.pathname)
  }

  function onDone(k: string) {
    setKode(k)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function newRequest() {
    setKode('')
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
            <div className="kontak-hero-eyebrow">HIMAIDE ITS &middot; Sistem Sertifikat</div>
            <h1>Sertifikat</h1>
            <p className="kontak-hero-sub">Ajukan nomor sertifikat kegiatan, pantau statusnya, lalu cetak sendiri atau minta ke CIMD</p>
          </div>
        </section>

        <div className="kontak-search-wrap">
          <div className="kontak-search-line"></div>
          <div className="seg-ctrl sk-tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'request'} className={`seg-btn${tab === 'request' ? ' on' : ''}`} onClick={() => switchTab('request')}>
              🏅 Request Nomor
            </button>
            <button role="tab" aria-selected={tab === 'status'} className={`seg-btn${tab === 'status' ? ' on' : ''}`} onClick={() => switchTab('status')}>
              🔍 Cek Status
            </button>
          </div>
          <div className="kontak-search-line"></div>
        </div>

        <div className="sk-body">
          {/* Tetap ter-mount saat pindah tab supaya isian tidak hilang */}
          {!kode && (
            <div hidden={tab !== 'request'}>
              <SertifForm key={formKey} onDone={onDone} />
            </div>
          )}

          {tab === 'request' && kode && (
            <div className="fm-card sk-success">
              <div className="sk-success-icon" aria-hidden="true">✓</div>
              <h2>Request terkirim</h2>
              <p>Simpan kode ini — dipakai untuk cek status dan melihat nomor sertifikat.</p>
              <div className="sk-ticket">
                <span>Kode request</span>
                <strong>{kode}</strong>
              </div>
              <ol className="sk-next">
                <li>Sekretaris menerima notifikasi dan mereview master desain.</li>
                <li>Nomor sertifikat dibuat, kabarnya dikirim lewat WhatsApp.</li>
                <li>Lihat &amp; unduh nomornya di tab <b>Cek Status</b>.</li>
              </ol>
              <div className="sk-nav sk-nav-center">
                <button type="button" className="mf-secondary" onClick={newRequest}>Request lain</button>
                <button type="button" className="mf-primary" onClick={() => { setStatusKode(kode); switchTab('status') }}>Cek status request ini</button>
              </div>
            </div>
          )}

          {tab === 'status' && <SertifStatus key={statusKode} initialKode={statusKode} />}
        </div>
      </div>

      <Footer />
      <FAB />
    </>
  )
}
