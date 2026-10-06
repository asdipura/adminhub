'use client'

import { useEffect, useState } from 'react'
import NamePicker from '@/components/forms/NamePicker'
import { useElapsed } from '@/components/surat/shared'
import SuratPreview from './SuratPreview'
import SignatureInput, { type Signature } from './SignatureInput'
import type { AnggotaPublic, KomitmenInfo, Submission, SuratFields } from '@/types/komitmen'

type Step = 1 | 2 | 3
const STEPS = ['Identitas', 'Preview Surat', 'Tanda Tangan']

const anggotaSub = (a: AnggotaPublic) => a.label
const anggotaSearch = (a: AnggotaPublic) => a.label

function fmtWaktu(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
}

type Json = { success?: boolean; ok?: boolean; uncertain?: boolean; message?: string; [k: string]: unknown }

async function post(body: Record<string, unknown>): Promise<Json> {
  const res = await fetch('/api/komitmen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function KomitmenForm({ onDone }: { onDone: (pdfUrl: string) => void }) {
  const [step, setStep] = useState<Step>(1)

  const [anggota, setAnggota] = useState<AnggotaPublic[]>([])
  const [info, setInfo] = useState<KomitmenInfo | null>(null)
  const [loadErr, setLoadErr] = useState('')

  const [selected, setSelected] = useState<AnggotaPublic | null>(null)
  const [nrp, setNrp] = useState('')
  const [showNrp, setShowNrp] = useState(false)
  const [surat, setSurat] = useState<SuratFields | null>(null)
  const [sudah, setSudah] = useState<Submission | null>(null)
  const [checking, setChecking] = useState(false)

  const [agree, setAgree] = useState(false)
  const [sig, setSig] = useState<Signature | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const elapsed = useElapsed(sending)

  const [errors, setErrors] = useState<Partial<Record<'nama' | 'nrp' | 'agree' | 'ttd', string>>>({})
  const clearErr = (k: keyof typeof errors) => setErrors((e) => ({ ...e, [k]: undefined }))

  useEffect(() => {
    fetch('/api/komitmen')
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.message)
        setAnggota(j.anggota)
        setInfo(j.info)
      })
      .catch((e: Error) => setLoadErr(e.message || 'Daftar nama belum bisa dimuat. Muat ulang halaman.'))
  }, [])

  function scrollToSteps() {
    const el = document.querySelector<HTMLElement>('.sk-steps')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 104, behavior: 'smooth' })
  }

  function go(n: Step) {
    setStep(n)
    scrollToSteps()
  }

  async function verify() {
    const e: typeof errors = {}
    if (!selected) e.nama = 'Pilih nama kamu dari daftar'
    const digits = nrp.replace(/\D/g, '')
    if (!digits) e.nrp = 'NRP wajib diisi'
    setErrors(e)
    if (e.nama || e.nrp || !selected) return

    setChecking(true)
    let j: Json
    try {
      j = await post({ action: 'verify', id: selected.id, nama: selected.nama, nrp: digits })
    } catch {
      j = { ok: false, message: 'Gagal menghubungi server. Periksa koneksi lalu coba lagi.' }
    }
    setChecking(false)

    if (!j.ok) return setErrors({ nrp: j.message || 'NRP tidak cocok dengan nama yang dipilih.' })
    setSurat(j.data as SuratFields)
    setSudah((j.sudah as Submission | null) ?? null)
    go(2)
  }

  async function submit() {
    const e: typeof errors = {}
    if (!agree) e.agree = 'Centang persetujuan untuk melanjutkan'
    if (!sig) e.ttd = 'Unggah gambar tanda tangan kamu'
    setErrors(e)
    if (e.agree || e.ttd || !selected || !surat || !sig) return

    setSending(true)
    setSendError('')
    let j: Json
    try {
      j = await post({
        action: 'submit',
        id: selected.id, nama: selected.nama, nrp: surat.nrp,
        signature: { base64: sig.base64, mime: sig.mime, w: sig.w, h: sig.h },
        website: honeypot,
      })
    } catch {
      j = { success: false, message: 'Koneksi terputus sebelum konfirmasi diterima. Suratmu mungkin sudah dibuat — muat ulang halaman, isi nama & NRP lagi untuk mengeceknya sebelum mengirim ulang.' }
    }
    setSending(false)

    if (j.success) return onDone(String(j.pdfUrl ?? ''))
    setSendError(j.message || 'Surat belum berhasil dibuat. Coba lagi.')
  }

  return (
    <div className="sk-form">
      <ol className="sk-steps" aria-label="Langkah pengisian">
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

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Siapa yang mengisi?</h3>
              <p>Untuk seluruh Fungsionaris dan Staff Magang Kabinet Evagranada.</p>
            </header>

            <div className="fm-field">
              <label className="fm-label" htmlFor="km-nama">Nama lengkap</label>
              <NamePicker
                list={anggota}
                loading={!info && !loadErr}
                error={loadErr}
                value={selected?.id ?? ''}
                onChange={(a) => { setSelected(a); setSurat(null); clearErr('nama') }}
                invalid={!!errors.nama}
                inputId="km-nama"
                sub={anggotaSub}
                searchText={anggotaSearch}
                empty="Nama tidak ditemukan. Coba ejaan lain, atau hubungi Sekretaris HIMA IDE."
              />
              {errors.nama
                ? <span className="fm-err">{errors.nama}</span>
                : loadErr
                  ? <span className="fm-err">{loadErr}</span>
                  : !selected && <span className="fm-hint">Bisa cari pakai nama, jabatan, atau departemen.</span>}
            </div>

            <div className="fm-field">
              <label className="fm-label" htmlFor="km-nrp">NRP</label>
              <div className="km-nrp">
                <input
                  id="km-nrp"
                  className={`fm-input${errors.nrp ? ' err' : ''}`}
                  type={showNrp ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  placeholder="5028XXXXXX"
                  value={nrp}
                  onChange={(e) => { setNrp(e.target.value); clearErr('nrp') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') verify() }}
                />
                <button type="button" className="km-nrp-toggle" onClick={() => setShowNrp((s) => !s)} aria-pressed={showNrp}>
                  {showNrp ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
              {errors.nrp
                ? <span className="fm-err">{errors.nrp}</span>
                : <span className="fm-hint">Dipakai untuk memastikan kamu mengisi atas nama sendiri.</span>}
            </div>
          </section>

          <div className="sk-nav">
            <span />
            <button type="button" className="mf-primary" onClick={verify} disabled={checking || !info}>
              {checking ? <><span className="sk-spin" aria-hidden="true" /> Memeriksa NRP…</> : 'Lanjut ke preview →'}
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && surat && info && (
        <>
          {sudah && (
            <div className="km-notice" role="status">
              <b>Kamu sudah pernah mengisi</b> pada {fmtWaktu(sudah.waktu)}.{' '}
              {/^https?:\/\//.test(sudah.pdfUrl) && (
                <a className="sk-link" href={sudah.pdfUrl} target="_blank" rel="noopener noreferrer">Buka surat sebelumnya</a>
              )}
              <br />Lanjutkan hanya kalau perlu memperbaiki, karena surat baru akan dibuat.
            </div>
          )}

          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Periksa isi surat</h3>
              <p>Data diambil dari daftar anggota. Ada yang salah? Hubungi Sekretaris HIMA IDE sebelum melanjutkan.</p>
            </header>
            <SuratPreview info={info} d={surat} />
          </section>

          <div className="sk-nav">
            <button type="button" className="mf-secondary" onClick={() => go(1)}>← Kembali</button>
            <button type="button" className="mf-primary" onClick={() => go(3)}>Lanjut tanda tangan →</button>
          </div>
        </>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <>
          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Persetujuan</h3>
            </header>
            <label className={`km-check${agree ? ' on' : ''}${errors.agree ? ' err' : ''}`}>
              <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); clearErr('agree') }} />
              <span>
                Saya telah membaca dan menyetujui isi Surat Pernyataan Komitmen Pembayaran Iuran ini dengan penuh
                kesadaran dan tanpa paksaan dari pihak mana pun.
              </span>
            </label>
            {errors.agree && <span className="fm-err">{errors.agree}</span>}
          </section>

          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Tanda tangan</h3>
              <p>Foto atau scan tanda tanganmu. Gambar akan ditempel di bagian tanda tangan surat.</p>
            </header>
            <SignatureInput value={sig} onChange={(s) => { setSig(s); clearErr('ttd') }} error={errors.ttd} />
          </section>

          {/* Honeypot anti-bot — disembunyikan dari manusia */}
          <input className="fm-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

          {sending && elapsed >= 8 && (
            <div className="sk-wait" role="status">
              Surat sedang dibuat… {elapsed} dtk. Server kadang butuh sampai 40 detik — jangan tutup halaman ini.
            </div>
          )}
          {sendError && <div className="sk-alert" role="alert">{sendError}</div>}

          <div className="sk-nav">
            <button type="button" className="mf-secondary" onClick={() => go(2)} disabled={sending}>← Kembali</button>
            <button type="button" className="mf-primary" onClick={submit} disabled={sending}>
              {sending ? <><span className="sk-spin" aria-hidden="true" /> Membuat surat…</> : 'Kirim & buat surat'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
