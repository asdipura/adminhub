'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAB from '@/components/ui/FAB'
import KomitmenForm from './KomitmenForm'
import { KOMITMEN, komitmenWindow } from '@/config/komitmen'

type Win = ReturnType<typeof komitmenWindow>

export default function KomitmenApp() {
  // Dihitung setelah mount: halaman bisa di-render statis saat build
  const [win, setWin] = useState<Win | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => { setWin(komitmenWindow()) }, [])

  return (
    <>
      <Navbar />

      <div className="sk-page">
        <section className="kontak-hero sk-hero km-hero">
          <div className="kontak-hero-bg"></div>
          <div className="kontak-hero-grid"></div>
          <div className="kontak-hero-vignette"></div>
          <div className="kontak-hero-content">
            <div className="kontak-hero-eyebrow">HIMAIDE ITS &middot; {KOMITMEN.kegiatan}</div>
            <h1>Komitmen Iuran</h1>
            <p className="kontak-hero-sub">
              {win?.open
                ? `Isi surat pernyataan komitmen pembayaran iuran · dibuka sampai ${win.hariTerakhir}`
                : 'Surat pernyataan komitmen pembayaran iuran'}
            </p>
          </div>
        </section>

        <div className="sk-body">
          {win && !win.open && (
            <div className="fm-card sk-success">
              <div className="km-closed-icon" aria-hidden="true">⏳</div>
              <h2>Pengisian sudah ditutup</h2>
              <p>Belum sempat mengisi? Hubungi Sekretaris HIMA IDE.</p>
              <div className="sk-nav sk-nav-center">
                <Link href="/" className="mf-primary">Kembali ke beranda</Link>
              </div>
            </div>
          )}

          {win?.open && pdfUrl === null && (
            <KomitmenForm onDone={(url) => { setPdfUrl(url); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          )}

          {pdfUrl !== null && (
            <div className="fm-card sk-success">
              <div className="sk-success-icon" aria-hidden="true">✓</div>
              <h2>Surat pernyataan tersimpan</h2>
              <p>Suratmu sudah dibuat dan tersimpan di Google Drive HIMA IDE. Simpan salinannya lewat tombol di bawah.</p>
              <div className="sk-nav sk-nav-center">
                {/^https?:\/\//.test(pdfUrl) && (
                  <a className="mf-primary" href={pdfUrl} target="_blank" rel="noopener noreferrer">Buka surat PDF</a>
                )}
                <Link href="/" className="mf-secondary">Kembali ke beranda</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <FAB />
    </>
  )
}
