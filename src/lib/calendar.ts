import type { CalendarResponse, FallbackEvents } from '@/types/calendar'
import { fallbackEventsRelative } from '@/config/calendar'
import { dateKey, addDays } from './dates'

export async function fetchCalendarEvents(): Promise<CalendarResponse> {
  try {
    const res = await fetch('/api/calendar')
    if (!res.ok) throw new Error('fetch failed')
    const data: CalendarResponse = await res.json()
    return data
  } catch {
    return { events: [], source: 'error' }
  }
}

/**
 * Build fallback events map keyed by ISO date string.
 * Day offsets are relative to today.
 */
export function buildFallbackEvents(): FallbackEvents {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const ev: FallbackEvents = {}
  for (const item of fallbackEventsRelative) {
    const d = addDays(today, item.dayOffset)
    const k = dateKey(d)
    if (!ev[k]) ev[k] = []
    ev[k].push({ time: item.time, title: item.title, desc: item.desc })
  }
  return ev
}
