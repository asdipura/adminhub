import type { Pemohon } from './pemohon'

export type PesertaGroup = { role: string; namaList: string[] }

/** Dikirim browser → /api/sertif (action submit). */
export type SertifRequest = {
  pemohon: Pemohon
  /** Jabatan di kepanitiaan, mis. "Ketua Panitia" */
  jabatan: string
  namaKegiatan: string
  /** yyyy-mm-dd */
  tglSelesai: string
  jumlah: number
  keterangan: string
  peserta: PesertaGroup[]
  linkMaster: string
}

export type SertifConfig = {
  namaSekre1: string
  waSekre1: string
  namaSekre2: string
  waSekre2: string
  tutorialUrl: string
}

export type SertifDetail = { id: string; namaPeserta: string; role: string; nomor: string }

export type SertifInfo = {
  kode: string
  timestamp: string
  nama: string
  nrp: string
  jabatan: string
  namaKegiatan: string
  tglSelesai: string
  jumlah: string
  keterangan: string
  linkMaster: string
  statusCIMD: string
  noteCIMD: string
  status: string
}

export type SertifStatus = {
  request: SertifInfo
  details: SertifDetail[]
  config: SertifConfig
}

/** Request desain ke CIMD — data requestor & nomor diambil server dari kode. */
export type CimdRequest = {
  kode: string
  dept: string
  deadline: string
  tglMulai: string
  tglSelesai: string
  kepalaDepart: string
  ketuaHimpunan: string
  ketuaPelaksana: string
}
