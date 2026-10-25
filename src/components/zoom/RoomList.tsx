'use client'

import { useEffect, useState } from 'react'
import { toWaLink } from '@/lib/whatsapp'
import type { Room, ZoomConfig } from '@/types/zoom'

const pad = (n: number) => String(n).padStart(2, '0')
const jamWIB = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) : '—'

/** Sisa waktu hh:mm:ss sampai `end`, diperbarui tiap detik */
function Countdown({ end, onEnd }: { end: string; onEnd: () => void }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = new Date(end).getTime() - now
  const ended = diff <= 0
  // Waktu habis → GAS melepas ruang otomatis; muat ulang sekali. onEnd sengaja tidak jadi dependency
  // (identitasnya berubah tiap render, timeout-nya jadi tidak pernah sempat jalan).
  useEffect(() => {
    if (!ended) return
    const t = setTimeout(onEnd, 1500)
    return () => clearTimeout(t)
  }, [ended]) // eslint-disable-line react-hooks/exhaustive-deps
  if (ended) return <span className="zm-cd">Selesai</span>
  const h = Math.floor(diff / 3_600_000), m = Math.floor((diff % 3_600_000) / 60_000), s = Math.floor((diff % 60_000) / 1000)
  return <span className="zm-cd">{pad(h)}:{pad(m)}:{pad(s)}</span>
}

interface RoomListProps {
  rooms: Room[] | null
  config: ZoomConfig | null
  error: string
  onRefresh: () => Promise<void>
}

