import type { Metadata } from 'next'
import SuratKeluarApp from '@/components/surat/SuratKeluarApp'

export const metadata: Metadata = {
  title: 'Surat Keluar',
  description: 'Ajukan surat keluar resmi HIMAIDE ITS dan lacak status prosesnya.',
}

export default function SuratKeluarPage() {
  return <SuratKeluarApp />
}
