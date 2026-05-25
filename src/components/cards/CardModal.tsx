'use client'

import { useEffect, useRef, useState } from 'react'
import type { CardData, CardButton } from '@/types/config'

interface CardModalProps {
  card: CardData | null
  onClose: () => void
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const [copyStates, setCopyStates] = useState<Record<number, boolean>>({})

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  async function handleCopy(idx: number, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStates((prev) => ({ ...prev, [idx]: true }))
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [idx]: false }))
      }, 1800)
    } catch {
      // ignore
    }
  }

  if (!card) return null

  return (
    <div
      className={`backdrop${card ? ' open' : ''}`}
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="modal">
        <div className="modal-head">
          <div className="m-emoji">{card.emoji}</div>
          <div className="m-titles">
            <div className="m-title">{card.title}</div>
            <div className="m-tl">⏱ {card.tl}</div>
          </div>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div
          className="m-body"
          dangerouslySetInnerHTML={{ __html: card.body }}
        />
        <div className="m-foot">
          {card.btns.map((btn: CardButton, idx: number) => {
            if (btn.copy) {
              return (
                <button
                  key={idx}
                  className={btn.cls}
                  onClick={() => handleCopy(idx, btn.copy!)}
                >
                  {copyStates[idx] ? '✅ Tersalin!' : btn.label}
                </button>
              )
            }
            return (
              <a
                key={idx}
                href={btn.url || '#'}
                className={btn.cls}
                target={btn.url && btn.url !== '#' ? '_blank' : undefined}
                rel={btn.url && btn.url !== '#' ? 'noopener noreferrer' : undefined}
              >
                {btn.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
