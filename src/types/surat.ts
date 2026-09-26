import type { Pemohon } from './pemohon'

export type TujuanTabel = { headers: string[]; rows: string[][] }

export type Tujuan =
  | { type: 'tabel'; data: TujuanTabel }
  | { type: 'link'; url: string }

export type Penandatangan = { jabatan: string; nama: string; nrp: string }

export type SuratKeluarRequest = {
  pemohon: Pemohon
  perihal: string
  tanggalDibutuhkan: string // yyyy-mm-dd
  tujuan: Tujuan
  konteks: string
  penandatangan: Penandatangan[]
  lampiran: string[]
}

/** Hasil lacak yang sudah disaring server (tanpa nomor WA). */
export type LacakResult = {
  kodeTiket: string
  nama: string
  jabatan: string
  perihal: string
  tanggalDibutuhkan: string
  status: string
  tujuanJSON: string
  penandatanganJSON: string
  lampiranJSON: string
  konteks: string
  linkFolder: string
  nomorSurat: string
  linkPDF: string
}
