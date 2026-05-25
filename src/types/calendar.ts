export type CalendarEvent = {
  id?: string
  title: string
  start: string
  end: string
  location?: string
  description?: string
}

export type CalendarSource = 'google-calendar' | 'fallback' | 'no-endpoint' | 'error'

export type CalendarResponse = {
  events: CalendarEvent[]
  source: CalendarSource
}

// Fallback event shape for inline config
export type FallbackEvent = {
  time: string
  title: string
  desc?: string
}

export type FallbackEvents = Record<string, FallbackEvent[]>
