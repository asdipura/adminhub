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
} satisfies Record<string, GasTarget>

export class GasError extends Error {
  /** true = request sudah sampai & diproses GAS, tapi balasannya tidak terbaca */
  constructor(message: string, readonly processed = false) {
    super(message)
  }
}

export async function callGas<T = unknown>(target: GasTarget, body: Record<string, unknown>): Promise<T> {
  if (!target.url || !target.apiKey) {
    throw new GasError(`Endpoint ${target.name} belum dikonfigurasi di server`)
  }

  // GAS menjalankan script lalu redirect (302) ke script.googleusercontent.com/macros/echo
  // yang berisi hasilnya. Pada eksekusi lambat (cold start, submit ±20 dtk) URL echo
  // kadang membalas 404 HTML. Redirect diikuti manual dengan GET supaya echo bisa
  // di-retry tanpa mengulang POST (yang akan menjalankan script / submit lagi).
  const post = await fetch(target.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, apiKey: target.apiKey }),
    cache: 'no-store',
    redirect: 'manual',
  })
  const location = post.headers.get('location')
  const processed = post.status >= 300 && post.status < 400 && !!location // script sudah dieksekusi

  if (!processed) return parseGas<T>(target, post, await post.text(), false)

  const echoUrl = new URL(location!, target.url)
  const delays = [0, 1500, 3000, 5000]
  let last: { res: Response; text: string } | undefined
  for (const [attempt, delay] of delays.entries()) {
    if (delay) await new Promise((r) => setTimeout(r, delay))
    const res = await fetch(echoUrl, { cache: 'no-store' })
    const text = await res.text()
    if (isJson(text)) {
      if (attempt > 0) console.warn(`[gas:${target.name}] echo baru terbaca di percobaan ke-${attempt + 1}`)
      return JSON.parse(text) as T
    }
    last = { res, text }
  }
  return parseGas<T>(target, last!.res, last!.text, true)
}

function isJson(text: string) {
  const t = text.trimStart()
  if (!t.startsWith('{') && !t.startsWith('[')) return false
  try { JSON.parse(t); return true } catch { return false }
}

function parseGas<T>(target: GasTarget, res: Response, text: string, processed: boolean): T {
  if (isJson(text)) return JSON.parse(text) as T
  console.error(`[gas:${target.name}] non-JSON response`, {
    status: res.status,
    host: res.url ? new URL(res.url).host : '',
    title: text.match(/<title>([^<]*)/i)?.[1] ?? '',
    head: text.slice(0, 160),
  })
  throw new GasError(`${target.name} tidak mengembalikan respons yang valid`, processed)
}

// ── Fungsio (sumber: sheet Respondents di Kontrak Kerja) ────────────

type GasResult<T> = { success: boolean; data?: T; message?: string }

export async function listFungsio(): Promise<FungsioPublic[]> {
  const res = await callGas<GasResult<FungsioPublic[]>>(GAS.kontrak, { action: 'listFungsio' })
  if (!res.success) throw new GasError(res.message || 'Gagal memuat daftar fungsio')
  return res.data ?? []
}

/** Data lengkap (termasuk WA asli) — hanya untuk dipakai di server. */
export async function getFungsio(id: string): Promise<Fungsio | null> {
  const res = await callGas<GasResult<Fungsio>>(GAS.kontrak, { action: 'getFungsio', id })
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
