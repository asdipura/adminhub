import { NextResponse } from 'next/server'
import { GAS, GasError, callGas, getFungsio, jabatanLabel, normalizeWA } from '@/lib/gas'
import type { LacakResult, SuratKeluarRequest } from '@/types/surat'

export const dynamic = 'force-dynamic'
// Submit di GAS (buat folder, copy template, kirim email) ±20 dtk, dan latensi GAS
// sendiri bisa melonjak sampai puluhan detik — beri ruang cukup supaya tidak terpotong
export const maxDuration = 120

type GasSubmitResult = { success: boolean; kodeTiket?: string; message?: string }
type GasLacakResult = { success: boolean; results?: Record<string, unknown>[]; message?: string }

const str = (v: unknown, max = 2000) => String(v ?? '').trim().slice(0, max)

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail('Format request tidak valid')
  }

  try {
    if (body.action === 'submit') return await submit(body.data as SuratKeluarRequest, body.website)
    if (body.action === 'lacak') return await lacak(str(body.query, 100))
    return fail('Action tidak dikenal')
  } catch (err) {
    console.error('[api/surat-keluar]', err)
    const msg = err instanceof GasError ? err.message : 'Server sedang bermasalah, coba lagi sebentar lagi.'
    return fail(msg, 502)
  }
}

// ── SUBMIT ───────────────────────────────────────────────────────────

