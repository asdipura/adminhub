import { NextResponse } from 'next/server'
import { GAS, GasError, callGas } from '@/lib/gas'
import { resolvePemohon } from '@/lib/pemohon'
import { CIMD_DEPTS, KODE_SERT, deptValue } from '@/config/sertif'
import type { CimdRequest, SertifConfig, SertifDetail, SertifInfo, SertifRequest } from '@/types/sertif'

export const dynamic = 'force-dynamic'
// Submit (tulis sheet + email) dan request CIMD (buat Google Doc) bisa belasan detik + cold start
export const maxDuration = 120

type GasRes<T = object> = ({ ok: true } & T) | { ok: false; error?: string }

const str = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max)
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

// ── GET: kontak sekretaris + link tutorial ───────────────────────────

export async function GET() {
  try {
    const res = await callGas<GasRes<SertifConfig>>(GAS.sertif, { action: 'config' }, { idempotent: true })
    if (!res.ok) throw new GasError(res.error || 'Gagal memuat konfigurasi')
    const config: SertifConfig = {
      namaSekre1: str(res.namaSekre1), waSekre1: str(res.waSekre1, 20),
      namaSekre2: str(res.namaSekre2), waSekre2: str(res.waSekre2, 20),
      tutorialUrl: str(res.tutorialUrl, 300),
    }
    return NextResponse.json(
      { success: true, config },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.error('[api/sertif] config', err)
    return fail('Konfigurasi belum bisa dimuat', 502)
  }
}

// ── POST: submit | status | design ───────────────────────────────────

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail('Format request tidak valid')
  }

  try {
    if (body.action === 'submit') return await submit(body.data as SertifRequest, body.website)
    if (body.action === 'status') return await status(str(body.kode, 30).toUpperCase())
    if (body.action === 'design') return await design(body.data as CimdRequest)
    return fail('Action tidak dikenal')
  } catch (err) {
    console.error('[api/sertif]', err)
    const msg = err instanceof GasError ? err.message : 'Server sedang bermasalah, coba lagi sebentar lagi.'
    return fail(msg, 502)
  }
}

// ── SUBMIT ───────────────────────────────────────────────────────────

