'use client'

import { useEffect, useState } from 'react'
import type { PageId } from '@/types/config'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAB from '@/components/ui/FAB'
import HeroSection from '@/components/sections/HeroSection'
import MainContentSection from '@/components/sections/MainContentSection'
import AboutPage from '@/components/sections/AboutPage'

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('home')

  // Datang dari halaman lain lewat navbar: /?p=about
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('p')
    const card = params.get('card') // dari link footer "Lembaran Proker"
    if (p === 'about') setActivePage(p)
    if (card) window.dispatchEvent(new CustomEvent('himaide:opencard', { detail: card }))
    if (p || card) window.history.replaceState(null, '', '/')
  }, [])

  function handleNavigate(page: PageId) {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Navbar activePage={activePage} setActivePage={handleNavigate} />

      {activePage === 'home' && (
        <>
          <HeroSection />
          <MainContentSection />
        </>
      )}

      {activePage === 'about' && (
        <AboutPage onNavigate={handleNavigate} />
      )}

      <Footer />
      <FAB />
    </>
  )
}
