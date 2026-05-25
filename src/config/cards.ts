import type { CardData } from '@/types/config'
import { links } from '@/config/links'

export const PROKER: CardData[] = [
  {
    id: 'proposal',
    emoji: '📄',
    title: 'Proposal',
    desc: 'Template, format, dan ketentuan pengajuan proposal kegiatan ke Departemen.',
    tl: 'H-60 ~ H-20',
    body: `
      <p>Fase perancangan konsep kegiatan diharapkan dapat dipersiapkan jauh hari agar konsep lebih matang dan meminimalkan keteteran karena tugas.</p>
      <h4>Timeline Proposal</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-60</div><div class="step-text">File proposal sudah dibuat</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-30</div><div class="step-text">File proposal diasistensikan ke BPH (Sekretaris)</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">3</div></div><div class="step-content"><div class="step-time">H-20</div><div class="step-text">Ajukan proposal ke Departemen</div></div></div>
      </div>
      <h4>Urutan Tanda Tangan</h4>
      <ol><li>Ketua Pelaksana</li><li>Ketua HIMA</li><li>Dosen TKK</li><li>Kepala Departemen</li></ol>
      <h4>Pengajuan ke Departemen</h4>
      <ul>
        <li>Lapor ke BPH terlebih dahulu</li>
        <li>Hubungi Tendik (Mba Faza)</li>
        <li>Pastikan tidak bentrok dengan jadwal pengajuan lain</li>
        <li>Bisa didampingi BPH (Sekretaris) jika diperlukan</li>
      </ul>`,
    btns: [
      { label: '📥 Template Proposal', cls: 'mf-primary', url: links.templateProposal || '#' },
      { label: '👁️ Contoh Proposal', cls: 'mf-secondary', url: links.contohProposal || '#' },
    ],
  },
  {
    id: 'suratkeluar',
    emoji: '📮',
    title: 'Surat Keluar',
    desc: 'Alur pengajuan surat resmi untuk undangan, keramaian, kerja sama, dan kebutuhan administrasi lainnya.',
    tl: 'H-60 ~ H-10',
    body: `
      <p>Ajukan surat keluar jika kegiatan membutuhkan surat resmi seperti undangan narasumber, surat keramaian, surat kerja sama, dll.</p>
      <p>Jika pengajuan mendadak/butuh cepat lansung hubungi Sekretaris</p>
      <h4>Alur Pengajuan</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Ajukan</div><div class="step-text">Maksimal H-10 sebelum surat dibutuhkan</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">1×24 jam</div><div class="step-text">Sekretaris memeriksa inbox & menghubungi jika diterima</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">3</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Proses</div><div class="step-text">Sekretaris memproses dan konfirmasi isi surat</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">4</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-7</div><div class="step-text">Surat diserahkan ke penandatangan</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">Selesai</div><div class="step-text">Surat siap digunakan</div></div></div>
      </div>`,
    btns: [
      { label: '📤 Ajukan Surat Keluar', cls: 'mf-primary', url: 'https://its.id/m/himaide_suratkeluar' },
      { label: '💬 WA Sekretaris', cls: 'mf-wa', url: 'https://wa.me/6281280126505' },
    ],
  },
  {
    id: 'ruang',
    emoji: '🚪',
    title: 'Peminjaman Ruang',
    desc: 'Alur dan preview formulir peminjaman ruang untuk kegiatan HIMAIDE.',
    tl: 'H-30 ~ H-10',
    body: `
      <p>Ajukan peminjaman ruang untuk kegiatan HIMAIDE maksimal H-10 sebelum ruang dibutuhkan.</p>
      <h4>Alur Peminjaman</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Pilih Ruang</div><div class="step-text">Cek ketersediaan ruang yang dibutuhkan (hubungi sekretaris)</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Isi Formulir</div><div class="step-text">Lengkapi formulir peminjaman (minta ke TU)</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">Konfirmasi</div><div class="step-text">Tunggu konfirmasi dari Sekretaris / TU</div></div></div>
      </div>`,
    btns: [
      { label: '💬 WA Sekretaris', cls: 'mf-wa', url: 'https://wa.me/6281280126505' },
    ],
  },
  {
    id: 'konsumsi',
    emoji: '🍱',
    title: 'Pengajuan Konsumsi',
    desc: 'Alur, ketentuan, dan format pengajuan konsumsi melalui myITS Food untuk kegiatan.',
    tl: 'H-30 ~ H-10',
    body: `
      <div class="warn-box"><span class="wi">⚠️</span> Pengajuan dapat diproses setelah proposal ditandatangani Kepala Departemen.</div>
      <h4>Alur Pengajuan</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Cari</div><div class="step-text">Temukan konsumsi di <b style="color:var(--txt)">myITS Food</b> (itsfood.id)</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-10</div><div class="step-text">Ajukan ke Tendik (Mba Faza) dengan format yang ditentukan</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">Selesai</div><div class="step-text">Konsumsi diproses oleh Tendik</div></div></div>
      </div>
      <h4>Ketentuan</h4>
      <ul>
        <li><b style="color:var(--txt)">Nasi:</b> individu yang mengisi kegiatan lebih dari 4 jam</li>
        <li><b style="color:var(--txt)">Snack:</b> di bawah 4 jam</li>
        <li>Opsi Minuman untuk panitia hanya bisa Air Galon</li>
      </ul>
      <h4>Patokan Dana Konsumsi</h4>
      <table class="dtable">
        <tr><th colspan="2">Mahasiswa</th><th colspan="2">Dosen / External</th></tr>
        <tr><th>Snack</th><th>Nasi</th><th>Snack</th><th>Nasi</th></tr>
        <tr><td>Rp10.000</td><td>Rp20.000</td><td>Rp15.000</td><td>Rp35.000</td></tr>
      </table>
      <div class="info-box">💧 Air galon ITS Mine: <b style="color:var(--txt)">Rp10.000 / galon</b></div>`,
    btns: [
      { label: '📋 Copy Format', cls: 'mf-secondary', copy: 'Section 1 - Peserta dan Panitia\n- Menu : nama menu (link)\n- Jumlah : ... porsi (... peserta + ... panitia)\n- Tanggal : .., 0 Agustus 2026\n- Jam : 00.00\n- Lokasi : Gedung Desain Produk, Depan R.000\n- Nama kegiatan : ...\n- CP : ... (628...)\n\nSection 2 (opsional) - Pemateri (Mahasiswa/Dosen/External)\n- Menu : nama menu (link)\n- Jumlah : ... porsi\n- Tanggal : .., 0 Agustus 2026\n- Jam : 00.00\n- Lokasi : Gedung Desain Produk, Depan R.000\n- Nama kegiatan : ...\n- CP : ... (628...)' },
    ],
  },
  {
    id: 'merch',
    emoji: '👕',
    title: 'Pengajuan Merch / Souvenir',
    desc: 'Alur, ketentuan, dan format pengajuan merchandise dari katalog myITS Merch.',
    tl: 'H-30 ~ H-10',
    body: `
      <div class="warn-box"><span class="wi">⚠️</span> Ajukan jauh hari — beberapa item memerlukan waktu produksi. Diproses setelah proposal ditandatangani Kepala Departemen.</div>
      <h4>Alur Pengajuan</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Cari</div><div class="step-text">Pilih merch di myITS Merch atau kunjungi lokasi langsung</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-10</div><div class="step-text">Ajukan ke Tendik (Mba Faza) dengan format pengajuan</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">Selesai</div><div class="step-text">Merch diproses oleh Tendik</div></div></div>
      </div>`,
    btns: [
      { label: '📦 Katalog Merch', cls: 'mf-primary', url: 'https://www.its.ac.id/dkpu/wp-content/uploads/sites/82/2025/08/katalog-update-merchandise-flatener-resize.pdf' },
      { label: '📍 Lokasi Merch', cls: 'mf-secondary', url: 'https://share.google/Ey4GdZW46BufUC5ey' },
      { label: '📋 Copy Format', cls: 'mf-secondary', copy: 'Detail Merch / Souvenir\n- Nama kegiatan : ...\n- Jenis pengajuan : Merch/Souvenir\n- Item : nama item merch/souvenir\n- Referensi item : link myITS Merch / katalog / foto referensi\n- Jumlah : ... pcs\n- Varian/ukuran (jika ada) : ...\n- Deadline diterima : ..., ... Agustus 2026\n- CP : Nama — 628...' },
    ],
  },
  {
    id: 'sertifikat',
    emoji: '🏅',
    title: 'Sertifikat Kegiatan',
    desc: 'Alur pengajuan nomor sertifikat dan request desain ke Sekretaris atau CIMD.',
    tl: 'H-30 ~ H-10',
    body: `
      <p>Request nomor sertifikat ke Sekretaris. Setelah nomor tersedia, sertifikat dapat didesain sendiri atau direquest ke Sekretaris.</p>
      <h4>Timeline</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-10</div><div class="step-text">Ajukan request nomor sertifikat ke Sekretaris</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Konfirmasi</div><div class="step-text">Sekretaris menghubungi jika nomor selesai</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">3</div></div><div class="step-content"><div class="step-time">H-7</div><div class="step-text">Request desain sertifikat (jika minta didesainkan)</div></div></div>
      </div>
      <div class="info-box">Desain dapat diajukan ke CIMD langsung dari halaman sertifikat, atau kamu juga bisa mendesain sendiri.</div>`,
    btns: [
      { label: '📨 Req No. Sertifikat', cls: 'mf-primary', url: 'https://its.id/m/himaide_sertif' },
    ],
  },
  {
    id: 'dana',
    emoji: '💰',
    title: 'Pengajuan Dana',
    desc: 'Alur pengajuan dana kegiatan ke Departemen beserta ketentuan dokumen pendukung.',
    tl: 'H-60 ~ H-30',
    body: `
      <p>Dana kegiatan diajukan melalui Bendahara HIMAIDE bersama dengan pengajuan proposal.</p>
      <h4>Alur Pengajuan</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-60</div><div class="step-text">Buat Rancangan Anggaran Biaya (RAB)</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H-30</div><div class="step-text">Asistensi RAB ke BPH (Bendahara)</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">Selesai</div><div class="step-text">Ajukan bersama proposal ke Departemen</div></div></div>
      </div>
      <div class="warn-box"><span class="wi">⚠️</span> Pastikan RAB sesuai format yang ditetapkan Departemen.</div>`,
    btns: [
      { label: '💬 Hubungi Bendahara', cls: 'mf-wa', url: 'https://wa.me/6208977406276' },
    ],
  },
  {
    id: 'requestdesign',
    emoji: '🎨',
    title: 'Request Desain',
    desc: 'Ajukan desain/video yang dibutuhkan pada proker mu ke Dept.CIMD',
    tl: 'Sesuai Kebutuhan',
    body: `
      <p>Ajukan desain/video yang dibutuhkan sesuai kebutuhan administrasi kegiatan melalui link pengajuan CIMD yang tersedia. </p>
      <p>Klik Button di bawah tuk akses SOP, File Brief, Sheet Form Request, dan CP Konten</p>
      <h4>Alur Request</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-text">Baca SOP Request CIMD</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-text">Pilih Request Content</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">3</div><div class="step-line"></div></div><div class="step-content"><div class="step-text">'Make a copy' dan isi file Brief Content</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">4</div><div class="step-line"></div></div><div class="step-content"><div class="step-text">Masukan detail request ke Sheet 'Form Request'</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">5</div></div><div class="step-content"><div class="step-text">Jika sudah mengisi WAJIB KONFIRMASI ke Head of Dept. CIMD</div></div></div>
      </div>`,
    btns: [
      { label: '📸 Ajukan Desain', cls: 'mf-primary', url: links.ajukanDesain || '#' },
      { label: '💬 Hubungi Head of CIMD', cls: 'mf-wa', url: 'https://wa.me/628115137007' },
    ],
  },
  {
    id: 'lpj',
    emoji: '📊',
    title: 'LPJ & SPJ',
    desc: 'Format, ketentuan, dan timeline pengumpulan Laporan Pertanggungjawaban dan Surat Pertanggungjawaban.',
    tl: 'H+3 ~ H+6',
    body: `
      <h4>Timeline LPJ & SPJ</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H+3</div><div class="step-text">Kumpulkan seluruh nota dan bukti pengeluaran</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H+3</div><div class="step-text">Serahkan ke Bendahara HIMAIDE</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">3</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">H+5</div><div class="step-text">Asistensi LPJ & SPJ ke BPH</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">H+6</div><div class="step-text">Serahkan ke Departemen bersama BPH (Bendahara)</div></div></div>
      </div>
      <div class="warn-box"><span class="wi">⚠️</span> Perhatikan ketentuan nota pada template SPJ, format tabel SPJ dan LPJ, dan pastikan seluruh format sesuai. Laporkan LPJ & SPJ bersama BPH (Bendahara).</div>`,
    btns: [
      { label: '📥 Template LPJ', cls: 'mf-primary', url: links.templateLPJ || '#' },
      { label: '📥 Template SPJ', cls: 'mf-secondary', url: links.templateSPJ || '#' },
      { label: '👁️ Contoh LPJ', cls: 'mf-secondary', url: links.contohLPJ || '#' },
      { label: '👁️ Contoh SPJ', cls: 'mf-secondary', url: links.contohSPJ || '#' },
    ],
  },
]