async function submit(d: SertifRequest | undefined, honeypot: unknown) {
  if (!d || typeof d !== 'object') return fail('Data request kosong')
  if (honeypot) return NextResponse.json({ success: true, kode: 'SERT-OK' })

  const who = await resolvePemohon(d.pemohon)
  if (typeof who === 'string') return fail(who)

  const jabatan = str(d.jabatan, 120)
  const namaKegiatan = str(d.namaKegiatan, 200)
  const tglSelesai = str(d.tglSelesai, 10)
  const jumlah = Math.floor(Number(d.jumlah))
  const linkMaster = str(d.linkMaster, 500)
  if (!jabatan) return fail('Jabatan di kepanitiaan wajib diisi')
  if (!namaKegiatan) return fail('Nama kegiatan wajib diisi')
  if (!isDate(tglSelesai)) return fail('Tanggal selesai acara tidak valid')
  if (!(jumlah >= 1 && jumlah <= 1000)) return fail('Jumlah nomor harus 1–1000')
  if (linkMaster && !/^https?:\/\//i.test(linkMaster)) return fail('Link master desain tidak valid')

  const peserta = (Array.isArray(d.peserta) ? d.peserta : [])
    .slice(0, 30)
    .map((g) => ({
      role: str(g?.role, 80),
      namaList: (Array.isArray(g?.namaList) ? g.namaList : []).slice(0, 1000).map((n) => str(n, 120)).filter(Boolean),
    }))
    .filter((g) => g.namaList.length)

  // Snapshot request milik WA ini — untuk pemulihan kalau balasan submit hilang
  const before = await kodesOf(who.noWA)

  let res: GasRes<{ kode: string }>
  try {
    res = await callGas(GAS.sertif, {
      action: 'submit',
      data: {
        nama: who.nama, nrp: who.nrp, wa: who.noWA, jabatan,
        namaKegiatan, tglSelesai, jumlah, jumlahFinal: jumlah,
        keterangan: str(d.keterangan, 500),
        peserta, linkMaster,
      },
    })
  } catch (err) {
    if (!(err instanceof GasError)) throw err
    const after = before ? await kodesOf(who.noWA) : null
    const known = new Set(before?.map((t) => t.kode))
    const fresh = after?.filter((t) => !known.has(t.kode) && t.namaKegiatan === namaKegiatan)
    if (fresh?.length === 1) {
      console.warn('[api/sertif] balasan GAS tidak terbaca, kode dipulihkan:', fresh[0].kode)
      return NextResponse.json({ success: true, kode: fresh[0].kode })
    }
    if (after && fresh?.length === 0 && !err.processed) {
      return fail('Request belum terkirim karena server sedang sibuk. Coba kirim lagi.', 502)
    }
    return NextResponse.json(
      { success: false, uncertain: true, message: 'Request kemungkinan sudah masuk, tapi kodenya tidak terbaca. Jangan kirim ulang dulu — tanyakan kode request ke sekretaris.' },
      { status: 502 },
    )
  }

  if (!res.ok) {
    console.error('[api/sertif] GAS submit gagal:', res.error)
    return fail('Request gagal disimpan. Coba lagi, atau hubungi sekretaris.', 502)
  }
  return NextResponse.json({ success: true, kode: res.kode })
}

type KodeRef = { kode: string; namaKegiatan: string }

/** Semua request atas nomor WA ini. null kalau gagal dibaca (pemulihan dilewati). */
async function kodesOf(wa: string): Promise<KodeRef[] | null> {
  try {
    const res = await callGas<GasRes<{ results: KodeRef[] }>>(GAS.sertif, { action: 'cari', wa }, { idempotent: true })
    return res.ok ? res.results.map((r) => ({ kode: str(r.kode, 30), namaKegiatan: str(r.namaKegiatan) })) : null
  } catch {
    return null
  }
}

// ── STATUS ───────────────────────────────────────────────────────────

type GasStatus = {
  request: Record<string, unknown>
  details: Record<string, unknown>[]
  config: Record<string, unknown>
  tutorialUrl: string
}

async function status(kode: string) {
  if (!KODE_SERT.test(kode)) return fail('Format kode salah. Contoh: SERT-20261012-001')

  const res = await callGas<GasRes<GasStatus>>(GAS.sertif, { action: 'status', kode }, { idempotent: true })
  if (!res.ok) return fail(res.error || 'Kode tidak ditemukan', 404)

  const r = res.request
  // Nomor WA pemohon tidak dikirim ke browser
  const request: SertifInfo = {
    kode: str(r.kode, 30),
    timestamp: str(r.timestamp, 40),
    nama: str(r.nama),
    nrp: str(r.nrp, 20),
    jabatan: str(r.jabatan),
    namaKegiatan: str(r.namaKegiatan),
    tglSelesai: str(r.tglSelesai, 40),
    jumlah: str(r.jumlah, 10),
    keterangan: str(r.keterangan, 500),
    linkMaster: str(r.linkMaster, 500),
    statusCIMD: str(r.statusCIMD, 60),
    noteCIMD: str(r.noteCIMD, 2000),
    status: str(r.status, 60),
  }
  const details: SertifDetail[] = (res.details ?? []).map((x) => ({
    id: str(x.id, 30),
    namaPeserta: str(x.namaPeserta, 120),
    role: str(x.role, 80),
    nomor: str(x.nomor, 120),
  }))
  const config: SertifConfig = {
    namaSekre1: str(res.config?.namaSekre1), waSekre1: str(res.config?.waSekre1, 20),
    namaSekre2: str(res.config?.namaSekre2), waSekre2: str(res.config?.waSekre2, 20),
    tutorialUrl: str(res.tutorialUrl, 300),
  }
  return NextResponse.json({ success: true, request, details, config })
}

// ── DESIGN (request desain ke CIMD) ──────────────────────────────────

async function design(d: CimdRequest | undefined) {
  if (!d || typeof d !== 'object') return fail('Data request kosong')
  const kode = str(d.kode, 30).toUpperCase()
  const dept = str(d.dept, 40)
  const deadline = str(d.deadline, 10)
  const tglMulai = str(d.tglMulai, 10)
  const tglSelesai = str(d.tglSelesai, 10)
  const ketuaPelaksana = str(d.ketuaPelaksana, 400)

  if (!KODE_SERT.test(kode)) return fail('Kode request tidak valid')
  if (!CIMD_DEPTS.some((x) => deptValue(x) === dept)) return fail('Pilih departemen / biro')
  if (!isDate(deadline)) return fail('Isi deadline sertifikat dibutuhkan')
  if ((tglMulai && !isDate(tglMulai)) || (tglSelesai && !isDate(tglSelesai))) return fail('Tanggal pelaksanaan tidak valid')
  if (!ketuaPelaksana || /\[(NAMA|NRP)/i.test(ketuaPelaksana)) return fail('Lengkapi nama & NRP ketua pelaksana')

  let res: GasRes<{ docUrl: string; waLink: string }>
  try {
    res = await callGas(GAS.sertif, {
      action: 'design',
      kode, dept, deadline, tglMulai, tglSelesai, ketuaPelaksana,
      kepalaDepart: str(d.kepalaDepart, 400),
      ketuaHimpunan: str(d.ketuaHimpunan, 400),
    })
  } catch (err) {
    if (!(err instanceof GasError)) throw err
    return NextResponse.json(
      { success: false, uncertain: err.processed, message: err.processed
        ? 'Request desain kemungkinan sudah masuk ke CIMD, tapi konfirmasinya tidak terbaca. Hubungi CIMD dulu sebelum mengirim ulang.'
        : 'Request belum terkirim karena server sedang sibuk. Coba kirim lagi.' },
      { status: 502 },
    )
  }
  if (!res.ok) return fail(res.error || 'Request desain gagal dikirim', 502)
  return NextResponse.json({ success: true, docUrl: str(res.docUrl, 500), waLink: str(res.waLink, 3000) })
}
