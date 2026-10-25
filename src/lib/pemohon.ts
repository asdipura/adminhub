// Server-only: ubah pilihan pemohon dari browser jadi identitas lengkap.
// Fungsio diambil dari Kontrak Kerja (nama, NRP & WA asli tidak pernah dari browser).

import { getFungsio, jabatanLabel, normalizeWA } from '@/lib/gas'
import type { Pemohon } from '@/types/pemohon'

export type Identitas = { nama: string; noWA: string; nrp: string; jabatan: string }

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

/** Identitas pemohon, atau pesan error untuk ditampilkan ke user. */
export async function resolvePemohon(p: Pemohon | undefined): Promise<Identitas | string> {
  let id: Identitas
  if (p?.tipe === 'fungsio') {
    const f = await getFungsio(str(p.id, 40))
    if (!f) return 'Data fungsio tidak ditemukan. Pilih ulang nama kamu.'
    id = { nama: f.nama, noWA: normalizeWA(f.wa), nrp: f.nrp, jabatan: jabatanLabel(f) }
  } else if (p?.tipe === 'warga') {
    id = {
      nama: str(p.nama, 120),
      noWA: normalizeWA(p.noWA),
      nrp: str(p.nrp, 20).replace(/\D/g, ''),
      jabatan: 'Warga IDE',
    }
    if (!/^\d{10,14}$/.test(id.nrp)) return 'NRP harus 10–14 digit angka'
  } else {
    return 'Pilih tipe pemohon (Fungsio / Warga)'
  }

  if (!id.nama) return 'Nama pemohon kosong'
  if (!/^62\d{8,13}$/.test(id.noWA)) return 'Nomor WhatsApp pemohon tidak valid'
  return id
}
