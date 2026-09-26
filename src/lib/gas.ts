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

export class GasError extends Error {}

export async function callGas<T = unknown>(target: GasTarget, body: Record<string, unknown>): Promise<T> {
  if (!target.url || !target.apiKey) {
    throw new GasError(`Endpoint ${target.name} belum dikonfigurasi di server`)
  }

  // GAS membalas 302 → googleusercontent; fetch mengikuti redirect otomatis.
  const res = await fetch(target.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, apiKey: target.apiKey }),
    cache: 'no-store',
  })

  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    console.error(`[gas:${target.name}] non-JSON response:`, text.slice(0, 300))
    throw new GasError(`${target.name} tidak mengembalikan respons yang valid`)
  }
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
