/** Data fungsio lengkap — hanya ada di server. */
export type Fungsio = {
  id: string
  nama: string
  nrp: string
  jabatan: string
  dept: string
  wa: string
}

/** Data fungsio yang aman dikirim ke browser (WA dimasking). */
export type FungsioPublic = {
  id: string
  nama: string
  jabatan: string
  dept: string
  waMasked: string
}

export type Pemohon =
  | { tipe: 'fungsio'; id: string }
  | { tipe: 'warga'; nama: string; noWA: string; nrp: string }