export const FUNGSIO: CardData[] = [
  {
    id: 'suratmasuk',
    emoji: '📬',
    title: 'Surat Masuk',
    desc: 'Jalur penerimaan surat masuk secara online maupun offline melalui Sekretaris.',
    tl: 'Secepatnya',
    body: `
      <h4>Jalur Penerimaan</h4>
      <div class="info-box">📧 <b style="color:var(--txt)">Online:</b> Email ke desprohimaide@gmail.com atau hubungi Sekretaris langsung.</div>
      <div class="info-box">🤝 <b style="color:var(--txt)">Offline:</b> Serahkan ke Sekretaris yang sudah dihubungi sebelumnya.</div>
      <div class="warn-box"><span class="wi">⚠️</span> Surat masuk <b style="color:#fbbf24">segera disampaikan ke BPH / GA</b> melalui Sekretaris. Cantumkan nama, paraf, dan tanggal pada bagian belakang surat.</div>`,
    btns: [
      { label: '💬 WA Sekretaris 1', cls: 'mf-wa', url: 'https://wa.me/6281280126505' },
      { label: '💬 WA Sekretaris 2', cls: 'mf-wa', url: 'https://wa.me/6282262626393' },
    ],
  },
  {
    id: 'suratkeluarf',
    emoji: '📮',
    title: 'Surat Keluar',
    desc: 'Ajukan surat keluar sesuai kebutuhan administrasi kegiatan melalui link pengajuan resmi.',
    tl: 'Sesuai Kebutuhan',
    body: `<p>Ajukan surat keluar sesuai kebutuhan administrasi kegiatan melalui link pengajuan resmi yang tersedia.</p>`,
    btns: [
      { label: '📤 Ajukan Surat Keluar', cls: 'mf-primary', url: 'https://its.id/m/himaide_suratkeluar' },
    ],
  },
  {
    id: 'Notulensi',
    emoji: '📝',
    title: 'Notulensi Meeting (MoM)',
    desc: 'Akses template dan arsip notulensi.',
    tl: 'Sesuai Kebutuhan',
    body: `<p>MoM (Minutes of Meeting) Center. Buat notulensi meeting dengan mudah atau akses kembali arsip notulensi sebelumnya.</p>`,
    btns: [
      { label: '📝 Lihat/Buat Notulensi', cls: 'mf-primary', url: 'https://its.id/m/himaide_notula' },
    ],
  },
  {
    id: 'zoom',
    emoji: '🎥',
    title: 'Zoom HIMAIDE',
    desc: 'Booking akun Zoom — kapasitas 300 peserta, gratis, untuk kegiatan internal dan Despro ITS.',
    tl: 'Min. H-3',
    body: `
      <div class="info-box">1 akun · Maksimal <b style="color:var(--txt)">300 peserta</b> · <b style="color:var(--txt)">GRATIS</b></div>
      <h4>Ketentuan</h4>
      <ul>
        <li>Cek jadwal terlebih dahulu sebelum booking</li>
        <li>Hanya untuk kegiatan HIMAIDE & Despro ITS</li>
        <li>Ajukan minimal H-3 sebelum acara</li>
      </ul>
      <h4>Prioritas Penggunaan</h4>
      <ol><li>Fungsio HIMAIDE</li><li>Anggota HIMAIDE (Warga)</li></ol>
      <div class="warn-box"><span class="wi">🚪</span> Pastikan logout dari akun setelah selesai digunakan.</div>`,
    btns: [
      { label: '📅 Booking Zoom', cls: 'mf-primary', url: 'https://its.id/m/himaide_zoom' },
    ],
  },
  {
    id: 'sekretariat',
    emoji: '🏠',
    title: 'Ruang Sekretariat',
    desc: 'Ketentuan penggunaan ruang sekretariat HIMAIDE beserta SOP setelah penggunaan.',
    tl: 'Konfirmasi ke Sekretaris',
    body: `
      <h4>Ketentuan Penggunaan</h4>
      <ul>
        <li>Dikunci 24 jam jika tidak dipakai</li>
        <li>Konfirmasi ke Sekretaris sebelum penggunaan</li>
        <li>Lepas sepatu sebelum masuk</li>
        <li>Jaga kebersihan ruangan</li>
        <li>Dilarang merokok di dalam ruangan</li>
      </ul>
      <h4>Setelah Selesai Digunakan</h4>
      <ul>
        <li>Kunci ruangan</li>
        <li>Matikan lampu</li>
        <li>Matikan AC</li>
      </ul>
      <div class="warn-box"><span class="wi">📹</span> CCTV aktif 24 jam.</div>`,
    btns: [],
  },
  {
    id: 'ruangdept',
    emoji: '🏢',
    title: 'Peminjaman Ruang Departemen',
    desc: 'Alur peminjaman ruang Departemen Desain Produk ITS melalui TU Despro.',
    tl: 'Sesuai Kebutuhan',
    body: `
      <h4>Alur Peminjaman</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Hubungi</div><div class="step-text">Hubungi TU Despro ITS</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Isi Formulir</div><div class="step-text">Lengkapi formulir peminjaman yang tersedia</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">Persetujuan</div><div class="step-text">Tunggu konfirmasi persetujuan dari TU Despro</div></div></div>
      </div>`,
    btns: [
      { label: '📋 Preview Formulir', cls: 'mf-primary', url: links.previewFormPeminjamanRuangDepartemen || '#' },
    ],
  },
  {
    id: 'saku',
    emoji: '💳',
    title: 'Dana Kas & SAKU IDE',
    desc: 'Informasi peminjaman kas HIMA dan iuran anggota SAKU IDE beserta ketentuan denda.',
    tl: 'Batas SAKU: Nov 2025',
    body: `
      <h4>Peminjaman Dana Kas</h4>
      <div class="steps">
        <div class="step"><div class="step-left"><div class="step-dot">1</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Hubungi</div><div class="step-text">Hubungi Bendahara HIMAIDE</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">2</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Tgl 28</div><div class="step-text">Isi surat peminjaman</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">3</div><div class="step-line"></div></div><div class="step-content"><div class="step-time">Tgl 5</div><div class="step-text">Dana cair</div></div></div>
        <div class="step"><div class="step-left"><div class="step-dot">✓</div></div><div class="step-content"><div class="step-time">Kembalikan</div><div class="step-text">Kembalikan setelah dana Departemen cair</div></div></div>
      </div>
      <div class="warn-box"><span class="wi">⚠️</span> Denda keterlambatan: <b style="color:#fbbf24">Rp20.000 / minggu</b></div>
      <h4>SAKU IDE (Iuran Anggota)</h4>
      <ul>
        <li>Wajib <b style="color:var(--txt)">Rp85.000</b> per anggota per periode</li>
        <li>Bisa dicicil sesuai kemampuan</li>
        <li>Batas pembayaran: <b style="color:var(--txt)">November 2026</b></li>
        <li>Pembayaran hanya melalui transfer</li>
        <li>Jika keberatan: hubungi Bendahara atau Kahima</li>
      </ul>`,
    btns: [
      { label: '💬 Hubungi Bendahara', cls: 'mf-wa', url: 'https://wa.me/6208977406276' },
      { label: '💳 Bayar Sekarang', cls: 'mf-primary', url: links.bayarKas || '#' },
    ],
  },
  {
    id: 'kontak',
    emoji: '📞',
    title: 'Kontak Pengurus',
    desc: 'Daftar kontak BPH dan pengurus HIMAIDE yang dapat dihubungi untuk kebutuhan administrasi.',
    tl: 'Kapan saja',
    body: `
      <h4>Sekretariat</h4>
      <div class="info-box">📧 Email resmi: <b style="color:var(--txt)">desprohimaide@gmail.com</b></div>
      <h4>Bendahara</h4>
      <div class="kontak">
        <div class="k-av">GR</div>
        <div><div class="k-name">Ghania Raisa Permatasari</div><div class="k-wa">Bendahara 1 · 08977406276</div></div>
      </div>
      <div class="kontak">
        <div class="k-av">AK</div>
        <div><div class="k-name">Aliya Khairunnisa</div><div class="k-wa">Bendahara 2 · 087820060405</div></div>
      </div>
      <div class="warn-box"><span class="wi">💡</span> Untuk keperluan mendesak di luar jam aktif, hubungi via WhatsApp. Respons maksimal <b style="color:#fbbf24">1×24 jam</b>.</div>`,
    btns: [
      { label: '💬 WA Bendahara 1', cls: 'mf-wa', url: 'https://wa.me/6208977406276' },
      { label: '💬 WA Bendahara 2', cls: 'mf-wa', url: 'https://wa.me/62087820060405' },
    ],
  },
]

export const ALL_CARDS: CardData[] = [...PROKER, ...FUNGSIO]

export const SHORTCUTS = [
  { emoji: '📄', label: 'Proposal', id: 'proposal' },
  { emoji: '📊', label: 'LPJ & SPJ', id: 'lpj' },
  { emoji: '🏅', label: 'Sertifikat', id: 'sertifikat' },
  { emoji: '📮', label: 'Surat Keluar', id: 'suratkeluar' },
  { emoji: '📝', label: 'Notulensi', id: 'Notulensi' },
]
