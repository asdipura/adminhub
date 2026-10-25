// Sistem Zoom (/zoom). Ruang rapat, link, dan kontak sekre diatur di sheet CONFIG GAS Zoom.

export const DURASI_ZOOM = [30, 60, 90, 120, 150, 180, 240]

export const KODE_ZOOM = /^IDE-[A-Z0-9]{5}$/

export const SYARAT_ZOOM = [
  'Cek ketersediaan jadwal di kalender sebelum mengajukan.',
  'Pemohon adalah mahasiswa aktif Desain Produk ITS.',
  'Zoom hanya untuk kepentingan HIMA IDE ITS & Desain Produk ITS.',
  'Ajukan paling lambat 3 hari sebelum kegiatan.',
  'Request tidak diproses sebelum pemohon menghubungi narahubung (sekretaris).',
  'Gunakan dengan bertanggung jawab dan tepat waktu saat pengalihan host. Pelanggaran: masuk daftar hitam peminjaman Zoom.',
  'Prioritas: internal HIMA IDE ITS, lalu mahasiswa Desain Produk ITS.',
  'Tersedia 1 akun berkapasitas 300 partisipan dengan co-host.',
]

export const PANDUAN_ZOOM = 'https://intip.in/petunjukpenggunaanzoom'
