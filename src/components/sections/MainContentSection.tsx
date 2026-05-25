'use client'

import { useState, useEffect } from 'react'
import ShortcutSection from './ShortcutSection'
import WeekCalendar from '@/components/calendar/WeekCalendar'
import InfoCard from '@/components/cards/InfoCard'
import CardModal from '@/components/cards/CardModal'
import { PROKER, FUNGSIO, ALL_CARDS } from '@/config/cards'
import type { CardData } from '@/types/config'

export default function MainContentSection() {
  const [activeTab, setActiveTab] = useState<'proker' | 'fungsio'>('proker')
  const [openCard, setOpenCard] = useState<CardData | null>(null)

  function handleOpenModal(id: string) {
    const card = ALL_CARDS.find((c) => c.id === id) || null
    setOpenCard(card)
  }

  function handleCloseModal() {
    setOpenCard(null)
  }

  function switchTab(tab: 'proker' | 'fungsio') {
    setActiveTab(tab)
  }

  // Listen for footer "Lembaran Proker" link clicks
  useEffect(() => {
    const prokerIds = ['proposal', 'suratkeluar', 'ruang', 'konsumsi', 'merch', 'sertifikat', 'dana', 'requestdesign', 'lpj']
    function onOpenCardEvent(e: Event) {
      const id = (e as CustomEvent<string>).detail
      if (prokerIds.includes(id)) setActiveTab('proker')
      handleOpenModal(id)
    }
    window.addEventListener('himaide:opencard', onOpenCardEvent)
    return () => window.removeEventListener('himaide:opencard', onOpenCardEvent)
  }, [])

  const cards = activeTab === 'proker' ? PROKER : FUNGSIO

  return (
    <div className="main">
      {/* SHORTCUTS */}
      <ShortcutSection onOpenModal={handleOpenModal} />

      {/* WEEK CALENDAR */}
      <WeekCalendar />

      {/* SEGMENTED TABS */}
      <div className="seg">
        <div className="seg-ctrl">
          <button
            className={`seg-btn${activeTab === 'proker' ? ' on' : ''}`}
            onClick={() => switchTab('proker')}
          >
            📋 Proker / Kegiatan
          </button>
          <button
            className={`seg-btn${activeTab === 'fungsio' ? ' on' : ''}`}
            onClick={() => switchTab('fungsio')}
          >
            🏠 Fungsionaris
          </button>
        </div>
      </div>

      {/* PROKER PANEL */}
      <div id="seg-proker" className={`seg-panel${activeTab === 'proker' ? ' on' : ''}`}>
        <p className="section-eyebrow">Administrasi Kegiatan</p>
        <div className="card-list">
          {PROKER.map((card, i) => (
            <InfoCard key={card.id} card={card} index={i} onOpen={handleOpenModal} />
          ))}
        </div>
      </div>

      {/* FUNGSIO PANEL */}
      <div id="seg-fungsio" className={`seg-panel${activeTab === 'fungsio' ? ' on' : ''}`}>
        <p className="section-eyebrow">Layanan Fungsionaris</p>
        <div className="card-list">
          {FUNGSIO.map((card, i) => (
            <InfoCard key={card.id} card={card} index={i} onOpen={handleOpenModal} />
          ))}
        </div>
      </div>

      {/* MODAL */}
      <CardModal card={openCard} onClose={handleCloseModal} />
    </div>
  )
}
