// Pengisian Surat Komitmen Iuran (Studi Ekskursi × Internalisasi).
// Card di beranda dan halaman /komitmen hanya aktif selama jendela ini;
// setelah lewat, card hilang sendiri dan API menolak submit.

export const KOMITMEN = {
  kegiatan: 'Studi Ekskursi × Internalisasi HIMA IDE 2026',
  /** Waktu dibuka (WIB) */
  mulai: '2026-10-06T00:00:00+07:00',
  durasiHari: 14,
}

const DAY = 86_400_000

export function komitmenWindow(now = new Date()) {
  const start = new Date(KOMITMEN.mulai)
  const end = new Date(start.getTime() + KOMITMEN.durasiHari * DAY)
  const open = now >= start && now < end
  return {
    open,
    end,
    /** Hari kalender tersisa, termasuk hari ini (1 = hari terakhir) */
    sisaHari: open ? Math.ceil((end.getTime() - now.getTime()) / DAY) : 0,
    /** Hari terakhir pengisian, mis. "19 Oktober 2026" */
    hariTerakhir: new Date(end.getTime() - 1).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
    }),
  }
}
