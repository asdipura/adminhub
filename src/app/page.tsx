'use client'

import { useState } from 'react'
import type { PageId } from '@/types/config'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FAB from '@/components/ui/FAB'
import HeroSection from '@/components/sections/HeroSection'
import MainContentSection from '@/components/sections/MainContentSection'
import AboutPage from '@/components/sections/AboutPage'
import ContactPage from '@/components/sections/ContactPage'

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('home')

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

      {activePage === 'kontak' && (
        <ContactPage />
      )}

      <Footer />
      <FAB />
    </>
  )
}
