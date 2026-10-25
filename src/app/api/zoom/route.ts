import { NextResponse } from 'next/server'
import { GAS, GasError, callGas } from '@/lib/gas'
import { resolvePemohon } from '@/lib/pemohon'
import { DURASI_ZOOM, KODE_ZOOM } from '@/config/zoom'
import type { Room, ZoomConfig, ZoomRequest, ZoomSearchItem, ZoomStatus } from '@/types/zoom'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

type GasRes<T = object> = ({ success: true } & T) | { success: false; message?: string }

const str = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max)

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

function cleanRooms(rooms: unknown): Room[] {
  return (Array.isArray(rooms) ? rooms : []).map((r: Record<string, unknown>) => ({
    id: str(r.id, 40),
    name: str(r.name, 80),
    status: r.status === 'Dipakai' ? 'Dipakai' : 'Tersedia',
    occupant: str(r.occupant, 80),
    startTime: r.startTime ? str(r.startTime, 40) : null,
    endTime: r.endTime ? str(r.endTime, 40) : null,
    zoomLink: str(r.zoomLink, 500),
    invitation: str(r.invitation, 3000),
  }))
}

// ── GET: status ruang rapat (+ config saat pertama kali dibuka) ──────
// Ruang berubah tiap ada yang booking — tidak di-cache.

export async function GET(req: Request) {
  const onlyRooms = new URL(req.url).searchParams.get('only') === 'rooms'
  try {
    const res = await callGas<GasRes<{ config?: Record<string, unknown>; rooms: unknown }>>(
      GAS.zoom, { action: onlyRooms ? 'rooms' : 'init' }, { idempotent: true },
    )
    if (!res.success) throw new GasError(res.message || 'Gagal memuat status ruang')
    const c = res.config
    const config: ZoomConfig | undefined = c && {
      roomDuration: Number(c.roomDuration) || 60,
      sekre1Wa: str(c.sekre1Wa, 20),
      sekre2Wa: str(c.sekre2Wa, 20),
      calendarId: str(c.calendarId, 200),
      notulensiUrl: str(c.notulensiUrl, 300),
    }
    return NextResponse.json({ success: true, config, rooms: cleanRooms(res.rooms) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[api/zoom] init', err)
    return fail('Status ruang rapat belum bisa dimuat. Coba lagi sebentar.', 502)
  }
}

// ── POST: book | end | submit | status | search ──────────────────────

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail('Format request tidak valid')
  }

  try {
    switch (body.action) {
      case 'book': return await room('book', str(body.roomId, 40), str(body.nama, 60))
      case 'end': return await room('end', str(body.roomId, 40))
      case 'submit': return await submit(body.data as ZoomRequest, body.website)
      case 'status': return await status(str(body.code, 20).toUpperCase())
      case 'search': return await search(str(body.query, 100))
    }
    return fail('Action tidak dikenal')
  } catch (err) {
    console.error('[api/zoom]', err)
    const msg = err instanceof GasError ? err.message : 'Server sedang bermasalah, coba lagi sebentar lagi.'
    return fail(msg, 502)
  }
}

// ── RUANG RAPAT INSTAN ───────────────────────────────────────────────

async function room(action: 'book' | 'end', roomId: string, nama = '') {
  if (!roomId) return fail('Ruang tidak valid')
  if (action === 'book' && !nama) return fail('Isi nama kamu dulu')

  let res: GasRes<{ duration?: number }>
  try {
    res = await callGas(GAS.zoom, { action, roomId, nama })
  } catch (err) {
    if (!(err instanceof GasError)) throw err
    // Bisa saja sudah tersimpan — status ruang terbaru yang jadi patokan
    return fail('Balasan server tidak terbaca. Muat ulang status ruang untuk memastikan.', 502)
  }
  if (!res.success) return fail(res.message || 'Gagal memperbarui ruang', 409)
  return NextResponse.json({ success: true, duration: Number(res.duration) || undefined })
}

// ── REQUEST ZOOM TERJADWAL ───────────────────────────────────────────

/** Hari ini di WIB, yyyy-mm-dd */
const todayWIB = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10)

