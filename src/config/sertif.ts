// Sistem Request Sertifikat (/sertif). Data dinamis (kontak sekre, status) dari GAS Sertifikat.

export const CIMD_DEPTS = [
  { code: 'BPH', label: 'BPH' },
  { code: 'SRD', label: 'SRD', sub: 'PSDM' },
  { code: 'IAD', label: 'IAD', sub: 'DAGRI' },
  { code: 'STID', label: 'STID', sub: 'MINBA' },
  { code: 'SPW', label: 'SPW', sub: 'PROKESMA' },
  { code: 'ERD', label: 'ERD', sub: 'HUBLU' },
  { code: 'EBM', label: 'EBM', sub: 'KWU' },
  { code: 'CIMD', label: 'CIMD', sub: 'MEDFO' },
] as const

/** Nilai yang disimpan di sheet CIMD, mis. "SRD (PSDM)" */
export const deptValue = (d: (typeof CIMD_DEPTS)[number]) => ('sub' in d ? `${d.code} (${d.sub})` : d.code)

/** Isi awal area tanda tangan sertifikat — ganti tiap pergantian kabinet. */
export const STRUKTURAL_DEFAULT = {
  kepalaDepart: 'KEPALA DEPARTEMEN DESAIN PRODUK INDUSTRI ITS\nBambang Tristiyono S. T., M. SI\nNIP. 19700703199721001',
  ketuaHimpunan: 'KETUA HIMPUNAN MAHASISWA IDE 2026\nRifkiansyah Wijaya\nNRP. 5028231114',
}

/** Kontak cadangan kalau GAS belum membalas config */
export const SERTIF_FALLBACK = {
  namaSekre1: 'Sekretaris 1',
  waSekre1: '6281280126505',
  namaSekre2: 'Sekretaris 2',
  waSekre2: '',
  tutorialUrl: '',
}

export const KODE_SERT = /^SERT-\d{8}-\d{3,}$/
