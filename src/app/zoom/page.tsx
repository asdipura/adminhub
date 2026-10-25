import type { Metadata } from 'next'
import ZoomApp from '@/components/zoom/ZoomApp'

export const metadata: Metadata = {
  title: 'Zoom',
  description: 'Pakai ruang rapat Zoom instan HIMAIDE ITS atau ajukan Zoom terjadwal untuk kegiatan resmi.',
}

export default function ZoomPage() {
  return <ZoomApp />
}
