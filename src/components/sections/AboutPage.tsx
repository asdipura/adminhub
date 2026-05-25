'use client'

interface AboutPageProps {
  onNavigate: (page: 'home' | 'kontak') => void
}

const LOGO_FOR_LAMBANG = (
  <svg
    viewBox="0 0 2667 2014"
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    role="img"
    aria-label="Logo HIMA IDE"
  >
    <rect x="0" y="0" width="2666.67" height="2013.68" fill="none" />
    <g fill="#111">
      <path d="M163.947,1152.14c0,0-12.166-252.07 927.673-274.383c822.246-19.52 1411.11,287.448 1411.11,287.448c0,0-624.88-130.658-1110.6-130.658c-485.714,0-681.976,94.483-901.541,182.922c0,0-122.736,65.329-182.921,65.329c-60.186,0-143.724-28.608-143.724-130.658Z" />
      <path d="M1280.69,668.708c0,0 152.906,8.125 490.351-91.46c337.446-99.585 391.975-130.658 391.975-130.658c0,0-449.538,365.842-1123.66,365.842c-674.123,0-614.093-209.053-614.093-209.053c0,0 2.739-105.297 117.592-117.592c114.854-12.295 356.756,182.921 737.836,182.921Z" />
      <path d="M738.843,342.063c0,0 9.122-117.592 117.592-117.592c108.47,0 225.099,169.855 483.435,169.855c258.337,0 483.435-195.987 483.435-195.987c0,0-272.871,352.777-627.159,352.777c-354.288,0-468.712-133.45-457.303-209.053Z" />
      <rect x="1280.69" y="1348.13" width="98.376" height="457.304" />
      <path d="M1832.83,1769.78c-39.363,28.653-87.812,45.563-140.179,45.563c-131.662,0-238.555-106.893-238.555-238.555c0-131.663 106.893-238.556 238.555-238.556c52.367,0 100.816,16.91 140.179,45.563l0-180.594l98.377,0l0,602.239l-98.377,0l0-35.66Zm-140.179-329.447c-75.311,0-136.455,61.143-136.455,136.455c0,75.311 61.144,136.455 136.455,136.455c75.312,0 136.455-61.144 136.455-136.455c0-75.312-61.143-136.455-136.455-136.455Z" />
      <path d="M2110.11,1625.97c19.754,51.035 69.332,87.267 127.306,87.267c44.44,0 83.948-21.291 108.869-54.22l115.11,0c-33.533,91.196-121.211,156.32-223.979,156.32c-131.663,0-238.556-106.893-238.556-238.555c0-131.663 106.893-238.556 238.556-238.556c131.662,0 238.555,106.893 238.555,238.556c0,16.859-1.753,33.313-5.086,49.188l-360.775,0Zm254.612-98.376c-19.755-51.036-69.333-87.267-127.306-87.267c-57.974,0-107.552,36.231-127.306,87.267l254.612,0Z" />
      <rect x="1280.69" y="1203.2" width="98.376" height="104.527" />
    </g>
  </svg>
)

