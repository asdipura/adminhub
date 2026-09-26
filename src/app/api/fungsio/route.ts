import { NextResponse } from 'next/server'
import { listFungsio } from '@/lib/gas'

export const dynamic = 'force-dynamic'

// Daftar fungsio untuk dropdown pemohon. WA sudah dimasking di GAS.
// Di-cache di CDN Vercel: segar 5 menit, setelah itu versi lama tetap dilayani
// instan sambil diperbarui di belakang layar (latensi GAS bisa sampai puluhan detik).
export async function GET() {
  try {
    const data = await listFungsio()
    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } },
    )
  } catch (err) {
    console.error('[api/fungsio]', err)
    return NextResponse.json(
      { data: [], error: 'Daftar fungsio belum bisa dimuat. Coba isi sebagai Warga, atau muat ulang halaman.' },
      { status: 502 },
    )
  }
}