export default function RoomList({ rooms, config, error, onRefresh }: RoomListProps) {
  const [open, setOpen] = useState<string | null>(null)
  const [names, setNames] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmEnd, setConfirmEnd] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ room: string; text: string; ok?: boolean } | null>(null)

  async function act(action: 'book' | 'end', room: Room) {
    const nama = (names[room.id] ?? '').trim()
    if (action === 'book' && !nama) { setMsg({ room: room.id, text: 'Isi nama kamu dulu' }); return }
    setBusy(room.id)
    setMsg(null)
    try {
      const res = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, roomId: room.id, nama }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.message)
      setMsg({ room: room.id, ok: true, text: action === 'book' ? `${room.id} aktif ${j.duration || config?.roomDuration || 60} menit. Selamat rapat!` : `${room.id} sudah diakhiri.` })
      setConfirmEnd(null)
      await onRefresh()
    } catch (err) {
      setMsg({ room: room.id, text: err instanceof Error && err.message ? err.message : 'Koneksi terputus. Coba lagi.' })
    } finally {
      setBusy(null)
    }
  }

  function copyInvitation(room: Room) {
    navigator.clipboard.writeText(room.invitation).then(() => setMsg({ room: room.id, ok: true, text: 'Teks undangan disalin' }))
  }

  return (
    <div className="zm-rooms-wrap">
      <section className="fm-card zm-howto">
        <header className="fm-card-head">
          <h3>Ruang rapat instan</h3>
          <p>Rapat mendadak? Pakai link Zoom permanen tanpa booking. Ruang aktif {config?.roomDuration ?? 60} menit lalu otomatis kosong lagi.</p>
        </header>
        <ol className="sk-next zm-steps">
          <li>Pilih ruang yang <b>Tersedia</b>, isi namamu, klik <b>Pakai</b>.</li>
          <li>Klik <b>Masuk ruang</b> dan bagikan undangannya ke peserta.</li>
          <li>Selesai rapat? Klik <b>Akhiri rapat</b> supaya ruang bisa dipakai yang lain.</li>
        </ol>
        {config?.notulensiUrl && /^https?:\/\//.test(config.notulensiUrl) && (
          <a className="fm-add zm-notula" href={config.notulensiUrl} target="_blank" rel="noopener noreferrer">📝 Buat file notulensi ↗</a>
        )}
      </section>

      {error && !rooms && (
        <div className="sk-alert" role="alert">
          {error} <button type="button" className="zm-inline-btn" onClick={() => onRefresh()}>Coba lagi</button>
        </div>
      )}

      {!rooms && !error && (
        <div className="sk-results" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="sk-skel zm-skel" />)}</div>
      )}

      {rooms && rooms.length === 0 && <p className="sk-empty">Belum ada ruang rapat di sheet RUANG_RAPAT.</p>}

      {rooms && rooms.length > 0 && (
        <div className="zm-rooms">
          {rooms.map((room) => {
            const used = room.status === 'Dipakai'
            const isOpen = open === room.id
            return (
              <div key={room.id} className={`zm-room${used ? ' used' : ''}${isOpen ? ' open' : ''}`}>
                <button type="button" className="zm-room-top" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : room.id)}>
                  <span>
                    <span className="zm-room-id">{room.id}</span>
                    <span className="zm-room-name">{room.name}</span>
                  </span>
                  <span className={`zm-dot${used ? ' used' : ''}`}>{used ? 'Dipakai' : 'Tersedia'}</span>
                </button>

                {isOpen && (
                  <div className="zm-room-body">
                    {!used ? (
                      <form className="zm-book" onSubmit={(e) => { e.preventDefault(); act('book', room) }}>
                        <label className="sr-only" htmlFor={`zm-n-${room.id}`}>Nama kamu</label>
                        <input
                          id={`zm-n-${room.id}`}
                          className="fm-input"
                          placeholder="Nama kamu"
                          maxLength={60}
                          autoFocus
                          value={names[room.id] ?? ''}
                          onChange={(e) => setNames((n) => ({ ...n, [room.id]: e.target.value }))}
                          disabled={busy === room.id}
                        />
                        <button type="submit" className="mf-primary" disabled={busy === room.id}>
                          {busy === room.id ? <span className="sk-spin" aria-hidden="true" /> : 'Pakai'}
                        </button>
                      </form>
                    ) : (
                      <>
                        <dl className="sk-kv">
                          <dt>Dipakai oleh</dt><dd>{room.occupant || '—'}</dd>
                          <dt>Mulai</dt><dd>{jamWIB(room.startTime)} WIB</dd>
                          <dt>Sisa waktu</dt><dd>{room.endTime ? <Countdown end={room.endTime} onEnd={() => onRefresh()} /> : '—'}</dd>
                        </dl>
                        <div className="zm-room-act">
                          {/^https?:\/\//.test(room.zoomLink)
                            ? <a className="mf-primary" href={room.zoomLink} target="_blank" rel="noopener noreferrer">Masuk ruang ↗</a>
                            : <span className="fm-hint">Link Zoom ruang ini belum diisi di sheet.</span>}
                          {room.invitation && <button type="button" className="mf-secondary" onClick={() => copyInvitation(room)}>Salin undangan</button>}
                        </div>
                        {confirmEnd === room.id ? (
                          <div className="zm-confirm">
                            <span>Akhiri {room.id}? Status kembali ke Tersedia.</span>
                            <button type="button" className="mf-secondary" onClick={() => setConfirmEnd(null)} disabled={busy === room.id}>Batal</button>
                            <button type="button" className="zm-end" onClick={() => act('end', room)} disabled={busy === room.id}>
                              {busy === room.id ? 'Mengakhiri…' : `Akhiri ${room.id}`}
                            </button>
                          </div>
                        ) : (
                          <button type="button" className="zm-end" onClick={() => setConfirmEnd(room.id)}>Akhiri rapat</button>
                        )}
                        {config?.sekre1Wa && (
                          <p className="fm-hint">
                            Butuh akses host?{' '}
                            <a className="sk-link" href={`${toWaLink(config.sekre1Wa)}?text=${encodeURIComponent(`Halo Ka Sekre, saya butuh akses host untuk ${room.id}. Terima kasih 🙏`)}`} target="_blank" rel="noopener noreferrer">
                              Minta ke sekretaris
                            </a>
                          </p>
                        )}
                      </>
                    )}
                    {msg?.room === room.id && (
                      <div className={msg.ok ? 'sk-wait' : 'sk-alert'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
