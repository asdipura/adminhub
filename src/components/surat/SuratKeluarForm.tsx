'use client'

import { useEffect, useState } from 'react'
import PemohonFields, {
  emptyPemohon, loadSavedPemohon, savePemohon, toPemohon, validatePemohon,
  type PemohonErrors, type PemohonState,
} from '@/components/forms/PemohonFields'
import TujuanTable, { emptyTujuan } from './TujuanTable'
import ReviewModal from './ReviewModal'
import type { Penandatangan, SuratKeluarRequest, TujuanTabel } from '@/types/surat'

type Step = 1 | 2 | 3
type Errors = PemohonErrors & Partial<Record<'perihal' | 'tanggal' | 'tujuan' | 'link' | 'konteks', string>>

const STEPS = ['Pemohon & Perihal', 'Tujuan Surat', 'Isi & Kelengkapan']

function todayISO() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

interface SuratKeluarFormProps {
  onDone: (kodeTiket: string) => void
}

export default function SuratKeluarForm({ onDone }: SuratKeluarFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [pemohon, setPemohon] = useState<PemohonState>(emptyPemohon)
  const [perihal, setPerihal] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [mode, setMode] = useState<'tabel' | 'link'>('tabel')
  const [tabel, setTabel] = useState<TujuanTabel>(emptyTujuan)
  const [link, setLink] = useState('')
  const [konteks, setKonteks] = useState('')
  const [tanda, setTanda] = useState<Penandatangan[]>([])
  const [lampiran, setLampiran] = useState<string[]>([])
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [review, setReview] = useState<SuratKeluarRequest | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => { setPemohon(loadSavedPemohon()) }, [])

  const clearErr = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined }))

  function validate(s: Step): Errors {
    const e: Errors = {}
    if (s === 1) {
      Object.assign(e, validatePemohon(pemohon))
      if (!perihal.trim()) e.perihal = 'Perihal surat wajib diisi'
      if (!tanggal) e.tanggal = 'Pilih tanggal surat dibutuhkan'
      else if (tanggal < todayISO()) e.tanggal = 'Tanggal sudah lewat'
    }
    if (s === 2) {
      if (mode === 'tabel' && !tabel.rows.some((r) => r[0]?.trim())) e.tujuan = 'Isi minimal satu tujuan di kolom pertama'
      if (mode === 'link' && !/^https?:\/\/\S+$/i.test(link.trim())) e.link = 'Tempel link spreadsheet yang valid (https://…)'
    }
    if (s === 3 && !konteks.trim()) e.konteks = 'Jelaskan keperluan surat ini'
    return e
  }

  function go(next: Step) {
    if (next > step) {
      const e = validate(step)
      setErrors(e)
      if (Object.values(e).some(Boolean)) return
    }
    setStep(next)
    // Scroll ke indikator langkah, sisakan ruang untuk navbar fixed
    const steps = document.querySelector<HTMLElement>('.sk-steps')
    if (steps) window.scrollTo({ top: steps.getBoundingClientRect().top + window.scrollY - 104, behavior: 'smooth' })
  }

  function openReview() {
    const e = validate(3)
    setErrors(e)
    if (Object.values(e).some(Boolean)) return
    setSendError('')
    setReview({
      pemohon: toPemohon(pemohon),
      perihal: perihal.trim(),
      tanggalDibutuhkan: tanggal,
      tujuan: mode === 'tabel'
        ? { type: 'tabel', data: { headers: tabel.headers.map((h) => h.trim() || 'Keterangan'), rows: tabel.rows.filter((r) => r.some((v) => v.trim())) } }
        : { type: 'link', url: link.trim() },
      konteks: konteks.trim(),
      penandatangan: tanda.filter((p) => p.jabatan || p.nama || p.nrp),
      lampiran: lampiran.map((l) => l.trim()).filter(Boolean),
    })
  }

  async function submit() {
    if (!review) return
    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/surat-keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', data: review, website: honeypot }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.message)
      savePemohon(pemohon)
      onDone(j.kodeTiket)
    } catch (err) {
      setSendError(err instanceof Error && err.message ? err.message : 'Koneksi terputus. Coba kirim lagi.')
    } finally {
      setSending(false)
    }
  }

  const setTandaAt = (i: number, patch: Partial<Penandatangan>) =>
    setTanda((t) => t.map((p, j) => (j === i ? { ...p, ...patch } : p)))

  return (
    <div className="sk-form">
      {/* Step indicator */}
      <ol className="sk-steps" aria-label="Langkah pengajuan">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step
          return (
            <li key={label} className={`sk-step${n === step ? ' active' : ''}${n < step ? ' done' : ''}`} aria-current={n === step ? 'step' : undefined}>
              <span className="sk-step-dot">{n < step ? '✓' : n}</span>
              <span className="sk-step-lbl">{label}</span>
            </li>
          )
        })}
      </ol>

      <div id="sk-panel">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <section className="fm-card">
              <header className="fm-card-head">
                <h3>Siapa yang mengajukan?</h3>
              </header>
              <PemohonFields value={pemohon} onChange={setPemohon} errors={errors} onClearError={clearErr} />
            </section>

            <section className="fm-card">
              <header className="fm-card-head">
                <h3>Surat apa yang dibutuhkan?</h3>
              </header>
              <div className="fm-field">
                <label className="fm-label" htmlFor="fm-perihal">Perihal surat</label>
                <input
                  id="fm-perihal"
                  className={`fm-input${errors.perihal ? ' err' : ''}`}
                  placeholder="Contoh: Undangan Narasumber Workshop Despro"
                  value={perihal}
                  onChange={(e) => { setPerihal(e.target.value); clearErr('perihal') }}
                />
                {errors.perihal && <span className="fm-err">{errors.perihal}</span>}
              </div>
              <div className="fm-field">
                <label className="fm-label" htmlFor="fm-tanggal">Tanggal dibutuhkan</label>
                <input
                  id="fm-tanggal"
                  type="date"
                  className={`fm-input fm-date${errors.tanggal ? ' err' : ''}`}
                  min={todayISO()}
                  value={tanggal}
                  onChange={(e) => { setTanggal(e.target.value); clearErr('tanggal') }}
                />
                {errors.tanggal
                  ? <span className="fm-err">{errors.tanggal}</span>
                  : <span className="fm-hint">Tanggal surat harus sudah kamu terima dari sekretaris, bukan tanggal acara. Idealnya H-10.</span>}
              </div>
            </section>

            <div className="sk-nav">
              <span />
              <button type="button" className="mf-primary" onClick={() => go(2)}>Lanjut ke tujuan surat →</button>
            </div>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <section className="fm-card">
              <header className="fm-card-head">
                <h3>Surat ditujukan ke siapa?</h3>
                <p>Satu baris = satu surat. Kolom tambahan jadi <code>{'{placeholder}'}</code> di template.</p>
              </header>

              <div className="fm-seg" role="tablist">
                <button type="button" role="tab" aria-selected={mode === 'tabel'} className={`fm-seg-btn${mode === 'tabel' ? ' on' : ''}`} onClick={() => setMode('tabel')}>Isi tabel</button>
                <button type="button" role="tab" aria-selected={mode === 'link'} className={`fm-seg-btn${mode === 'link' ? ' on' : ''}`} onClick={() => setMode('link')}>Link spreadsheet</button>
              </div>

              {mode === 'tabel' ? (
                <>
                  <TujuanTable value={tabel} onChange={(v) => { setTabel(v); clearErr('tujuan') }} invalid={!!errors.tujuan} />
                  {errors.tujuan
                    ? <span className="fm-err">{errors.tujuan}</span>
                    : <span className="fm-hint">Bisa paste langsung dari Excel / Google Sheets. Enter untuk pindah ke baris berikutnya.</span>}
                </>
              ) : (
                <div className="fm-field">
                  <label className="fm-label" htmlFor="fm-link">Link spreadsheet daftar tujuan</label>
                  <input
                    id="fm-link"
                    type="url"
                    className={`fm-input${errors.link ? ' err' : ''}`}
                    placeholder="https://docs.google.com/spreadsheets/…"
                    value={link}
                    onChange={(e) => { setLink(e.target.value); clearErr('link') }}
                  />
                  {errors.link
                    ? <span className="fm-err">{errors.link}</span>
                    : <span className="fm-hint">Pastikan aksesnya &ldquo;Anyone with the link&rdquo;. Data diolah manual oleh sekretaris.</span>}
                </div>
              )}
            </section>

            <div className="sk-nav">
              <button type="button" className="mf-secondary" onClick={() => go(1)}>← Kembali</button>
              <button type="button" className="mf-primary" onClick={() => go(3)}>Lanjut ke isi surat →</button>
            </div>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <section className="fm-card">
              <header className="fm-card-head">
                <h3>Keperluan / konteks</h3>
                <p>Untuk sekretaris, bukan isi surat final. Sekretaris yang menyusun isi suratnya.</p>
              </header>
              <div className="fm-field">
                <label className="fm-label sr-only" htmlFor="fm-konteks">Keperluan / konteks</label>
                <textarea
                  id="fm-konteks"
                  rows={5}
                  className={`fm-input${errors.konteks ? ' err' : ''}`}
                  placeholder="Contoh: Undangan untuk Bapak X sebagai pemateri workshop tanggal 12 Oktober, 13.00 di Ruang Sidang Despro…"
                  value={konteks}
                  onChange={(e) => { setKonteks(e.target.value); clearErr('konteks') }}
                />
                {errors.konteks && <span className="fm-err">{errors.konteks}</span>}
              </div>
            </section>

            <section className="fm-card">
              <header className="fm-card-head">
                <h3>Penandatangan <span className="fm-opt">Opsional</span></h3>
              </header>
              {tanda.map((p, i) => (
                <div className="fm-repeat" key={i}>
                  <input className="fm-input" aria-label={`Jabatan penandatangan ${i + 1}`} placeholder="Jabatan" value={p.jabatan} onChange={(e) => setTandaAt(i, { jabatan: e.target.value })} />
                  <input className="fm-input" aria-label={`Nama penandatangan ${i + 1}`} placeholder="Nama" value={p.nama} onChange={(e) => setTandaAt(i, { nama: e.target.value })} />
                  <input className="fm-input" aria-label={`NRP/NIP penandatangan ${i + 1}`} placeholder="NRP / NIP" value={p.nrp} onChange={(e) => setTandaAt(i, { nrp: e.target.value })} />
                  <button type="button" className="tj-x" aria-label={`Hapus penandatangan ${i + 1}`} onClick={() => setTanda((t) => t.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button type="button" className="fm-add" onClick={() => setTanda((t) => [...t, { jabatan: '', nama: '', nrp: '' }])}>＋ Tambah penandatangan</button>
            </section>

            <section className="fm-card">
              <header className="fm-card-head">
                <h3>Lampiran <span className="fm-opt">Opsional</span></h3>
              </header>
              {lampiran.map((l, i) => (
                <div className="fm-repeat fm-repeat-1" key={i}>
                  <input
                    className="fm-input"
                    type="url"
                    aria-label={`Link lampiran ${i + 1}`}
                    placeholder="https://drive.google.com/…"
                    value={l}
                    onChange={(e) => setLampiran((a) => a.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                  <button type="button" className="tj-x" aria-label={`Hapus lampiran ${i + 1}`} onClick={() => setLampiran((a) => a.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button type="button" className="fm-add" onClick={() => setLampiran((a) => [...a, ''])}>＋ Tambah link lampiran</button>
            </section>

            {/* Honeypot anti-bot — disembunyikan dari manusia */}
            <input className="fm-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

            <div className="sk-nav">
              <button type="button" className="mf-secondary" onClick={() => go(2)}>← Kembali</button>
              <button type="button" className="mf-primary" onClick={openReview}>Review request</button>
            </div>
          </>
        )}
      </div>

      {review && (
        <ReviewModal
          data={review}
          pemohon={pemohon}
          sending={sending}
          error={sendError}
          onClose={() => !sending && setReview(null)}
          onSubmit={submit}
        />
      )}
    </div>
  )
}
