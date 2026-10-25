'use client'

import { useEffect, useState } from 'react'
import { fmtTanggal, SafeLink, useElapsed } from '@/components/surat/shared'
import { CIMD_DEPTS, STRUKTURAL_DEFAULT, deptValue } from '@/config/sertif'
import type { CimdRequest, SertifStatus } from '@/types/sertif'

type Step = 1 | 2 | 3
type Errors = Partial<Record<'dept' | 'deadline' | 'pelaksana', string>>

const PREVIEW_MAX = 5

interface CimdModalProps {
  status: SertifStatus
  onClose: () => void
}

export default function CimdModal({ status, onClose }: CimdModalProps) {
  const r = status.request
  const [step, setStep] = useState<Step>(1)
  const [dept, setDept] = useState('')
  const [tglMulai, setTglMulai] = useState('')
  const [tglSelesai, setTglSelesai] = useState('')
  const [deadline, setDeadline] = useState('')
  const [kepala, setKepala] = useState(STRUKTURAL_DEFAULT.kepalaDepart)
  const [ketuaHima, setKetuaHima] = useState(STRUKTURAL_DEFAULT.ketuaHimpunan)
  const [pelaksana, setPelaksana] = useState(`KETUA PELAKSANA ${r.namaKegiatan.toUpperCase()}\n[NAMA LENGKAP]\n[NRP]`)
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [result, setResult] = useState<{ docUrl: string; waLink: string } | null>(null)
  const elapsed = useElapsed(sending)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !sending && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, sending])

  function next() {
    const e: Errors = {}
    if (!dept) e.dept = 'Pilih departemen / biro kamu'
    if (!deadline) e.deadline = 'Isi kapan sertifikat dibutuhkan'
    if (!pelaksana.trim() || /\[(NAMA|NRP)/i.test(pelaksana)) e.pelaksana = 'Ganti [NAMA LENGKAP] dan [NRP] dengan data ketua pelaksana'
    setErrors(e)
    if (!Object.values(e).some(Boolean)) setStep(2)
  }

  async function send() {
    const data: CimdRequest = {
      kode: r.kode, dept, deadline, tglMulai, tglSelesai,
      kepalaDepart: kepala.trim(), ketuaHimpunan: ketuaHima.trim(), ketuaPelaksana: pelaksana.trim(),
    }
    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/sertif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'design', data }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.message)
      setResult({ docUrl: j.docUrl, waLink: j.waLink })
      setStep(3)
    } catch (err) {
      setSendError(err instanceof Error && err.message ? err.message : 'Koneksi terputus. Hubungi CIMD sebelum mengirim ulang.')
    } finally {
      setSending(false)
    }
  }

  const pelaksanaan = tglMulai && tglSelesai && tglMulai !== tglSelesai
    ? `${fmtTanggal(tglMulai)} – ${fmtTanggal(tglSelesai)}`
    : tglMulai ? fmtTanggal(tglMulai) : '—'
  const det = status.details

  return (
    <div className="backdrop open" onClick={(e) => e.target === e.currentTarget && !sending && onClose()}>
      <div className="modal sk-modal" role="dialog" aria-modal="true" aria-labelledby="cimd-title">
        <div className="modal-head">
          <div className="m-titles">
            <div className="m-title" id="cimd-title">{step === 3 ? 'Request terkirim' : 'Minta desain ke CIMD'}</div>
            <div className="m-tl">{r.kode} · {r.namaKegiatan}</div>
          </div>
          <button type="button" className="m-close" aria-label="Tutup" onClick={onClose} disabled={sending}>✕</button>
        </div>

        <div className="m-body sk-rv">
          {step === 1 && (
            <>
              <p className="sk-rv-text">Nama, WA, dan nomor sertifikat dari request ini otomatis ikut terkirim ke sheet CIMD.</p>

              <h4>Departemen / biro</h4>
              <div className="st-chips" role="radiogroup" aria-label="Departemen / biro">
                {CIMD_DEPTS.map((d) => {
                  const v = deptValue(d)
                  return (
                    <button
                      key={d.code}
                      type="button"
                      role="radio"
                      aria-checked={dept === v}
                      className={`st-chip${dept === v ? ' on' : ''}`}
                      onClick={() => { setDept(v); setErrors((e) => ({ ...e, dept: undefined })) }}
                    >
                      {d.label}{'sub' in d && <small>{d.sub}</small>}
                    </button>
                  )
                })}
              </div>
              {errors.dept && <span className="fm-err">{errors.dept}</span>}

              <h4>Tanggal</h4>
              <div className="fm-row">
                <div className="fm-field">
                  <label className="fm-label" htmlFor="cm-mulai">Mulai pelaksanaan</label>
                  <input id="cm-mulai" type="date" className="fm-input fm-date" value={tglMulai} onChange={(e) => setTglMulai(e.target.value)} />
                  <span className="fm-hint">Tanggal yang tertera di sertifikat</span>
                </div>
                <div className="fm-field">
                  <label className="fm-label" htmlFor="cm-selesai">Selesai <span className="fm-opt">Jika lebih dari 1 hari</span></label>
                  <input id="cm-selesai" type="date" className="fm-input fm-date" min={tglMulai || undefined} value={tglSelesai} onChange={(e) => setTglSelesai(e.target.value)} />
                </div>
              </div>
              <div className="fm-field">
                <label className="fm-label" htmlFor="cm-deadline">Sertifikat dibutuhkan paling lambat</label>
                <input
                  id="cm-deadline"
                  type="date"
                  className={`fm-input fm-date${errors.deadline ? ' err' : ''}`}
                  value={deadline}
                  onChange={(e) => { setDeadline(e.target.value); setErrors((x) => ({ ...x, deadline: undefined })) }}
                />
                {errors.deadline && <span className="fm-err">{errors.deadline}</span>}
              </div>

              <h4>Area tanda tangan</h4>
              <div className="fm-field">
                <label className="fm-label" htmlFor="cm-kepala">Kepala departemen</label>
                <textarea id="cm-kepala" rows={3} className="fm-input" value={kepala} onChange={(e) => setKepala(e.target.value)} />
              </div>
              <div className="fm-field">
                <label className="fm-label" htmlFor="cm-hima">Ketua himpunan</label>
                <textarea id="cm-hima" rows={3} className="fm-input" value={ketuaHima} onChange={(e) => setKetuaHima(e.target.value)} />
              </div>
              <div className="fm-field">
                <label className="fm-label" htmlFor="cm-pel">Ketua pelaksana</label>
                <textarea
                  id="cm-pel"
                  rows={3}
                  className={`fm-input${errors.pelaksana ? ' err' : ''}`}
                  value={pelaksana}
                  onChange={(e) => { setPelaksana(e.target.value); setErrors((x) => ({ ...x, pelaksana: undefined })) }}
                />
                {errors.pelaksana && <span className="fm-err">{errors.pelaksana}</span>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <dl className="sk-kv">
                <dt>Kegiatan</dt><dd>{r.namaKegiatan}</dd>
                <dt>Departemen</dt><dd>{dept}</dd>
                <dt>Pelaksanaan</dt><dd>{pelaksanaan}</dd>
                <dt>Deadline</dt><dd>{fmtTanggal(deadline)}</dd>
              </dl>

              <h4>Nomor sertifikat · {det.length}</h4>
              {det.length === 0 && <p className="sk-rv-text">Belum ada nomor di request ini.</p>}
              {det.length > 0 && !det.some((d) => d.nomor) && (
                <p className="sk-rv-text">Nomor belum dibuat — request tetap dikirim ke CIMD tanpa nomor.</p>
              )}
              {det.some((d) => d.nomor) && (
                <div className="sk-mini-wrap">
                  <table className="sk-mini">
                    <tbody>
                      {det.slice(0, PREVIEW_MAX).map((d, i) => (
                        <tr key={i}><td>{d.namaPeserta || `#${i + 1}`}</td><td className="st-mono">{d.nomor || '—'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {det.length > PREVIEW_MAX && <p className="fm-hint">…dan {det.length - PREVIEW_MAX} nomor lainnya</p>}

              {sending && elapsed >= 4 && (
                <div className="sk-wait" role="status">Mengisi sheet CIMD &amp; membuat dokumen ringkasan… ({elapsed} dtk)</div>
              )}
              {sendError && <div className="sk-alert" role="alert">{sendError}</div>}
            </>
          )}

          {step === 3 && result && (
            <div className="st-cimd-done">
              <div className="sk-success-icon" aria-hidden="true">✓</div>
              <p className="sk-rv-text">Data sudah masuk ke sheet CIMD dan dokumen ringkasan sudah dibuat. Konfirmasi ke CIMD lewat WhatsApp supaya segera diproses.</p>
              {result.docUrl && <SafeLink href={result.docUrl}>Buka dokumen ringkasan</SafeLink>}
            </div>
          )}
        </div>

        <div className="m-foot">
          {step === 1 && (
            <>
              <button type="button" className="mf-secondary" onClick={onClose}>Batal</button>
              <button type="button" className="mf-primary" onClick={next}>Review →</button>
            </>
          )}
          {step === 2 && (
            <>
              <button type="button" className="mf-secondary" onClick={() => setStep(1)} disabled={sending}>← Edit lagi</button>
              <button type="button" className="mf-primary" onClick={send} disabled={sending}>
                {sending ? <><span className="sk-spin" aria-hidden="true" /> Mengirim…</> : 'Kirim ke CIMD'}
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button type="button" className="mf-secondary" onClick={onClose}>Selesai</button>
              {result?.waLink && /^https:\/\/wa\.me\//.test(result.waLink) && (
                <a className="mf-wa" href={result.waLink} target="_blank" rel="noopener noreferrer">Konfirmasi ke CIMD</a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
