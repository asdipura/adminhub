// Server-only helpers: panggil doPost GAS dari API route.
// JANGAN di-import dari client component — berisi API key.

import type { Fungsio, FungsioPublic } from '@/types/pemohon'

type GasTarget = { url?: string; apiKey?: string; name: string }

export const GAS = {
  kontrak: {
    name: 'Kontrak Kerja',
    url: process.env.KONTRAK_GAS_URL,
    apiKey: process.env.KONTRAK_API_KEY,
  },
  suratKeluar: {
    name: 'Surat Keluar',
    url: process.env.SURAT_KELUAR_GAS_URL,
    apiKey: process.env.SURAT_KELUAR_API_KEY,
  },
  komitmen: {
    name: 'Komitmen Iuran',
    url: process.env.KOMITMEN_GAS_URL,
    apiKey: process.env.KOMITMEN_API_KEY,
  },
} satisfies Record<string, GasTarget>

export class GasError extends Error {
  /** true = request sudah sampai & diproses GAS, tapi balasannya tidak terbaca */
  constructor(message: string, readonly processed = false) {
    super(message)
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Host + path tanpa query (query echo berisi user_content_key). */
const where = (u: string | null) => {
  if (!u) return null
  try { const x = new URL(u); return x.host + x.pathname } catch { return u.slice(0, 80) }
}

/**
 * @param opts.idempotent true untuk action yang aman diulang (lacak, list, get):
 *   kalau balasan tidak terbaca, seluruh request (POST) diulang maks. 2x lagi.
 *   JANGAN untuk submit — mengulang POST = tiket ganda.
 */
export async function callGas<T = unknown>(
  target: GasTarget,
  body: Record<string, unknown>,
  opts: { idempotent?: boolean } = {},
): Promise<T> {
  if (!target.url || !target.apiKey) {
    throw new GasError(`Endpoint ${target.name} belum dikonfigurasi di server`)
  }

  const tries = opts.idempotent ? 3 : 1
  for (let i = 1; ; i++) {
    try {
      const out = await callGasOnce<T>(target, body)
      if (i > 1) console.warn(`[gas:${target.name}] berhasil di percobaan POST ke-${i}`)
      return out
    } catch (err) {
      if (!(err instanceof GasError) || i >= tries) throw err
      await sleep(800 * i)
    }
  }
}

// GAS menjalankan doPost lalu redirect (302) ke script.googleusercontent.com/macros/echo
// yang berisi hasilnya. Kadang URL echo tidak tersedia dan Google me-redirect balik ke
// /exec (= halaman doGet HTML) atau 404. Karena itu semua redirect diikuti MANUAL:
// echo di-GET ulang sebentar tanpa mengikuti redirect ke halaman lain, dan POST tidak
// pernah diulang di sini (mengulang POST = menjalankan script lagi).
async function callGasOnce<T>(target: GasTarget, body: Record<string, unknown>): Promise<T> {
  const post = await fetch(target.url!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, apiKey: target.apiKey }),
    cache: 'no-store',
    redirect: 'manual',
  })
  const location = post.headers.get('location')

  if (!(post.status >= 300 && post.status < 400 && location)) {
    const text = await post.text()
    if (isJson(text)) return JSON.parse(text) as T
    return fail(target, { step: 'post', status: post.status, text }, false)
  }

  const echoUrl = new URL(location, target.url)
  // doPost sudah dieksekusi hanya kalau diarahkan ke URL echo googleusercontent
  const processed = echoUrl.host.endsWith('googleusercontent.com')
  const trail: string[] = []

  for (const delay of [0, 700, 1500, 2500]) {
    if (delay) await sleep(delay)
    const res = await fetch(echoUrl, { cache: 'no-store', redirect: 'manual' })
    const text = await res.text()
    if (res.ok && isJson(text)) {
      if (trail.length) console.warn(`[gas:${target.name}] echo terbaca setelah ${trail.length} kali gagal`, trail)
      return JSON.parse(text) as T
    }
    trail.push(`${res.status}${res.headers.get('location') ? ' → ' + where(res.headers.get('location')) : ''}`)
    if (!processed) break // bukan URL echo: tidak ada gunanya diulang
  }

  return fail(target, { step: 'echo', postStatus: post.status, location: where(location), trail }, processed)
}

function isJson(text: string) {
  const t = text.trimStart()
  if (!t.startsWith('{') && !t.startsWith('[')) return false
  try { JSON.parse(t); return true } catch { return false }
}

function fail(target: GasTarget, info: Record<string, unknown> & { text?: string }, processed: boolean): never {
  const { text, ...rest } = info
  console.error(`[gas:${target.name}] balasan tidak terbaca`, {
    ...rest,
    ...(text !== undefined && { title: text.match(/<title>([^<]*)/i)?.[1] ?? '', head: text.slice(0, 120) }),
  })
  throw new GasError(`${target.name} tidak mengembalikan respons yang valid`, processed)
}

// ── Fungsio (sumber: sheet Respondents di Kontrak Kerja) ────────────

type GasResult<T> = { success: boolean; data?: T; message?: string }

export async function listFungsio(): Promise<FungsioPublic[]> {
  const res = await callGas<GasResult<FungsioPublic[]>>(GAS.kontrak, { action: 'listFungsio' }, { idempotent: true })
  if (!res.success) throw new GasError(res.message || 'Gagal memuat daftar fungsio')
  return res.data ?? []
}

/** Data lengkap (termasuk WA asli) — hanya untuk dipakai di server. */
export async function getFungsio(id: string): Promise<Fungsio | null> {
  const res = await callGas<GasResult<Fungsio>>(GAS.kontrak, { action: 'getFungsio', id }, { idempotent: true })
  return res.success && res.data ? res.data : null
}

export function jabatanLabel(f: Pick<Fungsio, 'jabatan' | 'dept'>): string {
  if (!f.dept || f.dept === 'BPH' || f.jabatan.includes(f.dept)) return f.jabatan
  return `${f.jabatan} · ${f.dept}`
}

export function normalizeWA(raw: string): string {
  let wa = String(raw || '').replace(/\D/g, '')
  if (wa.startsWith('0')) wa = '62' + wa.slice(1)
  else if (wa.startsWith('8')) wa = '62' + wa
  return wa
}

export function maskWA(wa: string): string {
  const d = String(wa || '').replace(/\D/g, '')
  return d.length < 4 ? '' : d.slice(0, 2) + '******' + d.slice(-2)
}