async function submit(d: ZoomRequest | undefined, honeypot: unknown) {
  if (!d || typeof d !== 'object') return fail('Data request kosong')
  if (honeypot) return NextResponse.json({ success: true, code: 'IDE-OK000' })

  const who = await resolvePemohon(d.pemohon)
  if (typeof who === 'string') return fail(who)

  const topik = str(d.topik, 200)
  const tanggal = str(d.tanggal, 10)
  const jam = str(d.jam, 5)
  const durasi = Number(d.durasi)
  const emailHost = str(d.emailHost, 120)
  if (!topik) return fail('Topik meeting wajib diisi')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || tanggal < todayWIB()) return fail('Tanggal meeting tidak valid')
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(jam)) return fail('Jam mulai tidak valid')
  if (!DURASI_ZOOM.includes(durasi)) return fail('Pilih durasi meeting')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailHost)) return fail('Email host tidak valid')

  const before = await codesOf(who.nama)

  let res: GasRes<{ code: string }>
  try {
    res = await callGas(GAS.zoom, {
      action: 'submit',
      data: { namaPIC: who.nama, nrp: who.nrp, noWa: who.noWA, topik, tanggal, jam, durasi: String(durasi), emailHost },
    })
  } catch (err) {
    if (!(err instanceof GasError)) throw err
    const after = before ? await codesOf(who.nama) : null
    const known = new Set(before?.map((t) => t.code))
    const fresh = after?.filter((t) => !known.has(t.code) && t.topik === topik)
    if (fresh?.length === 1) {
      console.warn('[api/zoom] balasan GAS tidak terbaca, kode dipulihkan:', fresh[0].code)
      return NextResponse.json({ success: true, code: fresh[0].code })
    }
    if (after && fresh?.length === 0 && !err.processed) {
      return fail('Request belum terkirim karena server sedang sibuk. Coba kirim lagi.', 502)
    }
    return NextResponse.json(
      { success: false, uncertain: true, message: 'Request kemungkinan sudah masuk, tapi konfirmasinya tidak terbaca. Cek dulu di tab Cek Status pakai nama kamu sebelum mengirim ulang.' },
      { status: 502 },
    )
  }

  if (!res.success) {
    console.error('[api/zoom] GAS submit gagal:', res.message)
    return fail('Request gagal disimpan. Coba lagi, atau hubungi sekretaris.', 502)
  }
  return NextResponse.json({ success: true, code: res.code })
}

/** Request atas nama ini. null kalau gagal dibaca (pemulihan dilewati). */
async function codesOf(nama: string): Promise<ZoomSearchItem[] | null> {
  try {
    const res = await callGas<GasRes<{ results: Record<string, unknown>[] }>>(GAS.zoom, { action: 'search', query: nama }, { idempotent: true })
    return res.success ? res.results.map(cleanItem) : null
  } catch {
    return null
  }
}

// ── STATUS & CARI ────────────────────────────────────────────────────

function cleanItem(r: Record<string, unknown>): ZoomSearchItem {
  return {
    code: str(r.code, 20),
    namaPIC: str(r.namaPIC, 120),
    topik: str(r.topik),
    tanggal: str(r.tanggal, 40),
    jam: str(r.jam, 10),
    status: str(r.status, 40),
  }
}

async function status(code: string) {
  if (!KODE_ZOOM.test(code)) return fail('Format kode salah. Contoh: IDE-AB12C')
  const r = await callGas<Record<string, unknown>>(GAS.zoom, { action: 'status', code }, { idempotent: true })
  if (r.success === false) return fail(str(r.message) || 'Gagal memuat status', 502)
  if (!r.found) return fail('Request dengan kode itu tidak ditemukan', 404)

  // Nomor WA pemohon tidak dikirim ke browser
  const data: ZoomStatus = {
    ...cleanItem(r),
    nrp: str(r.nrp, 20),
    durasi: str(r.durasi, 10),
    emailHost: str(r.emailHost, 120),
    zoomLink: str(r.zoomLink, 500),
    hostEmail: str(r.hostEmail, 120),
    cohostEmails: str(r.cohostEmails, 500),
    gcalUrl: str(r.gcalUrl, 2000),
  }
  return NextResponse.json({ success: true, data })
}

async function search(query: string) {
  if (query.length < 2) return fail('Masukkan minimal 2 karakter')
  const res = await callGas<GasRes<{ results: Record<string, unknown>[] }>>(GAS.zoom, { action: 'search', query }, { idempotent: true })
  if (!res.success) return fail(res.message || 'Gagal mencari request', 502)
  return NextResponse.json({ success: true, results: res.results.map(cleanItem) })
}
