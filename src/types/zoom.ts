import type { Pemohon } from './pemohon'

export type ZoomConfig = {
  /** Lama ruang rapat instan aktif (menit) */
  roomDuration: number
  sekre1Wa: string
  sekre2Wa: string
  calendarId: string
  notulensiUrl: string
}

export type Room = {
  id: string
  name: string
  status: 'Tersedia' | 'Dipakai'
  occupant: string
  startTime: string | null
  endTime: string | null
  zoomLink: string
  invitation: string
}

/** Dikirim browser → /api/zoom (action submit). */
export type ZoomRequest = {
  pemohon: Pemohon
  topik: string
  /** yyyy-mm-dd */
  tanggal: string
  /** HH:mm (WIB) */
  jam: string
  durasi: number
  emailHost: string
}

export type ZoomStatus = {
  code: string
  namaPIC: string
  nrp: string
  topik: string
  tanggal: string
  jam: string
  durasi: string
  emailHost: string
  status: string
  zoomLink: string
  hostEmail: string
  cohostEmails: string
  gcalUrl: string
}

export type ZoomSearchItem = Pick<ZoomStatus, 'code' | 'namaPIC' | 'topik' | 'tanggal' | 'jam' | 'status'>
