import { NextResponse } from 'next/server'

export const revalidate = 300 // 5 min cache

export async function GET() {
  const endpoint = process.env.GOOGLE_CALENDAR_GAS_ENDPOINT

  if (!endpoint) {
    return NextResponse.json({ events: [], source: 'no-endpoint' })
  }

  try {
    const res = await fetch(endpoint, { next: { revalidate: 300 } })
    const data = await res.json()
    return NextResponse.json({ events: data, source: 'google-calendar' })
  } catch {
    return NextResponse.json({ events: [], source: 'error' }, { status: 200 })
  }
}
