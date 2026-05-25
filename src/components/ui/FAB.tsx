'use client'

import { useEffect, useRef } from 'react'
import { actions } from '@/config/actions'

const FAB_TEXT = 'SEKRE TANYA '

export default function FAB() {
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return
    ring.innerHTML = ''
    const degStep = 360 / FAB_TEXT.length
    Array.from(FAB_TEXT).forEach((ch, i) => {
      const span = document.createElement('span')
      span.textContent = ch === ' ' ? ' ' : ch
      span.style.transform = `rotate(${degStep * i}deg)`
      ring.appendChild(span)
    })
  }, [])

  function handleClick() {
    window.open(`https://wa.me/${actions.tanyaSekre.wa}`, '_blank')
  }

  return (
    <div id="fab-container">
      <div id="fab-outer">
        <button id="fab-btn" aria-label="Tanya Sekre" onClick={handleClick}>
          <div id="fab-text-ring" ref={ringRef}></div>
          <div id="fab-center">
            <svg
              className="fab-arrow-main"
              viewBox="0 0 14 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
                fill="#0e0e0e"
              />
            </svg>
            <svg
              className="fab-arrow-hidden"
              viewBox="0 0 14 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
                fill="#0e0e0e"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}