async function submit(d: SuratKeluarRequest | undefined, honeypot: unknown) {
  if (!d || typeof d !== 'object') return fail('Data request kosong')
  // Honeypot: field tersembunyi yang hanya diisi bot
  if (honeypot) return NextResponse.json({ success: true, kodeTiket: 'SR-OK' })

  // 1. Resolve identitas pemohon di server
  let nama: string, noWA: string, nrp: string, jabatan: string
  if (d.pemohon?.tipe === 'fungsio') {
    const f = await getFungsio(str(d.pemohon.id, 40))
    if (!f) return fail('Data fungsio tidak ditemukan. Pilih ulang nama kamu.')
    nama = f.nama
    noWA = normalizeWA(f.wa)
    nrp = f.nrp
    jabatan = jabatanLabel(f)
  } else if (d.pemohon?.tipe === 'warga') {
    nama = str(d.pemohon.nama, 120)
    noWA = normalizeWA(d.pemohon.noWA)
    nrp = str(d.pemohon.nrp, 20).replace(/\D/g, '')
    jabatan = 'Warga IDE'
  } else {
    return fail('Pilih tipe pemohon (Fungsio / Warga)')
  }

  if (!nama) return fail('Nama pemohon kosong')
  if (!/^62\d{8,13}$/.test(noWA)) return fail('Nomor WhatsApp pemohon tidak valid')
  if (d.pemohon.tipe === 'warga' && !/^\d{10,14}$/.test(nrp)) return fail('NRP harus 10–14 digit angka')

  // 2. Validasi isi surat
  const perihal = str(d.perihal, 200)
  const tanggal = str(d.tanggalDibutuhkan, 10)
  const konteks = str(d.konteks, 5000)
  if (!perihal) return fail('Perihal surat wajib diisi')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return fail('Tanggal dibutuhkan tidak valid')
  if (!konteks) return fail('Keperluan / konteks wajib diisi')

  let tujuan: SuratKeluarRequest['tujuan']
  if (d.tujuan?.type === 'link') {
    const url = str(d.tujuan.url, 500)
    if (!/^https?:\/\//i.test(url)) return fail('Link spreadsheet tujuan tidak valid')
    tujuan = { type: 'link', url }
  } else if (d.tujuan?.type === 'tabel') {
    const headers = (d.tujuan.data?.headers ?? []).slice(0, 12).map((h) => str(h, 60))
    const rows = (d.tujuan.data?.rows ?? [])
      .slice(0, 300)
      .map((r) => headers.map((_, i) => str(r?.[i], 300)))
      .filter((r) => r.some(Boolean))
    if (!rows.some((r) => r[0])) return fail('Isi minimal satu tujuan surat')
    tujuan = { type: 'tabel', data: { headers, rows } }
  } else {
    return fail('Tujuan surat wajib diisi')
  }

  const penandatangan = (d.penandatangan ?? [])
    .slice(0, 10)
    .map((p) => ({ jabatan: str(p?.jabatan, 120), nama: str(p?.nama, 120), nrp: str(p?.nrp, 30) }))
    .filter((p) => p.jabatan || p.nama || p.nrp)
  const lampiran = (d.lampiran ?? []).slice(0, 20).map((l) => str(l, 500)).filter(Boolean)

  // 3. Snapshot tiket milik pemohon (dicari via nomor WA) — untuk pemulihan di langkah 4
  const before = await ticketsOf(noWA)

  // 4. Kirim ke GAS Surat Keluar (format sama seperti form GAS lama + nrp)
  let res: GasSubmitResult
  try {
    res = await callGas<GasSubmitResult>(GAS.suratKeluar, {
      action: 'submit',
      nama, noWA, nrp, jabatan,
      perihal,
      tanggalDibutuhkan: tanggal,
      tujuan, konteks, penandatangan, lampiran,
    })
  } catch (err) {
    if (!(err instanceof GasError)) throw err

    // Balasan tidak terbaca — script mungkin sudah jalan. Cari tiket baru dengan perihal ini.
    const after = before ? await ticketsOf(noWA) : null
    const known = new Set(before?.map((t) => t.kodeTiket))
    const fresh = after?.filter((t) => !known.has(t.kodeTiket) && t.perihal === perihal)
    if (fresh?.length === 1) {
      console.warn('[api/surat-keluar] balasan GAS tidak terbaca, tiket dipulihkan:', fresh[0].kodeTiket)
      return NextResponse.json({ success: true, kodeTiket: fresh[0].kodeTiket })
    }
    // Snapshot lengkap & tidak ada tiket baru → memang belum tersimpan, aman kirim ulang
    if (after && fresh?.length === 0 && !err.processed) {
      return fail('Request belum terkirim karena server sedang sibuk. Coba kirim lagi.', 502)
    }
    // Request mungkin sudah tersimpan — jangan dorong user kirim ulang (tiket ganda)
    return NextResponse.json(
      { success: false, uncertain: true, message: 'Request kemungkinan sudah masuk, tapi konfirmasinya tidak terbaca. Cek dulu di tab Lacak Status pakai nama kamu sebelum mengirim ulang.' },
      { status: 502 },
    )
  }

  if (!res.success) {
    console.error('[api/surat-keluar] GAS submit gagal:', res.message)
    return fail('Request gagal disimpan. Coba lagi, atau hubungi sekretaris.', 502)
  }
  return NextResponse.json({ success: true, kodeTiket: res.kodeTiket })
}

type TicketRef = { kodeTiket: string; perihal: string }

/** Semua tiket atas nomor WA ini. null kalau gagal dibaca (pemulihan dilewati). */
async function ticketsOf(noWA: string): Promise<TicketRef[] | null> {
  try {
    const res = await callGas<GasLacakResult>(GAS.suratKeluar, { action: 'lacak', query: noWA }, { idempotent: true })
    if (!res.success) return null
    return (res.results ?? []).map((r) => ({ kodeTiket: str(r.kodeTiket), perihal: str(r.perihal, 200) }))
  } catch {
    return null
  }
}

// ── LACAK ────────────────────────────────────────────────────────────

async function lacak(query: string) {
  if (query.length < 2) return fail('Masukkan minimal 2 karakter')

  const res = await callGas<GasLacakResult>(GAS.suratKeluar, { action: 'lacak', query }, { idempotent: true })
  if (!res.success) return fail(res.message || 'Gagal mencari request', 502)

  // Buang nomor WA & field internal sebelum dikirim ke browser
  const results: LacakResult[] = (res.results ?? []).map((r) => ({
    kodeTiket: str(r.kodeTiket),
    nama: str(r.nama),
    jabatan: str(r.jabatan),
    perihal: str(r.perihal),
    tanggalDibutuhkan: str(r.tanggalDibutuhkan),
    status: str(r.status) || 'Diproses',
    tujuanJSON: str(r.tujuanJSON, 50000),
    penandatanganJSON: str(r.penandatanganJSON, 10000),
    lampiranJSON: str(r.lampiranJSON, 10000),
    konteks: str(r.konteks, 5000),
    linkFolder: str(r.linkFolder),
    nomorSurat: str(r.nomorSurat, 20000),
    linkPDF: str(r.linkPDF, 50000),
  }))

  return NextResponse.json({ success: true, results })
}
