import type { FallbackEvents } from '@/types/calendar'

// Fallback events used when GAS endpoint is not configured
// Keys are relative day offsets from today (as ISO date strings at runtime)
// This is populated at runtime in the WeekCalendar component
export const fallbackEventsRelative: Array<{
  dayOffset: number
  time: string
  title: string
  desc: string
}> = [
  { dayOffset: 0, time: '09.00', title: 'Rapat BPH Mingguan', desc: 'Sekretariat HIMAIDE' },
  { dayOffset: 0, time: '13.00', title: 'Batas Pengajuan Surat', desc: 'Deadline surat keluar proker bulan ini' },
  { dayOffset: 1, time: '10.00', title: 'Asistensi Proposal', desc: 'Proker Divisi Sosial ke BPH' },
  { dayOffset: 3, time: '08.00', title: 'Pengumpulan LPJ', desc: 'Batas serahkan ke Departemen' },
  { dayOffset: 3, time: '15.00', title: 'Booking Zoom', desc: 'Workshop Desain Internal' },
  { dayOffset: -1, time: '11.00', title: 'Rapat Koordinasi', desc: 'Persiapan proker semester ganjil' },
]

export const calendarConfig = {
  enabled: true,
  source: 'google-calendar',
  timezone: 'Asia/Jakarta',
  defaultView: 'week' as const,
  maxEvents: 20,
}

// Day and month labels in Indonesian
export const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] as const
