/** Anggota untuk dropdown — tanpa NRP. */
export type AnggotaPublic = {
  id: string
  nama: string
  /** "Jabatan - Divisi - Departemen" */
  label: string
  kategori: 'Fungsionaris' | 'Staff Magang'
}

/** Isi surat yang ditampilkan di preview (sama persis dengan yang masuk PDF). */
export type KomitmenInfo = {
  kegiatan: string
  nominal: string
  batas: string
  tempat: string
  tanggal: string
}

export type SuratFields = {
  nama: string
  nrp: string
  jabatan: string
  departemen: string
  unitTtd: string
}

/** Surat yang sudah pernah dibuat untuk anggota ini. */
export type Submission = { waktu: string; pdfUrl: string }
