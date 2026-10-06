import type { KomitmenInfo, SuratFields } from '@/types/komitmen'

/** Pratinjau surat — teksnya disamakan dengan template Google Docs. */
export default function SuratPreview({ info, d }: { info: KomitmenInfo; d: SuratFields }) {
  const ttd = [d.jabatan, d.unitTtd].filter(Boolean).join(' ')
  const tgl = `${info.tempat}, ${info.tanggal}`

  return (
    <div className="km-paper-wrap">
      <article className="km-paper" aria-label="Pratinjau surat pernyataan">
        <h2>
          Surat Pernyataan Komitmen Pembayaran Iuran
          <span>Kegiatan {info.kegiatan}</span>
        </h2>
        <p>{tgl}</p>
        <p>Saya yang bertanda tangan di bawah ini:</p>
        <table className="km-paper-id">
          <tbody>
            <tr><td>Nama Lengkap</td><td>:</td><td><b>{d.nama}</b></td></tr>
            <tr><td>NRP</td><td>:</td><td><b>{d.nrp}</b></td></tr>
            <tr><td>Jabatan</td><td>:</td><td><b>{d.jabatan}</b></td></tr>
            <tr><td>Departemen/Divisi</td><td>:</td><td><b>{d.departemen}</b></td></tr>
          </tbody>
        </table>
        <p>Dengan ini menyatakan dengan sebenar-benarnya dan tanpa paksaan dari pihak mana pun bahwa:</p>
        <ol>
          <li>
            Saya bersedia mengikuti kegiatan {info.kegiatan} dan berkomitmen membayar iuran kegiatan
            sebesar <b>{info.nominal} per orang.</b>
          </li>
          <li>
            Saya akan melunasi iuran tersebut paling lambat pada {info.batas}, sesuai ketentuan dan batas
            waktu pembayaran yang ditetapkan oleh panitia.
          </li>
        </ol>
        <p>
          Demikian surat pernyataan ini saya buat dengan penuh kesadaran dan rasa tanggung jawab, untuk
          dipergunakan sebagaimana mestinya.
        </p>
        <div className="km-paper-sign">
          <p>{tgl}</p>
          <p>Menyetujui,<br />{ttd} HIMA IDE ITS 2026</p>
          <p className="km-paper-ttd">[Tanda Tangan]</p>
          <p><b><u>{d.nama}</u></b><br />NRP. {d.nrp}</p>
        </div>
      </article>
    </div>
  )
}
