'use client'

import { documents } from '@/config/documents'
import { socials } from '@/config/socials'
import { links } from '@/config/links'

function openCardModal(e: React.MouseEvent, cardId: string) {
  e.preventDefault()
  window.dispatchEvent(new CustomEvent('himaide:opencard', { detail: cardId }))
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="ft">
      <div className="ft-glow"></div>
      <div className="ft-in">
        <div className="ft-grid">
          <div className="ft-brand">
            <img src="/assets/logos/himaide-logo.svg" alt="Logo HIMA IDE" className="ft-logo" />
            <p className="ft-tag">
              <b>HIMAIDE ITS</b>
              Himpunan Mahasiswa<br />Desain Produk &amp; ITS
            </p>
          </div>

          <div className="ft-col">
            <h4>Sistem</h4>
            <ul>
              <li>
                <a href={links.sistemSuratKeluar || '#'} target="_blank" rel="noopener">
                  Surat Keluar<span className="x">↗</span>
                </a>
              </li>
              <li>
                <a href={links.sistemSertifikat || '#'} target="_blank" rel="noopener">
                  Sertifikat<span className="x">↗</span>
                </a>
              </li>
              <li>
                <a href={links.sistemZoom || '#'} target="_blank" rel="noopener">
                  Zoom<span className="x">↗</span>
                </a>
              </li>
              <li>
                <a href={links.sistemNotulensi || '#'} target="_blank" rel="noopener">
                  Notulensi<span className="x">↗</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="ft-col">
            <h4>OS File</h4>
            <ul>
              <li><a href={documents.adArt || '#'} target={documents.adArt ? '_blank' : undefined} rel="noopener">AD/ART ↗</a></li>
              <li><a href={documents.gbho || '#'} target={documents.gbho ? '_blank' : undefined} rel="noopener">GBHO ↗</a></li>
              <li><a href={documents.tko || '#'} target={documents.tko ? '_blank' : undefined} rel="noopener">TKO ↗</a></li>
            </ul>
          </div>

          <div className="ft-col">
            <h4>Lembaran Proker</h4>
            <ul>
              <li><a href="#" onClick={(e) => openCardModal(e, 'proposal')}>Proposal</a></li>
              <li><a href="#" onClick={(e) => openCardModal(e, 'sertifikat')}>Sertifikat</a></li>
              <li><a href="#" onClick={(e) => openCardModal(e, 'lpj')}>LPJ &amp; SPJ</a></li>
            </ul>
          </div>

          <div className="ft-col">
            <h4>Social Media</h4>
            <div className="ft-sl">
              <a href={socials.instagram || '#'} target={socials.instagram ? '_blank' : undefined} rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                Instagram
              </a>
              <a href={socials.youtube || '#'} target={socials.youtube ? '_blank' : undefined} rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none" />
                </svg>
                Youtube
              </a>
              <a href={socials.linkedin || '#'} target={socials.linkedin ? '_blank' : undefined} rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10V9h4v1.76A6 6 0 0 1 16 8z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
              <a href={socials.x || '#'} target={socials.x ? '_blank' : undefined} rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter)
              </a>
            </div>
          </div>
        </div>

        <div className="ft-bot">
          <p>© {year} HIMAIDE ITS.</p>
          <span className="ft-pill">
            <span className="ft-dot"></span>
            Powered by HIMAIDE ITS Secretariat Infrastructure
          </span>
        </div>
      </div>
    </footer>
  )
}
