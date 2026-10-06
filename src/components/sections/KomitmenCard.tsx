'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { KOMITMEN, komitmenWindow } from '@/config/komitmen'

/** Card pengisian komitmen di atas shortcut — hanya tampil selama jendela pengisian. */
export default function KomitmenCard() {
  // Dihitung setelah mount supaya tidak bentrok dengan HTML hasil render server
  const [win, setWin] = useState<ReturnType<typeof komitmenWindow> | null>(null)
  useEffect(() => { setWin(komitmenWindow()) }, [])

  if (!win?.open) return null

  const sisa = win.sisaHari === 1 ? 'Hari terakhir' : `Sisa ${win.sisaHari} hari`

  return (
    <Link href="/komitmen" className="km-card">
      <div className="km-card-ico" aria-hidden="true">✍️</div>
      <div className="km-card-body">
        <div className="km-card-top">
          <span className="km-card-eyebrow">Wajib diisi · Fungsio &amp; Staff Magang</span>
          <span className={`km-card-chip${win.sisaHari <= 3 ? ' urgent' : ''}`}>{sisa}</span>
        </div>
        <div className="km-card-title">Surat Komitmen Iuran Internalisasi</div>
        <div className="km-card-desc">
          {KOMITMEN.kegiatan}. Pilih nama, cek surat, lalu unggah tanda tangan. Ditutup {win.hariTerakhir}.
        </div>
      </div>
      <span className="km-card-cta" aria-hidden="true">Isi sekarang →</span>
    </Link>
  )
}
