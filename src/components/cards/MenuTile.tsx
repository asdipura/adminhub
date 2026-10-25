import type { CardData } from '@/types/config'

interface MenuTileProps {
  card: CardData
  label?: string
  index: number
  compact?: boolean // hanya ikon + label (dipakai tile Notulensi yang sempit)
  onOpen: (id: string) => void
}

export default function MenuTile({ card, label, index, compact, onOpen }: MenuTileProps) {
  const delay = (0.04 + index * 0.04).toFixed(2) + 's'

  return (
    <button
      type="button"
      className={`tile${compact ? ' tile--compact' : ''}`}
      style={{ animationDelay: delay }}
      onClick={() => onOpen(card.id)}
    >
      <span className="msr tile-ico" aria-hidden="true">{card.icon}</span>
      <span className="tile-title">{label ?? card.title}</span>
      {!compact && (
        <>
          <span className="tile-desc">{card.desc}</span>
          <span className="tile-tl">{card.tl}</span>
        </>
      )}
    </button>
  )
}
