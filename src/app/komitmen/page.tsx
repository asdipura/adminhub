import type { Metadata } from 'next'
import KomitmenApp from '@/components/komitmen/KomitmenApp'

export const metadata: Metadata = {
  title: 'Komitmen Iuran',
  description: 'Isi surat pernyataan komitmen pembayaran iuran Studi Ekskursi × Internalisasi HIMA IDE 2026.',
  robots: { index: false },
}

export default function KomitmenPage() {
  return <KomitmenApp />
}
