'use client'

import { SHORTCUTS } from '@/config/cards'

interface ShortcutSectionProps {
  onOpenModal: (id: string) => void
}

export default function ShortcutSection({ onOpenModal }: ShortcutSectionProps) {
  return (
    <div className="sc-row">
      {SHORTCUTS.map((s) => (
        <a
          key={s.id}
          className="sc"
          href="#"
          onClick={(e) => { e.preventDefault(); onOpenModal(s.id) }}
        >
          <div className="sc-ico">{s.emoji}</div>
          <div className="sc-lbl">{s.label}</div>
        </a>
      ))}
    </div>
  )
}
