import { NextResponse } from 'next/server'
import { listFungsio } from '@/lib/gas'

export const dynamic = 'force-dynamic'

// Daftar fungsio untuk dropdown pemohon. WA sudah dimasking di GAS.
// Di-cache di CDN Vercel 5 menit supaya GAS tidak dipanggil tiap page load.
export async function GET() {
  try {
    const data = await listFungsio()
    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    )
  } catch (err) {
    console.error('[api/fungsio]', err)
    return NextResponse.json(
      { data: [], error: 'Daftar fungsio belum bisa dimuat. Coba isi sebagai Warga, atau muat ulang halaman.' },
      { status: 502 },
    )
  }
}
