'use client'

import { useEffect, useState } from 'react'
import PemohonFields, {
  emptyPemohon, loadSavedPemohon, savePemohon, toPemohon, validatePemohon,
  type PemohonErrors, type PemohonState,
} from '@/components/forms/PemohonFields'
import { fmtTanggal, SafeLink, useElapsed } from '@/components/surat/shared'
import type { PesertaGroup, SertifRequest } from '@/types/sertif'

type Step = 1 | 2 | 3
type Errors = PemohonErrors & Partial<Record<'jabatan' | 'kegiatan' | 'tgl' | 'jumlah' | 'link', string>>
type Group = { role: string; text: string }

const STEPS = ['Pemohon & Kegiatan', 'Daftar Peserta', 'Master & Kirim']

const parseNames = (t: string) => t.split('\n').map((s) => s.trim()).filter(Boolean)
const toGroups = (gs: Group[]): PesertaGroup[] =>
  gs.map((g) => ({ role: g.role.trim(), namaList: parseNames(g.text) })).filter((g) => g.namaList.length)

interface SertifFormProps {
  onDone: (kode: string) => void
}

export default function SertifForm({ onDone }: SertifFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [pemohon, setPemohon] = useState<PemohonState>(emptyPemohon)
  const [jabatan, setJabatan] = useState('')
  const [kegiatan, setKegiatan] = useState('')
  const [tgl, setTgl] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [ket, setKet] = useState('')
  const [groups, setGroups] = useState<Group[]>([{ role: '', text: '' }])
  const [link, setLink] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [mismatch, setMismatch] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [uncertain, setUncertain] = useState(false)
  const elapsed = useElapsed(sending)

  useEffect(() => { setPemohon(loadSavedPemohon()) }, [])

  const clearErr = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined }))
  const total = groups.reduce((s, g) => s + parseNames(g.text).length, 0)
  const n = parseInt(jumlah, 10) || 0

  function validate(s: Step): Errors {
    const e: Errors = {}
    if (s === 1) {
      Object.assign(e, validatePemohon(pemohon))
      if (!jabatan.trim()) e.jabatan = 'Isi jabatan kamu di kepanitiaan'
      if (!kegiatan.trim()) e.kegiatan = 'Nama kegiatan wajib diisi'
      if (!tgl) e.tgl = 'Pilih tanggal selesai acara'
      if (!(n >= 1 && n <= 1000)) e.jumlah = 'Isi jumlah nomor (1–1000)'
    }
    if (s === 3 && link.trim() && !/^https?:\/\/\S+$/i.test(link.trim())) e.link = 'Tempel link yang valid (https://…)'
    return e
  }

  function scrollToSteps() {
    const el = document.querySelector<HTMLElement>('.sk-steps')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 104, behavior: 'smooth' })
  }

  function go(next: Step) {
    if (next > step) {
      const e = validate(step)
      setErrors(e)
      if (Object.values(e).some(Boolean)) return
      // Daftar nama tidak sama dengan jumlah nomor → minta pilih dulu
      if (step === 2 && total > 0 && total !== n) { setMismatch(true); return }
    }
    setMismatch(false)
    setStep(next)
    scrollToSteps()
  }

  function pickJumlah(v: number) {
    setJumlah(String(v))
    setMismatch(false)
    setStep(3)
    scrollToSteps()
  }

  async function submit() {
    const e = validate(3)
    setErrors(e)
    if (Object.values(e).some(Boolean)) return

    const data: SertifRequest = {
      pemohon: toPemohon(pemohon),
      jabatan: jabatan.trim(),
      namaKegiatan: kegiatan.trim(),
      tglSelesai: tgl,
      jumlah: n,
      keterangan: ket.trim(),
      peserta: toGroups(groups),
      linkMaster: link.trim(),
    }
    setSending(true)
    setSendError('')
    let j: { success?: boolean; uncertain?: boolean; message?: string; kode?: string }
    try {
      const res = await fetch('/api/sertif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', data, website: honeypot }),
      })
      j = await res.json()
    } catch {
      j = { success: false, uncertain: true, message: 'Koneksi terputus sebelum konfirmasi diterima. Request kamu mungkin sudah masuk — tanyakan ke sekretaris sebelum mengirim ulang.' }
    }
    setSending(false)

    if (j.success && j.kode) {
      savePemohon(pemohon)
      onDone(j.kode)
      return
    }
    if (j.uncertain) savePemohon(pemohon)
    setUncertain(!!j.uncertain)
    setSendError(j.message || 'Request gagal dikirim. Coba lagi.')
  }

  const setGroup = (i: number, patch: Partial<Group>) =>
    setGroups((gs) => gs.map((g, k) => (k === i ? { ...g, ...patch } : g)))

  const pemohonNama = pemohon.tipe === 'fungsio' ? pemohon.fungsioNama : pemohon.nama
  const peserta = toGroups(groups)

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
              <h3>Siapa yang mengajukan?</h3>
            </header>
            <PemohonFields value={pemohon} onChange={setPemohon} errors={errors} onClearError={clearErr} />
          </section>

          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Sertifikat untuk kegiatan apa?</h3>
            </header>
            <div className="fm-field">
              <label className="fm-label" htmlFor="st-keg">Nama kegiatan</label>
              <input
                id="st-keg"
                className={`fm-input${errors.kegiatan ? ' err' : ''}`}
                placeholder="Contoh: Pelepasan Wisuda ke-131"
                value={kegiatan}
                onChange={(e) => { setKegiatan(e.target.value); clearErr('kegiatan') }}
              />
              {errors.kegiatan && <span className="fm-err">{errors.kegiatan}</span>}
            </div>
            <div className="fm-field">
              <label className="fm-label" htmlFor="st-jab">Jabatan kamu di kepanitiaan</label>
              <input
                id="st-jab"
                className={`fm-input${errors.jabatan ? ' err' : ''}`}
                placeholder="Ketua Panitia, Sekretaris, Tim Desain…"
                value={jabatan}
                onChange={(e) => { setJabatan(e.target.value); clearErr('jabatan') }}
              />
              {errors.jabatan && <span className="fm-err">{errors.jabatan}</span>}
            </div>
            <div className="fm-row">
              <div className="fm-field">
                <label className="fm-label" htmlFor="st-tgl">Tanggal selesai acara</label>
                <input
                  id="st-tgl"
                  type="date"
                  className={`fm-input fm-date${errors.tgl ? ' err' : ''}`}
                  value={tgl}
                  onChange={(e) => { setTgl(e.target.value); clearErr('tgl') }}
                />
                {errors.tgl ? <span className="fm-err">{errors.tgl}</span> : <span className="fm-hint">Jadi acuan bulan di nomor sertifikat</span>}
              </div>
              <div className="fm-field">
                <label className="fm-label" htmlFor="st-jml">Jumlah nomor</label>
                <input
                  id="st-jml"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={1000}
                  className={`fm-input${errors.jumlah ? ' err' : ''}`}
                  placeholder="Contoh: 30"
                  value={jumlah}
                  onChange={(e) => { setJumlah(e.target.value.replace(/\D/g, '')); clearErr('jumlah') }}
                />
                {errors.jumlah && <span className="fm-err">{errors.jumlah}</span>}
              </div>
            </div>
            <div className="fm-field">
              <label className="fm-label" htmlFor="st-ket">Keterangan <span className="fm-opt">Opsional</span></label>
              <input
                id="st-ket"
                className="fm-input"
                placeholder="Contoh: sertifikat panitia dan tamu undangan"
                value={ket}
                onChange={(e) => setKet(e.target.value)}
              />
            </div>
          </section>

          <div className="sk-nav">
            <span />
            <button type="button" className="mf-primary" onClick={() => go(2)}>Lanjut ke daftar peserta →</button>
          </div>
        </>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <>
          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Daftar peserta per role <span className="fm-opt">Opsional</span></h3>
              <p>Isi supaya hasilnya langsung berupa tabel <b>Nama · Role · Nomor</b>. Boleh dilewati kalau sedang dikejar waktu.</p>
            </header>

            {groups.map((g, i) => {
              const count = parseNames(g.text).length
              return (
                <div className="st-group" key={i}>
                  <div className="st-group-top">
                    <input
                      className="fm-input"
                      aria-label={`Nama role ${i + 1}`}
                      placeholder="Role: Panitia, MC, Peserta…"
                      value={g.role}
                      onChange={(e) => setGroup(i, { role: e.target.value })}
                    />
                    <span className="st-count">{count} nama</span>
                    {groups.length > 1 && (
                      <button type="button" className="tj-x" aria-label={`Hapus role ${i + 1}`} onClick={() => setGroups((gs) => gs.filter((_, k) => k !== i))}>✕</button>
                    )}
                  </div>
                  <textarea
                    className="fm-input"
                    rows={5}
                    aria-label={`Daftar nama untuk role ${i + 1}`}
                    placeholder={'Satu nama per baris — bisa paste dari spreadsheet\nNisrina Zahira Widyana\nCatherine Chandra Sidharta'}
                    value={g.text}
                    onChange={(e) => setGroup(i, { text: e.target.value })}
                  />
                </div>
              )
            })}
            <button type="button" className="fm-add" onClick={() => setGroups((gs) => [...gs, { role: '', text: '' }])}>＋ Tambah role</button>

            <div className={`st-total${total === 0 ? '' : total === n ? ' ok' : ' diff'}`}>
              <span>Total nama di daftar</span>
              <strong>{total}{total > 0 && ` / ${n} nomor`}</strong>
            </div>

            {mismatch && (
              <div className="sk-alert st-mismatch" role="alert">
                <p>Daftar berisi <b>{total} nama</b>, tapi jumlah nomor di langkah 1 <b>{n}</b>. Pakai yang mana?</p>
                <div className="st-mismatch-btns">
                  <button type="button" className="mf-secondary" onClick={() => pickJumlah(total)}>{total} nomor (sesuai daftar)</button>
                  <button type="button" className="mf-secondary" onClick={() => pickJumlah(n)}>Tetap {n} nomor</button>
                </div>
              </div>
            )}
          </section>

          <div className="sk-nav">
            <button type="button" className="mf-secondary" onClick={() => go(1)}>← Kembali</button>
            <button type="button" className="mf-primary" onClick={() => go(3)}>{total ? 'Lanjut →' : 'Lewati →'}</button>
          </div>
        </>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <>
          <section className="fm-card">
            <header className="fm-card-head">
              <h3>Master desain sertifikat <span className="fm-opt">Opsional</span></h3>
              <p>Link Canva atau Google Drive. Pastikan aksesnya &ldquo;Anyone with the link&rdquo;.</p>
            </header>
            <div className="fm-field">
              <label className="fm-label sr-only" htmlFor="st-link">Link master desain</label>
              <input
                id="st-link"
                type="url"
                className={`fm-input${errors.link ? ' err' : ''}`}
                placeholder="https://canva.com/… atau https://drive.google.com/…"
                value={link}
                onChange={(e) => { setLink(e.target.value); clearErr('link') }}
              />
              {errors.link && <span className="fm-err">{errors.link}</span>}
            </div>
          </section>

          <section className="fm-card sk-rv">
            <header className="fm-card-head">
              <h3>Cek lagi sebelum dikirim</h3>
            </header>
            <dl className="sk-kv">
              <dt>Pemohon</dt><dd>{pemohonNama || '—'}</dd>
              <dt>Jabatan</dt><dd>{jabatan}</dd>
              <dt>Kegiatan</dt><dd>{kegiatan}</dd>
              <dt>Selesai acara</dt><dd>{fmtTanggal(tgl)}</dd>
              <dt>Jumlah nomor</dt><dd>{n}</dd>
              {ket.trim() && (<><dt>Keterangan</dt><dd>{ket}</dd></>)}
              <dt>Peserta</dt>
              <dd>{peserta.length ? peserta.map((g) => `${g.role || '(tanpa role)'}: ${g.namaList.length}`).join(' · ') : 'Tidak diisi'}</dd>
              <dt>Master</dt><dd>{link.trim() ? <SafeLink href={link.trim()} /> : 'Tidak diisi'}</dd>
            </dl>

            {sending && elapsed >= 4 && (
              <div className="sk-wait" role="status">
                Menyimpan request &amp; mengirim notifikasi ke sekretaris — biasanya &lt; 20 detik. Jangan tutup halaman ini. ({elapsed} dtk)
              </div>
            )}
            {sendError && <div className="sk-alert" role="alert">{sendError}</div>}
          </section>

          <input className="fm-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

          <div className="sk-nav">
            <button type="button" className="mf-secondary" onClick={() => go(2)} disabled={sending}>← Kembali</button>
            {!uncertain && (
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
