'use client'

import { useState, useEffect } from 'react'
import { DAY_NAMES, MONTH_NAMES } from '@/config/calendar'
import { buildFallbackEvents } from '@/lib/calendar'
import { getWeekDays, dateKey, formatWeekRange, formatDayLabel, isSameDay, formatEventTime } from '@/lib/dates'
import type { FallbackEvents } from '@/types/calendar'
import type { CalendarResponse } from '@/types/calendar'

export default function WeekCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [events, setEvents] = useState<FallbackEvents>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Build fallback events based on today
    const fallback = buildFallbackEvents()
    setEvents(fallback)

    // Try to fetch from API
    async function fetchEvents() {
      try {
        const res = await fetch('/api/calendar')
        if (!res.ok) throw new Error('fetch failed')
        const data: CalendarResponse = await res.json()

        if (data.source === 'google-calendar' && data.events.length > 0) {
          // Convert Google Calendar events to our local format
          const mapped: FallbackEvents = {}
          data.events.forEach((ev) => {
            const start = new Date(ev.start)
            const k = dateKey(start)
            if (!mapped[k]) mapped[k] = []
            mapped[k].push({
              time: formatEventTime(ev.start),
              title: ev.title,
              desc: ev.location || ev.description || '',
            })
          })
          setEvents(mapped)
        }
      } catch {
        // Keep fallback
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const days = getWeekDays(weekOffset)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selKey = dateKey(selectedDate)
  const selectedEvents = events[selKey] || []
  const isSelToday = isSameDay(selectedDate, today)

  function goToday() {
    setWeekOffset(0)
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    setSelectedDate(d)
  }

  return (
    <div className="week">
      <div className="week-hdr">
        <h3>📅 Jadwal</h3>
        <div className="week-nav">
          <button className="wn-btn" onClick={() => setWeekOffset((o) => o - 1)}>‹</button>
          <span className="wn-range">{formatWeekRange(weekOffset)}</span>
          <button className="wn-btn" onClick={() => setWeekOffset((o) => o + 1)}>›</button>
          <button className="wn-today" onClick={goToday}>Hari ini</button>
        </div>
      </div>

      <div className="week-days">
        {days.map((d) => {
          const k = dateKey(d)
          const isToday = isSameDay(d, today)
          const isSel = k === selKey
          const dayEvents = events[k] || []
          const hasEv = dayEvents.length > 0

          let cls = 'wd'
          if (isToday) cls += ' today'
          if (isSel) cls += ' sel'
          if (hasEv) cls += ' has-ev'

          return (
            <div
              key={k}
              className={cls}
              onClick={() => {
                const nd = new Date(d)
                nd.setHours(0, 0, 0, 0)
                setSelectedDate(nd)
              }}
            >
              <div className="wd-lbl">{DAY_NAMES[d.getDay()]}</div>
              <div className="wd-num">{d.getDate()}</div>
              <div className="wd-dots">
                {dayEvents.slice(0, 3).map((_, i) => (
                  <span key={i} className="evd"></span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="week-sel">
        <span>Acara —</span>
        <span className="ws-day">
          {formatDayLabel(selectedDate, isSelToday)}
        </span>
      </div>

      <div className="week-events">
        {loading ? (
          <div className="we-empty">Memuat jadwal...</div>
        ) : selectedEvents.length === 0 ? (
          <div className="we-empty">Tidak ada jadwal hari ini 🗓️</div>
        ) : (
          selectedEvents.map((ev, i) => (
            <div key={i} className="we">
              <div className="we-dot"></div>
              <div className="we-time">{ev.time}</div>
              <div className="we-info">
                <div className="we-title">{ev.title}</div>
                {ev.desc && <div className="we-desc">{ev.desc}</div>}
              </div>
              {selectedEvents.length > 1 && (
                <div className="we-count">{i + 1}/{selectedEvents.length}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
