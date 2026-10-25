import type { Metadata } from 'next'
import SertifApp from '@/components/sertif/SertifApp'

export const metadata: Metadata = {
  title: 'Sertifikat',
  description: 'Ajukan nomor sertifikat kegiatan HIMAIDE ITS, cek statusnya, dan minta desain ke CIMD.',
}

export default function SertifPage() {
  return <SertifApp />
}
