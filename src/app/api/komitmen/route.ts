import { NextResponse } from 'next/server'
import { GAS, GasError, callGas } from '@/lib/gas'
import { komitmenWindow } from '@/config/komitmen'
import type { AnggotaPublic, KomitmenInfo, Submission, SuratFields } from '@/types/komitmen'

export const dynamic = 'force-dynamic'
// Submit di GAS (copy template, sisip TTD, konversi PDF) ±15 dtk + cold start
export const maxDuration = 120

type GasInit = { success: boolean; data?: KomitmenInfo & { anggota: AnggotaPublic[] }; message?: string }
type GasVerify = { ok: boolean; data?: SuratFields; sudah?: Submission | null; message?: string }
type GasSubmit = { success: boolean; pdfUrl?: string; message?: string }

const MIME_TTD = ['image/png', 'image/jpeg']
const MAX_TTD_CHARS = 3_000_000 // ±2,2 MB gambar — browser sudah mengecilkan sebelum kirim

const str = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max)

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, ok: false, message }, { status })
}

const CLOSED = 'Pengisian surat komitmen sudah ditutup.'

// ── GET: daftar anggota + info surat ─────────────────────────────────

export async function GET() {
  if (!komitmenWindow().open) return fail(CLOSED, 403)
  try {
    const res = await callGas<GasInit>(GAS.komitmen, { action: 'init' }, { idempotent: true })
    if (!res.success || !res.data) throw new GasError(res.message || 'Gagal memuat data anggota')
    const { anggota, ...info } = res.data
    return NextResponse.json(
      { success: true, anggota, info },
      // Daftar anggota jarang berubah — layani dari CDN, perbarui di belakang layar
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.error('[api/komitmen] init', err)
    return fail('Daftar nama belum bisa dimuat. Muat ulang halaman sebentar lagi.', 502)
  }
}

// ── POST: verify | submit ────────────────────────────────────────────

export async function POST(req: Request) {
  if (!komitmenWindow().open) return fail(CLOSED, 403)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail('Format request tidak valid')
  }

  const who = { id: str(body.id, 20), nama: str(body.nama), nrp: str(body.nrp, 20).replace(/\D/g, '') }
  if (!who.id || !who.nama) return fail('Pilih nama kamu dari daftar')
  if (!who.nrp) return fail('NRP wajib diisi')

  try {
    if (body.action === 'verify') return await verify(who)
    if (body.action === 'submit') return await submit(who, body)
    return fail('Action tidak dikenal')
  } catch (err) {
    console.error('[api/komitmen]', err)
    const msg = err instanceof GasError ? err.message : 'Server sedang bermasalah, coba lagi sebentar lagi.'
    return fail(msg, 502)
  }
}

type Who = { id: string; nama: string; nrp: string }

async function verify(who: Who) {
  const res = await callGas<GasVerify>(GAS.komitmen, { action: 'verify', ...who }, { idempotent: true })
  if (!res.ok) return fail(res.message || 'NRP tidak cocok dengan nama yang dipilih.', 400)
  return NextResponse.json({ ok: true, data: res.data, sudah: res.sudah ?? null })
}

async function submit(who: Who, body: Record<string, unknown>) {
  if (body.website) return NextResponse.json({ success: true, pdfUrl: '' }) // honeypot

  const sig = (body.signature ?? {}) as Record<string, unknown>
  const base64 = String(sig.base64 ?? '')
  const mime = str(sig.mime, 30)
  if (!base64) return fail('Tanda tangan belum diunggah')
  if (!MIME_TTD.includes(mime)) return fail('Tanda tangan harus berupa gambar PNG atau JPG')
  if (base64.length > MAX_TTD_CHARS) return fail('Ukuran tanda tangan terlalu besar. Pakai gambar yang lebih kecil.')

  const startedAt = Date.now()
  let res: GasSubmit
  try {
    res = await callGas<GasSubmit>(GAS.komitmen, {
      action: 'submit',
      ...who,
      signatureBase64: base64,
      signatureMimeType: mime,
      signatureW: Number(sig.w) || 0,
      signatureH: Number(sig.h) || 0,
    })
  } catch (err) {
    if (!(err instanceof GasError)) throw err
    // Balasan tidak terbaca — PDF mungkin sudah dibuat. Cek surat terbaru milik anggota ini.
    const found = await latestSubmission(who)
    if (found && new Date(found.waktu).getTime() >= startedAt - 60_000) {
      console.warn('[api/komitmen] balasan GAS tidak terbaca, surat dipulihkan:', who.nama)
      return NextResponse.json({ success: true, pdfUrl: found.pdfUrl })
    }
    if (!err.processed && found !== undefined) {
      return fail('Surat belum terkirim karena server sedang sibuk. Coba kirim lagi.', 502)
    }
    return NextResponse.json(
      { success: false, uncertain: true, message: 'Surat kemungkinan sudah dibuat, tapi konfirmasinya tidak terbaca. Muat ulang halaman lalu isi nama & NRP lagi — kalau suratmu sudah ada, link PDF-nya akan muncul.' },
      { status: 502 },
    )
  }

  if (!res.success) {
    console.error('[api/komitmen] GAS submit gagal:', res.message)
    return fail(res.message ? `Surat belum berhasil dibuat: ${res.message}` : 'Surat belum berhasil dibuat. Coba lagi.', 502)
  }
  return NextResponse.json({ success: true, pdfUrl: res.pdfUrl })
}

/** Surat terakhir anggota ini; null = belum ada, undefined = gagal dicek. */
async function latestSubmission(who: Who): Promise<Submission | null | undefined> {
  try {
    const res = await callGas<GasVerify>(GAS.komitmen, { action: 'verify', ...who }, { idempotent: true })
    return res.ok ? res.sudah ?? null : undefined
  } catch {
    return undefined
  }
}