export default function AboutPage({ onNavigate }: AboutPageProps) {
  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div id="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-bg"></div>
        <div className="about-hero-grid"></div>
        <div className="about-hero-vignette"></div>
        <div className="about-hero-content">
          <div className="about-hero-eyebrow">HIMAIDE ITS &middot; Kabinet Evagranada 2026</div>
          <h1>HIMAIDE ITS</h1>
          <p className="about-hero-sub">
            Himpunan Mahasiswa IDE Jurusan Desain Produk Industri,<br />
            Institut Teknologi Sepuluh Nopember
          </p>
          <p className="about-hero-desc">
            Ruang bagi mahasiswa untuk belajar, berkarya, berinovasi, berorganisasi, serta menyalurkan aspirasi warga &mdash; berlandaskan semangat kekeluargaan dan integritas keprofesian.
          </p>
          <div className="about-hero-cta">
            <a
              href="#about-tentang"
              className="about-cta-primary"
              onClick={(e) => { e.preventDefault(); scrollTo('about-tentang') }}
            >
              Jelajahi HIMAIDE &darr;
            </a>
            <a
              href="#about-struktur"
              className="about-cta-secondary"
              onClick={(e) => { e.preventDefault(); scrollTo('about-struktur') }}
            >
              Lihat Struktur Organisasi
            </a>
          </div>
        </div>
      </section>

      {/* About Body */}
      <div className="about-body">

        {/* 1. Nama & Identitas */}
        <div className="ab-section" id="about-tentang">
          <div className="ab-eyebrow">Identitas Organisasi</div>
          <h2>Nama Organisasi</h2>
          <div className="ab-name-card">
            <p>
              Organisasi ini bernama{' '}
              <strong style={{ color: '#e8edf8' }}>
                Himpunan Mahasiswa IDE Jurusan Desain Produk Industri, Fakultas Desain Kreatif dan Bisnis Digital, Institut Teknologi Sepuluh Nopember
              </strong>
              , yang selanjutnya disebut{' '}
              <strong style={{ color: '#e8edf8' }}>HIMAIDE ITS</strong>.
            </p>
          </div>
        </div>

        <div className="ab-divider"></div>

        {/* 2. Tentang */}
        <div className="ab-section">
          <div className="ab-eyebrow">Tentang Kami</div>
          <h2>Tentang HIMAIDE</h2>
          <p>HIMAIDE ITS adalah organisasi kemahasiswaan Desain Produk Industri ITS yang dibentuk dengan semangat kekeluargaan, aspirasi mahasiswa jurusan, serta komitmen untuk membangun kehidupan organisasi yang mapan.</p>
          <p>Dalam perjalanannya, HIMAIDE ITS menjadi wadah bagi mahasiswa Desain Produk Industri ITS untuk mengembangkan diri, menjalankan kegiatan kemahasiswaan, membangun budaya keprofesian, serta berkontribusi dalam perkembangan industri kreatif di Indonesia.</p>
        </div>

        <div className="ab-divider"></div>

        {/* 3. Dasar Pembentukan */}
        <div className="ab-section">
          <div className="ab-eyebrow">Dasar Pembentukan</div>
          <h2>Mengapa HIMAIDE Ada?</h2>
          <p>Demi terwujudnya cita-cita bangsa dan negara, generasi muda berkewajiban meneruskan perjuangan bangsa Indonesia. Sebagai mahasiswa Desain Produk Industri ITS &mdash; bagian dari Keluarga Mahasiswa ITS &mdash; kami memiliki peranan dalam mengembangkan potensi diri agar dapat memberikan Dharma Bakti terbaik kepada almamater, masyarakat, bangsa, dan negara dengan menjunjung tinggi nilai-nilai Tri Dharma perguruan tinggi.</p>
          <p>Sadar akan peran dan fungsi tersebut, mahasiswa Desain Produk Industri ITS bertekad untuk belajar, berkarya, berinovasi serta berjuang berlandaskan wawasan almamater dan integritas keprofesian.</p>
          <p>Berkat rahmat Tuhan Yang Maha Esa dan tetap menjunjung tinggi aspirasi mahasiswa jurusan serta semangat kekeluargaan, maka dibentuklah organisasi kemahasiswaan di jurusan Desain Produk Industri ITS yang bertekad untuk mencapai suatu tatanan perikehidupan organisasi yang mapan.</p>
        </div>

        <div className="ab-divider"></div>

        {/* 4. Kedudukan */}
        <div className="ab-section">
          <div className="ab-eyebrow">Tempat &amp; Kedudukan</div>
          <h2>Kedudukan HIMAIDE</h2>
          <ul className="ab-kedudukan-list">
            <li>
              <span className="ab-check">📍</span>
              <span>HIMAIDE ITS bertempat di <strong style={{ color: '#e8edf8' }}>Gedung Desain Produk, Jalan Despro, Kampus ITS Sukolilo, Surabaya</strong>.</span>
            </li>
            <li>
              <span className="ab-check">🏛️</span>
              <span>HIMAIDE ITS secara struktural berkedudukan di bawah <strong style={{ color: '#e8edf8' }}>BEM Fakultas Desain Kreatif dan Bisnis Digital (BEM-FDKBD)</strong> dan di bawah <strong style={{ color: '#e8edf8' }}>Badan Eksekutif Mahasiswa ITS (BEM ITS)</strong>.</span>
            </li>
          </ul>
        </div>

        <div className="ab-divider"></div>

        {/* 5. Asas & Sifat */}
        <div className="ab-section">
          <div className="ab-eyebrow">Asas &amp; Sifat</div>
          <h2>Landasan Organisasi</h2>
          <div className="ab-two-col">
            <div className="ab-pill-card">
              <div className="apc-label">Asas</div>
              <div className="apc-val">HIMAIDE ITS berasaskan <strong style={{ color: '#e8edf8' }}>Pancasila</strong></div>
            </div>
            <div className="ab-pill-card">
              <div className="apc-label">Sifat</div>
              <div className="apc-val">HIMAIDE ITS bersifat <strong style={{ color: '#e8edf8' }}>mandiri dan independen</strong></div>
            </div>
          </div>
        </div>

        <div className="ab-divider"></div>

        {/* 6. Visi */}
        <div className="ab-section">
          <div className="ab-eyebrow">Visi</div>
          <h2>Visi HIMAIDE</h2>
          <div className="ab-visi-block">
            <p>Himpunan Mahasiswa IDE - ITS sebagai pusat aspirasi mahasiswa jurusan yang menjunjung tinggi semangat kekeluargaan dalam mencapai suatu tatanan perikehidupan organisasi yang mapan, bertekad mengembangkan potensi mahasiswa Desain Produk Industri ITS yang kreatif dan inovatif dalam memberikan Dharma Bakti terbaik sesuai dengan integritas keprofesian serta berperan positif dalam perkembangan Industri Kreatif di Indonesia.</p>
          </div>
        </div>

        <div className="ab-divider"></div>

        {/* 7. Misi */}
        <div className="ab-section">
          <div className="ab-eyebrow">Misi</div>
          <h2>Misi HIMAIDE</h2>
          <ul className="ab-misi-list">
            <li><span className="ab-misi-num">1</span><span>Membina kekeluargaan dan kebersamaan antar mahasiswa Desain Produk Industri ITS berlandaskan asas keterbukaan dan saling menghargai.</span></li>
            <li><span className="ab-misi-num">2</span><span>Mewadahi dan menyalurkan aspirasi mahasiswa jurusan dalam mewujudkan interaksi yang dinamis.</span></li>
            <li><span className="ab-misi-num">3</span><span>Mengembangkan potensi mahasiswa Desain Produk Industri ITS dalam hal kreativitas, keilmuan, dan kebudayaan.</span></li>
            <li><span className="ab-misi-num">4</span><span>Menanamkan serta mengembangkan sikap kepemimpinan dan keorganisasian mahasiswa Desain Produk Industri ITS.</span></li>
            <li><span className="ab-misi-num">5</span><span>Menumbuhkan iklim kreatif di lingkungan HIMAIDE ITS untuk meningkatkan daya saing keprofesian.</span></li>
            <li><span className="ab-misi-num">6</span><span>Membina hubungan dan kerjasama yang baik dengan berbagai pihak untuk mengembangkan industri kreatif di Indonesia.</span></li>
          </ul>
        </div>

        <div className="ab-divider"></div>

        {/* 8. Nilai Utama */}
        <div className="ab-section">
          <div className="ab-eyebrow">Nilai Utama</div>
          <h2>Nilai yang Kami Bawa</h2>
          <div className="ab-nilai-grid">
            <div className="ab-nilai-card">
              <div className="ab-nilai-icon">🤝</div>
              <div className="ab-nilai-title">Kekeluargaan</div>
              <div className="ab-nilai-desc">HIMAIDE ITS menjunjung tinggi semangat kekeluargaan sebagai fondasi dalam membangun hubungan antarwarga, pengurus, dan elemen organisasi.</div>
            </div>
            <div className="ab-nilai-card">
              <div className="ab-nilai-icon">💬</div>
              <div className="ab-nilai-title">Aspirasi</div>
              <div className="ab-nilai-desc">HIMAIDE ITS hadir sebagai pusat aspirasi mahasiswa jurusan, tempat warga dapat menyampaikan suara, keresahan, masukan, dan gagasan.</div>
            </div>
            <div className="ab-nilai-card">
              <div className="ab-nilai-icon">💡</div>
              <div className="ab-nilai-title">Kreativitas &amp; Inovasi</div>
              <div className="ab-nilai-desc">Sebagai organisasi mahasiswa Desain Produk Industri, HIMAIDE ITS mendorong tumbuhnya kreativitas, kemampuan berpikir inovatif, dan daya saing keprofesian.</div>
            </div>
            <div className="ab-nilai-card">
              <div className="ab-nilai-icon">⚖️</div>
              <div className="ab-nilai-title">Integritas Keprofesian</div>
              <div className="ab-nilai-desc">HIMAIDE ITS berlandaskan wawasan almamater dan integritas keprofesian dalam setiap proses belajar, berkarya, berorganisasi, dan berkontribusi.</div>
            </div>
            <div className="ab-nilai-card">
              <div className="ab-nilai-icon">🌿</div>
              <div className="ab-nilai-title">Keterbukaan &amp; Saling Menghargai</div>
              <div className="ab-nilai-desc">HIMAIDE ITS membina kebersamaan antar mahasiswa dengan asas keterbukaan dan saling menghargai.</div>
            </div>
          </div>
        </div>

        <div className="ab-divider"></div>

        {/* 9. Keanggotaan */}
        <div className="ab-section">
          <div className="ab-eyebrow">Keanggotaan</div>
          <h2>Warga HIMAIDE</h2>
          <ul className="ab-keanggotaan-list">
            <li><span className="ab-check">→</span><span>Mahasiswa yang dapat menjadi anggota HIMAIDE ITS adalah mahasiswa yang terdaftar pada jurusan Desain Produk Industri ITS program S1.</span></li>
            <li><span className="ab-check">→</span><span>Keanggotaan HIMAIDE ITS bersifat <strong style={{ color: '#e8edf8' }}>terbuka</strong>.</span></li>
            <li><span className="ab-check">→</span><span>Anggota HIMAIDE ITS disebut <strong style={{ color: '#e8edf8' }}>warga</strong>.</span></li>
          </ul>
          <h3 style={{ marginTop: '28px' }}>Status Keanggotaan</h3>
          <div className="ab-name-card">
            <p>Warga HIMAIDE ITS adalah mahasiswa S1 Jurusan Desain Produk Industri ITS yang telah menyelesaikan proses <strong style={{ color: '#e8edf8' }}>Pengkaderan Massal Terbatas</strong> di HIMAIDE ITS.</p>
          </div>

          {/* Hak & Kewajiban */}
          <div className="ab-hakwajib-grid" style={{ marginTop: '28px' }}>
            <div className="ab-hakwajib-box">
              <h3>Hak Warga</h3>
              <ol>
                <li>Setiap warga memiliki hak untuk berbicara dan mengeluarkan pendapat.</li>
                <li>Berhak mengikuti pelatihan, kegiatan umum, kepanitiaan, dan menjadi staf HIMAIDE ITS.</li>
                <li>Berhak untuk memilih dan dipilih.</li>
              </ol>
            </div>
            <div className="ab-hakwajib-box">
              <h3>Kewajiban Warga</h3>
              <ol>
                <li>Berkewajiban menjunjung tinggi dan menaati AD/ART serta peraturan yang berlaku di HIMAIDE ITS.</li>
                <li>Wajib menjaga dan memelihara nama baik HIMAIDE ITS.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="ab-divider"></div>

        {/* 10. Struktur Organisasi */}
        <div className="ab-section" id="about-struktur">
          <div className="ab-eyebrow">Struktur Organisasi</div>
          <h2>Bagaimana HIMAIDE Berjalan?</h2>
          <p>Kekuasaan tertinggi berada di tangan Anggota HIMAIDE ITS melalui <strong style={{ color: '#e8edf8' }}>Rapat Umum Mahasiswa Jurusan (RUMJ)</strong> atau <strong style={{ color: '#e8edf8' }}>Rapat Istimewa Mahasiswa Jurusan (RIMJ)</strong> Desain Produk Industri ITS.</p>
          <p>Badan-badan HIMAIDE ITS terdiri dari <strong style={{ color: '#e8edf8' }}>Dewan Perwakilan Warga (DPW)</strong> dan <strong style={{ color: '#e8edf8' }}>Fungsionaris HIMAIDE ITS</strong>.</p>

          <div className="ab-org-flow">
            <div className="ab-org-node">
              <div className="ab-org-left">
                <div className="ab-org-dot">👥</div>
                <div className="ab-org-line"></div>
              </div>
              <div className="ab-org-content">
                <div className="ab-org-title">RUMJ &amp; RIMJ — Forum Kekuasaan Tertinggi</div>
                <div className="ab-org-desc">RUMJ merupakan kekuasaan tertinggi warga HIMAIDE ITS. RIMJ diselenggarakan apabila terjadi hal-hal yang insidental, dan mengeluarkan putusan berupa keputusan, ketetapan, atau rekomendasi.</div>
              </div>
            </div>
            <div className="ab-org-node">
              <div className="ab-org-left">
                <div className="ab-org-dot">🏛️</div>
                <div className="ab-org-line"></div>
              </div>
              <div className="ab-org-content">
                <div className="ab-org-title">Dewan Perwakilan Warga (DPW) — Lembaga Legislatif</div>
                <div className="ab-org-desc">DPW adalah lembaga legislatif yang terdiri atas perwakilan tiap angkatan. Bertugas sebagai fungsi kontrol, menampung aspirasi warga, menyelenggarakan RUMJ/RIMJ, dan forum mahasiswa jurusan yang diperlukan.</div>
              </div>
            </div>
            <div className="ab-org-node">
              <div className="ab-org-left">
                <div className="ab-org-dot">🗳️</div>
                <div className="ab-org-line"></div>
              </div>
              <div className="ab-org-content">
                <div className="ab-org-title">KPU — Komisi Pemilihan Umum</div>
                <div className="ab-org-desc">KPU bersifat independen, bertugas membuat mekanisme pemilihan Ketua, membentuk PPU, menetapkan syarat calon, dan melaksanakan PEMILU HIMAIDE ITS.</div>
              </div>
            </div>
            <div className="ab-org-node">
              <div className="ab-org-left">
                <div className="ab-org-dot">⚙️</div>
                <div className="ab-org-line"></div>
              </div>
              <div className="ab-org-content">
                <div className="ab-org-title">Fungsionaris HIMAIDE ITS — Lembaga Eksekutif</div>
                <div className="ab-org-desc">Fungsionaris memegang kekuasaan Eksekutif, dipimpin oleh Ketua HIMAIDE ITS yang dipilih langsung melalui PEMILU. Masa jabatan satu periode kepengurusan. Fungsionaris menjalankan visi, misi, dan program kerja dengan dibantu oleh Departemen.</div>
              </div>
            </div>
            <div className="ab-org-node">
              <div className="ab-org-left">
                <div className="ab-org-dot">📂</div>
              </div>
              <div className="ab-org-content">
                <div className="ab-org-title">Departemen</div>
                <div className="ab-org-desc">Departemen adalah bagian dari fungsionaris yang dibentuk untuk membantu pelaksanaan GBHK dan bersifat otonomi. Dipimpin oleh Kepala Departemen (Kadep) yang dipilih oleh Ketua HIMAIDE ITS untuk satu periode kepengurusan.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ab-divider"></div>

        {/* 11. Lambang */}
        <div className="ab-section">
          <div className="ab-eyebrow">Identitas Visual</div>
          <h2>Lambang HIMAIDE</h2>
          <div className="ab-lambang-container">
            <div className="ab-logo-frame">
              {LOGO_FOR_LAMBANG}
            </div>
            <div className="ab-lambang-info">
              <h3>Bentuk Lambang</h3>
              <ol>
                <li>Tiga coretan, dua diantaranya searah, satu lainnya berbeda.</li>
                <li>Tulisan <em>&quot;ide&quot;</em> di pojok kanan di bawah gambar tiga coretan, menggunakan huruf kecil (lowercase) dengan font Avant Garde &mdash; Bold.</li>
                <li>Hanya terdiri dari satu warna saja.</li>
              </ol>
              <h3 style={{ marginTop: '18px' }}>Arti Lambang</h3>
              <ul>
                <li>Gambar coretan kuas melambangkan sebuah <strong style={{ color: '#e2e8f5' }}>ekspresi</strong> dan satu goresan yang berbeda menggambarkan sebuah <strong style={{ color: '#e2e8f5' }}>kreativitas</strong>.</li>
                <li>Tulisan <em>&quot;ide&quot;</em> memiliki arti sebuah <strong style={{ color: '#e2e8f5' }}>gagasan</strong>.</li>
              </ul>
              <h3 style={{ marginTop: '18px' }}>Warna Identitas</h3>
              <div className="ab-warna-chip">
                <div className="ab-warna-dot"></div>
                <span className="ab-warna-label">Hitam &mdash; Warna identitas HIMAIDE ITS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ab-divider"></div>

        {/* 12. Perbendaharaan */}
        <div className="ab-section">
          <div className="ab-eyebrow">Perbendaharaan</div>
          <h2>Sumber Perbendaharaan</h2>
          <p>Harta benda HIMAIDE ITS diperoleh dari:</p>
          <ul className="ab-perbend-list">
            <li>💰 Subsidi per periode</li>
            <li>🤝 Usaha-usaha yang sah, halal, dan mengikat</li>
          </ul>
        </div>

        {/* 13. Penutup */}
        <div className="ab-penutup">
          <h2>Bergerak Bersama Warga</h2>
          <p>HIMAIDE ITS bukan hanya struktur organisasi, tetapi juga ruang tumbuh bersama bagi mahasiswa Desain Produk Industri ITS. Melalui semangat kekeluargaan, aspirasi, kreativitas, dan integritas keprofesian, HIMAIDE ITS terus berupaya menjadi organisasi yang relevan bagi warga, almamater, masyarakat, dan perkembangan industri kreatif di Indonesia.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#"
              className="about-cta-primary"
              onClick={(e) => { e.preventDefault(); onNavigate('home') }}
            >
              &larr; Kembali ke Home
            </a>
            <a
              href="#"
              className="about-cta-secondary"
              onClick={(e) => { e.preventDefault(); onNavigate('kontak') }}
            >
              Hubungi Kami
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
