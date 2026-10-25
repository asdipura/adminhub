'use client'

import { useState, useEffect } from 'react'
import KomitmenCard from './KomitmenCard'
import WeekCalendar from '@/components/calendar/WeekCalendar'
import MenuTile from '@/components/cards/MenuTile'
import CardModal from '@/components/cards/CardModal'
import { ALL_CARDS, MENU, type MenuItem } from '@/config/cards'
import type { CardData } from '@/types/config'

function findCard(id: string) {
  return ALL_CARDS.find((c) => c.id === id) || null
}

export default function MainContentSection() {
  const [openCard, setOpenCard] = useState<CardData | null>(null)

  function handleOpenModal(id: string) {
    setOpenCard(findCard(id))
  }

  function handleCloseModal() {
    setOpenCard(null)
  }

  // Listen for footer "Lembaran Proker" link clicks
  useEffect(() => {
    function onOpenCardEvent(e: Event) {
      handleOpenModal((e as CustomEvent<string>).detail)
    }
    window.addEventListener('himaide:opencard', onOpenCardEvent)
    return () => window.removeEventListener('himaide:opencard', onOpenCardEvent)
  }, [])

  // Urutan animasi berlanjut antar grup supaya tile muncul berurutan dari atas
  let order = 0
  function tiles(items: MenuItem[], compactLast = false) {
    return items.map((item, i) => {
      const card = findCard(item.id)
      if (!card) return null
      return (
        <MenuTile
          key={item.id}
          card={card}
          label={item.label}
          index={order++}
          compact={compactLast && i === items.length - 1}
          onOpen={handleOpenModal}
        />
      )
    })
  }

  return (
    <div className="main">
      {/* KOMITMEN IURAN — hilang sendiri setelah jendela pengisian lewat */}
      <KomitmenCard />

      {/* WEEK CALENDAR */}
      <WeekCalendar />

      {/* MENU UTAMA */}
      <section className="menu-group">
        <div className="tile-grid">{tiles(MENU.utama)}</div>
        <div className="tile-grid tile-grid--8020">{tiles(MENU.utamaKecil, true)}</div>
      </section>

      <section className="menu-group">
        <p className="section-eyebrow">Dokumen Proker</p>
        <div className="tile-grid">{tiles(MENU.dokumen)}</div>
      </section>

      <section className="menu-group">
        <p className="section-eyebrow">QnA Proker</p>
        <div className="qna-list">
          {(MENU.qna as MenuItem[]).map((item) => {
            const card = findCard(item.id)
            if (!card) return null
            return (
              <button key={item.id} type="button" className="qna-row" onClick={() => handleOpenModal(item.id)}>
                <span className="msr qna-ico" aria-hidden="true">{card.icon}</span>
                <span className="qna-title">{item.label ?? card.title}</span>
                <span className="qna-tl">{card.tl}</span>
                <span className="qna-chev" aria-hidden="true">›</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="menu-group">
        <p className="section-eyebrow">Desain & Konten</p>
        <div className="tile-grid tile-grid--1">{tiles(MENU.desain)}</div>
      </section>

      <section className="menu-group">
        <p className="section-eyebrow">Sekretariat</p>
        <div className="tile-grid tile-grid--4">{tiles(MENU.sekretariat)}</div>
      </section>

      {/* MODAL */}
      <CardModal card={openCard} onClose={handleCloseModal} />
    </div>
  )
}
