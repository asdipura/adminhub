'use client'

import { useEffect } from 'react'
import type { PemohonState } from '@/components/forms/PemohonFields'
import type { SuratKeluarRequest } from '@/types/surat'
import { fmtTanggal, MiniTable, SafeLink } from './shared'

interface ReviewModalProps {
  data: SuratKeluarRequest
  pemohon: PemohonState
  sending: boolean
  error: string
  onClose: () => void
  onSubmit: () => void
}

export default function ReviewModal({ data, pemohon, sending, error, onClose, onSubmit }: ReviewModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isFungsio = pemohon.tipe === 'fungsio'

  return (
    <div className="backdrop open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal sk-modal" role="dialog" aria-modal="true" aria-labelledby="rv-title">
        <div className="modal-head">
          <div className="m-titles">
            <div className="m-title" id="rv-title">Review request surat</div>
            <div className="m-tl">Cek lagi sebelum dikirim</div>
          </div>
          <button type="button" className="m-close" aria-label="Tutup" onClick={onClose}>✕</button>
        </div>

        <div className="m-body sk-rv">
          <div className="sk-rv-perihal">{data.perihal}</div>
          <dl className="sk-kv">
            <dt>Pemohon</dt>
            <dd>{isFungsio ? pemohon.fungsioNama : pemohon.nama}</dd>
            <dt>{isFungsio ? 'Jabatan' : 'NRP'}</dt>
            <dd>{isFungsio ? pemohon.fungsioJabatan : pemohon.nrp}</dd>
            <dt>WhatsApp</dt>
            <dd>{isFungsio ? `${pemohon.fungsioWA} (terdaftar)` : pemohon.noWA}</dd>
            <dt>Dibutuhkan</dt>
            <dd>{fmtTanggal(data.tanggalDibutuhkan)}</dd>
          </dl>

          <h4>Tujuan</h4>
          {data.tujuan.type === 'tabel'
            ? <MiniTable headers={data.tujuan.data.headers} rows={data.tujuan.data.rows} />
            : <SafeLink href={data.tujuan.url} />}

          <h4>Keperluan</h4>
          <p className="sk-rv-text">{data.konteks}</p>

          {data.penandatangan.length > 0 && (
            <>
              <h4>Penandatangan</h4>
              <MiniTable headers={['Jabatan', 'Nama', 'NRP/NIP']} rows={data.penandatangan.map((p) => [p.jabatan, p.nama, p.nrp])} />
            </>
          )}

          {data.lampiran.length > 0 && (
            <>
              <h4>Lampiran</h4>
              {data.lampiran.map((l, i) => <div key={i}><SafeLink href={l} /></div>)}
            </>
          )}

          {error && <div className="sk-alert" role="alert">{error}</div>}
        </div>

        <div className="m-foot">
          <button type="button" className="mf-secondary" onClick={onClose} disabled={sending}>← Edit lagi</button>
          <button type="button" className="mf-primary" onClick={onSubmit} disabled={sending}>
            {sending ? <><span className="sk-spin" aria-hidden="true" /> Mengirim…</> : 'Kirim request'}
          </button>
        </div>
      </div>
    </div>
  )
}
