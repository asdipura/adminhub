import { DAY_NAMES, MONTH_NAMES } from '@/config/calendar'

export function dateKey(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

export function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

export function getWeekStart(weekOffset: number): Date {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7)
  mon.setHours(0, 0, 0, 0)
  return mon
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getWeekDays(weekOffset: number): Date[] {
  const start = getWeekStart(weekOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function formatWeekRange(weekOffset: number): string {
  const start = getWeekStart(weekOffset)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const sLabel = start.getDate() + ' ' + MONTH_NAMES[start.getMonth()]
  const eLabel =
    end.getDate() + ' ' + MONTH_NAMES[end.getMonth()] + ' ' + end.getFullYear()
  return sLabel + ' – ' + eLabel
}

export function formatDayLabel(date: Date, isToday: boolean): string {
  const prefix = isToday ? 'Hari ini, ' : ''
  return (
    prefix +
    DAY_NAMES[date.getDay()] +
    ' ' +
    date.getDate() +
    ' ' +
    MONTH_NAMES[date.getMonth()]
  )
}

export function formatEventTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}.${m}`
  } catch {
    return ''
  }
}
