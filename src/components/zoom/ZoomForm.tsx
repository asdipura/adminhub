'use client'

import { useEffect, useState } from 'react'
import PemohonFields, {
  emptyPemohon, loadSavedPemohon, savePemohon, toPemohon, validatePemohon,
  type PemohonErrors, type PemohonState,
} from '@/components/forms/PemohonFields'
import { fmtTanggal, useElapsed } from '@/components/surat/shared'
import { DURASI_ZOOM, PANDUAN_ZOOM, SYARAT_ZOOM } from '@/config/zoom'
import type { ZoomRequest } from '@/types/zoom'

type Step = 1 | 2 | 3
type Errors = PemohonErrors & Partial<Record<'topik' | 'tanggal' | 'jam' | 'durasi' | 'email' | 'agree', string>>

const STEPS = ['Pemohon', 'Detail Meeting', 'Syarat & Kirim']

function todayISO() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

const durasiLabel = (m: number) => (m < 60 ? `${m} menit` : `${m} menit (${m / 60} jam)`)

interface ZoomFormProps {
  calendarId: string
  onDone: (code: string, nama: string) => void
  onCari: (query: string) => void
}

export default function ZoomForm({ calendarId, onDone, onCari }: ZoomFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [pemohon, setPemohon] = useState<PemohonState>(emptyPemohon)
  const [topik, setTopik] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [jam, setJam] = useState('')
  const [durasi, setDurasi] = useState('')
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [calOpen, setCalOpen] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [uncertain, setUncertain] = useState(false)
  const elapsed = useElapsed(sending)

  useEffect(() => { setPemohon(loadSavedPemohon()) }, [])

  const clearErr = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined }))
  const pemohonNama = pemohon.tipe === 'fungsio' ? pemohon.fungsioNama : pemohon.nama.trim()

  function validate(s: Step): Errors {
    const e: Errors = {}
    if (s === 1) Object.assign(e, validatePemohon(pemohon))
    if (s === 2) {
      if (!topik.trim()) e.topik = 'Topik meeting wajib diisi'
      if (!tanggal) e.tanggal = 'Pilih tanggal meeting'
      else if (tanggal < todayISO()) e.tanggal = 'Tanggal sudah lewat'
      if (!jam) e.jam = 'Pilih jam mulai'
      if (!durasi) e.durasi = 'Pilih durasi'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Isi email akun Zoom host yang valid'
    }
    if (s === 3 && !agree) e.agree = 'Centang persetujuan syarat & ketentuan dulu'
    return e
  }

  function go(next: Step) {
    if (next > step) {
      const e = validate(step)
      setErrors(e)
      if (Object.values(e).some(Boolean)) return
    }
    setStep(next)
    const el = document.querySelector<HTMLElement>('.sk-steps')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 104, behavior: 'smooth' })
  }

  async function submit() {
    const e = validate(3)
    setErrors(e)
    if (Object.values(e).some(Boolean)) return

    const data: ZoomRequest = {
      pemohon: toPemohon(pemohon),
      topik: topik.trim(),
      tanggal,
      jam,
      durasi: Number(durasi),
      emailHost: email.trim(),
    }
    setSending(true)
    setSendError('')
    let j: { success?: boolean; uncertain?: boolean; message?: string; code?: string }
    try {
      const res = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', data, website: honeypot }),
      })
      j = await res.json()
    } catch {
      j = { success: false, uncertain: true, message: 'Koneksi terputus sebelum konfirmasi diterima. Request kamu mungkin sudah masuk — cek dulu di Cek Status sebelum mengirim ulang.' }
    }
    setSending(false)

    if (j.success && j.code) {
      savePemohon(pemohon)
      onDone(j.code, pemohonNama)
      return
    }
    if (j.uncertain) savePemohon(pemohon)
    setUncertain(!!j.uncertain)
    setSendError(j.message || 'Request gagal dikirim. Coba lagi.')
  }

  return (
    <div className="sk-form">
      <ol className="sk-steps" aria-label="Langkah pengajuan">
        {STEPS.map((label, i) => {
          const s = (i + 1) as Step
          return (
            <li key={label} className={`sk-step${s === step ? ' active' : ''}${s < step ? ' done' : ''}`} aria-current={s === step ? 'step' : undefined}>
              <span className="sk-step-dot">{s < step ? '✓' : s}</span>
              <span className="sk-step-lbl">{label}</span>
            </li>
          )
        })}
      </ol>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Siapa penanggung jawabnya?</h3>
              <p>Untuk kegiatan resmi yang butuh jadwal khusus. Sekretaris yang membuatkan link Zoom-nya.</p>
            </header>
            <PemohonFields value={pemohon} onChange={setPemohon} errors={errors} onClearError={clearErr} />
          </section>
          <div className="sk-nav">
            <span />
            <button type="button" className="mf-primary" onClick={() => go(2)}>Lanjut ke detail meeting →</button>
          </div>
        </>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <>
          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Detail meeting</h3>
            </header>

            {calendarId && (
              <div className="zm-cal">
                <button type="button" className="fm-add" aria-expanded={calOpen} onClick={() => setCalOpen((o) => !o)}>
                  📅 {calOpen ? 'Sembunyikan kalender' : 'Cek jadwal Zoom yang sudah terpakai'}
                </button>
                {calOpen && (
                  <iframe
                    className="zm-cal-frame"
                    title="Kalender Zoom HIMA IDE"
                    src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=Asia%2FJakarta&mode=WEEK&showTitle=0&showPrint=0&showCalendars=0`}
                  />
                )}
              </div>
            )}

            <div className="fm-field">
              <label className="fm-label" htmlFor="zm-topik">Topik / nama meeting</label>
              <input
                id="zm-topik"
                className={`fm-input${errors.topik ? ' err' : ''}`}
                placeholder="Contoh: Rapat Koordinasi Proker HIMA IDE"
                value={topik}
                onChange={(e) => { setTopik(e.target.value); clearErr('topik') }}
              />
              {errors.topik && <span className="fm-err">{errors.topik}</span>}
            </div>
            <div className="fm-row">
              <div className="fm-field">
                <label className="fm-label" htmlFor="zm-tgl">Tanggal</label>
                <input
                  id="zm-tgl"
                  type="date"
                  className={`fm-input fm-date${errors.tanggal ? ' err' : ''}`}
                  min={todayISO()}
                  value={tanggal}
                  onChange={(e) => { setTanggal(e.target.value); clearErr('tanggal') }}
                />
                {errors.tanggal ? <span className="fm-err">{errors.tanggal}</span> : <span className="fm-hint">Ajukan paling lambat H-3</span>}
              </div>
              <div className="fm-field">
                <label className="fm-label" htmlFor="zm-jam">Jam mulai (WIB)</label>
                <input
                  id="zm-jam"
                  type="time"
                  className={`fm-input fm-date${errors.jam ? ' err' : ''}`}
                  value={jam}
                  onChange={(e) => { setJam(e.target.value); clearErr('jam') }}
                />
                {errors.jam && <span className="fm-err">{errors.jam}</span>}
              </div>
            </div>
            <div className="fm-row">
              <div className="fm-field">
                <label className="fm-label" htmlFor="zm-dur">Durasi</label>
                <select
                  id="zm-dur"
                  className={`fm-input fm-date${errors.durasi ? ' err' : ''}`}
                  value={durasi}
                  onChange={(e) => { setDurasi(e.target.value); clearErr('durasi') }}
                >
                  <option value="">Pilih durasi</option>
                  {DURASI_ZOOM.map((m) => <option key={m} value={m}>{durasiLabel(m)}</option>)}
                </select>
                {errors.durasi && <span className="fm-err">{errors.durasi}</span>}
              </div>
              <div className="fm-field">
                <label className="fm-label" htmlFor="zm-email">Email host</label>
                <input
                  id="zm-email"
                  type="email"
                  autoComplete="email"
                  className={`fm-input${errors.email ? ' err' : ''}`}
                  placeholder="email@its.ac.id"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearErr('email') }}
                />
                {errors.email ? <span className="fm-err">{errors.email}</span> : <span className="fm-hint">Akun Zoom yang dijadikan host</span>}
              </div>
            </div>
          </section>
          <div className="sk-nav">
            <button type="button" className="mf-secondary" onClick={() => go(1)}>← Kembali</button>
            <button type="button" className="mf-primary" onClick={() => go(3)}>Lanjut ke syarat →</button>
          </div>
        </>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <>
          <section className="fm-card sk-rv">
            <header className="fm-card-head">
              <h3>Cek lagi sebelum dikirim</h3>
            </header>
            <div className="sk-rv-perihal">{topik}</div>
            <dl className="sk-kv">
              <dt>PIC</dt><dd>{pemohonNama || '—'}</dd>
              <dt>Jadwal</dt><dd>{fmtTanggal(tanggal)}, {jam} WIB</dd>
              <dt>Durasi</dt><dd>{durasiLabel(Number(durasi))}</dd>
              <dt>Host</dt><dd>{email}</dd>
            </dl>
          </section>

          <section className="fm-card">
            <details className="zm-syarat">
              <summary>Syarat &amp; ketentuan peminjaman</summary>
              <ol>
                {SYARAT_ZOOM.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="fm-hint">
                Panduan penggunaan Zoom:{' '}
                <a className="sk-link" href={PANDUAN_ZOOM} target="_blank" rel="noopener noreferrer">intip.in/petunjukpenggunaanzoom</a>
              </p>
            </details>
            <label className={`zm-agree${errors.agree ? ' err' : ''}`}>
              <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); clearErr('agree') }} />
              <span>Saya memahami dan menyetujui seluruh syarat &amp; ketentuan peminjaman Zoom HIMA IDE ITS.</span>
            </label>
            {errors.agree && <span className="fm-err">{errors.agree}</span>}

            {sending && elapsed >= 4 && (
              <div className="sk-wait" role="status">Menyimpan request &amp; memberi tahu sekretaris… Jangan tutup halaman ini. ({elapsed} dtk)</div>
            )}
            {sendError && <div className="sk-alert" role="alert">{sendError}</div>}
          </section>

          <input className="fm-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

          <div className="sk-nav">
            <button type="button" className="mf-secondary" onClick={() => go(2)} disabled={sending}>← Kembali</button>
            {uncertain ? (
              <button type="button" className="mf-primary" onClick={() => onCari(pemohonNama)}>Cek di Cek Status</button>
            ) : (
              <button type="button" className="mf-primary" onClick={submit} disabled={sending}>
                {sending ? <><span className="sk-spin" aria-hidden="true" /> Mengirim…</> : 'Kirim request'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
