'use client'

import NamePicker from './NamePicker'
import type { FungsioPublic } from '@/types/pemohon'

interface FungsioPickerProps {
  list: FungsioPublic[]
  loading: boolean
  error?: string
  value: string
  onChange: (f: FungsioPublic | null) => void
  invalid?: boolean
}

export function jabatanLabel(f: FungsioPublic) {
  return !f.dept || f.dept === 'BPH' || f.jabatan.includes(f.dept) ? f.jabatan : `${f.jabatan} · ${f.dept}`
}

const subLabel = (f: FungsioPublic) => `${jabatanLabel(f)} – ${f.waMasked}`
const searchText = (f: FungsioPublic) => `${f.jabatan} ${f.dept}`

export default function FungsioPicker(props: FungsioPickerProps) {
  return (
    <NamePicker
      {...props}
      inputId="fm-fungsio"
      sub={subLabel}
      searchText={searchText}
      empty={<>Nama tidak ditemukan. Belum isi Kontrak Kerja? Pilih <b>Warga</b>.</>}
    />
  )
}
