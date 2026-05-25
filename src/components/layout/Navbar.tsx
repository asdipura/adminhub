'use client'

import { useState } from 'react'
import type { PageId } from '@/types/config'
import { documents } from '@/config/documents'

interface NavbarProps {
  activePage: PageId
  setActivePage: (page: PageId) => void
}


export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleNav(page: PageId) {
    setActivePage(page)
    setMobileOpen(false)
  }

  return (
    <nav className="navbar" id="navbar">
      {/* Logo */}
      <a
        className="nav-logo"
        href="#"
        onClick={(e) => { e.preventDefault(); handleNav('home') }}
      >
        <img src="/assets/logos/himaide-logo.svg" alt="HIMA IDE" style={{ height: '30px', width: 'auto' }} />
        <div className="logo-text">
          HIMAIDE <span>Admin Hub</span>
        </div>
      </a>

      {/* Desktop nav */}
      <div className="nav-links">
        <button
          className={`nav-link${activePage === 'home' ? ' active' : ''}`}
          onClick={() => handleNav('home')}
        >
          Home
        </button>
        <button
          className={`nav-link${activePage === 'about' ? ' active' : ''}`}
          onClick={() => handleNav('about')}
        >
          About HIMAIDE
        </button>
        <a className="nav-link" href={documents.tko || '#'} target={documents.tko ? '_blank' : undefined} rel="noopener">
          TKO ↗
        </a>
        <button
          className={`nav-link${activePage === 'kontak' ? ' active' : ''}`}
          onClick={() => handleNav('kontak')}
        >
          Kontak
        </button>
      </div>

      {/* Burger (mobile) */}
      <button
        className="burger-btn"
        id="burgerBtn"
        aria-label="Buka menu navigasi"
        onClick={() => setMobileOpen((v) => !v)}
      >
        ☰
      </button>

      {/* Mobile dropdown */}
      <div
        className={`mobile-menu${mobileOpen ? ' open' : ''}`}
        id="mobileMenu"
        role="menu"
      >
        <button
          className="mobile-link"
          role="menuitem"
          onClick={() => handleNav('home')}
        >
          <span aria-hidden="true" style={{ marginRight: '10px', fontSize: '16px', opacity: 0.6 }}>🏠</span>
          Home
        </button>
        <div className="mobile-sep" />
        <button
          className="mobile-link"
          role="menuitem"
          onClick={() => handleNav('about')}
        >
          <span aria-hidden="true" style={{ marginRight: '10px', fontSize: '16px', opacity: 0.6 }}>ℹ️</span>
          About HIMAIDE
        </button>
        <div className="mobile-sep" />
        <a className="mobile-link" href={documents.tko || '#'} target={documents.tko ? '_blank' : undefined} role="menuitem" rel="noopener" onClick={() => setMobileOpen(false)}>
          <span aria-hidden="true" style={{ marginRight: '10px', fontSize: '16px', opacity: 0.6 }}>📋</span>
          TKO ↗
        </a>
        <div className="mobile-sep" />
        <button
          className="mobile-link"
          role="menuitem"
          onClick={() => handleNav('kontak')}
        >
          <span aria-hidden="true" style={{ marginRight: '10px', fontSize: '16px', opacity: 0.6 }}>📞</span>
          Kontak
        </button>
      </div>
    </nav>
  )
}
