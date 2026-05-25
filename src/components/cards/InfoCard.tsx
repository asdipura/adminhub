import type { CardData } from '@/types/config'

interface InfoCardProps {
  card: CardData
  index: number
  onOpen: (id: string) => void
}

export default function InfoCard({ card, index, onOpen }: InfoCardProps) {
  const delay = (0.04 + index * 0.05).toFixed(2) + 's'

  return (
    <div
      className="card-item"
      style={{ animationDelay: delay }}
      onClick={() => onOpen(card.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(card.id) }}
    >
      <div className="ci-icon">{card.emoji}</div>
      <div className="ci-body">
        <div className="ci-title">{card.title}</div>
        <div className="ci-desc">{card.desc}</div>
        <div className="ci-meta">
          <span className="tl-badge">⏱ {card.tl}</span>
          <button
            className="btn-selengkapnya"
            onClick={(e) => { e.stopPropagation(); onOpen(card.id) }}
          >
            Selengkapnya →
          </button>
        </div>
      </div>
    </div>
  )
}
