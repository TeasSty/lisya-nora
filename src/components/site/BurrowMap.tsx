import { type CategoryMeta, DEFAULT_CATEGORIES } from '../../lib/categories'
import { CategoryGlyph } from './ProductPattern'
import { FoxMark } from './FoxMark'

export type RoomId = string

/** Позиции узлов вдоль тропы (viewBox 0 0 1000 500 → проценты). */
const NODE_SLOT: Array<{ left: number; top: number }> = [
  { left: 4, top: 48 },
  { left: 14, top: 18 },
  { left: 24, top: 78 },
  { left: 34, top: 16 },
  { left: 44, top: 78 },
  { left: 54, top: 18 },
  { left: 64, top: 78 },
  { left: 74, top: 20 },
  { left: 84, top: 76 },
  { left: 94, top: 48 },
]

function RoomIcon({ id, active = false }: { id: RoomId; active?: boolean }) {
  if (id === 'all') return <FoxMark variant={active ? 'light' : 'dark'} />
  return <CategoryGlyph category={id} />
}

interface BurrowMapProps {
  selected: RoomId
  onSelect: (room: RoomId) => void
  categories?: CategoryMeta[]
}

export function BurrowMap({ selected, onSelect, categories = DEFAULT_CATEGORIES }: BurrowMapProps) {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
  const rooms: { id: RoomId; title: string; short: string }[] = [
    { id: 'all', title: 'Весь магазин', short: 'посмотреть всё сразу' },
    ...sorted.map((category) => ({
      id: category.id,
      title: category.room,
      short: category.short,
    })),
  ]

  return (
    <div className="burrow">
      {/* Мобильная композиция: вертикальная тропа по норе */}
      <div className="burrow__mobile">
        {rooms.map((room) => (
          <div className="burrow__mobile-item" key={room.id}>
            <button
              type="button"
              className={`room-btn ${selected === room.id ? 'is-active' : ''}`}
              onClick={() => onSelect(room.id)}
              aria-pressed={selected === room.id}
            >
              <span className="room-btn__icon">
                <RoomIcon id={room.id} active={selected === room.id} />
              </span>
              <span className="room-btn__text">
                <strong>{room.title}</strong>
                <span>{room.short}</span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Десктопная композиция: карта норы с ходами */}
      <div className="burrow__desktop">
        <div className="burrow-map">
          <svg
            className="burrow-map__tunnels"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M40,240 C100,140 120,90 140,90 C200,90 220,320 240,390
                 C270,450 310,140 340,80 C390,30 420,320 440,390
                 C470,450 510,140 540,80 C590,30 620,320 640,390
                 C670,450 710,160 740,110 C790,60 820,280 860,280
                 C900,280 930,200 960,240"
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="26"
              strokeLinecap="round"
              strokeDasharray="2 26"
            />
          </svg>

          {rooms.map((room, index) => {
            const pos = NODE_SLOT[Math.min(index, NODE_SLOT.length - 1)]
            return (
              <button
                type="button"
                key={room.id}
                className={`burrow-map__node ${selected === room.id ? 'is-active' : ''}`}
                style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                onClick={() => onSelect(room.id)}
                aria-pressed={selected === room.id}
              >
                <RoomIcon id={room.id} active={selected === room.id} />
                <strong>{room.title}</strong>
                <span>{room.short}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
