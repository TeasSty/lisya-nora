import { CATEGORY_META, type ProductCategory } from '../../lib/categories'
import { CategoryGlyph } from './ProductPattern'
import { FoxMark } from './FoxMark'

export type RoomId = ProductCategory | 'all'

type BurrowRoomId = 'all' | 'jewelry' | 'forge' | 'curiosities' | 'charms' | 'decor'

const ROOMS: { id: BurrowRoomId; title: string; short: string }[] = [
  { id: 'all', title: 'Весь магазин', short: 'посмотреть всё сразу' },
  { id: 'jewelry', title: CATEGORY_META.jewelry.room, short: CATEGORY_META.jewelry.short },
  { id: 'forge', title: CATEGORY_META.forge.room, short: CATEGORY_META.forge.short },
  { id: 'curiosities', title: CATEGORY_META.curiosities.room, short: CATEGORY_META.curiosities.short },
  { id: 'charms', title: CATEGORY_META.charms.room, short: CATEGORY_META.charms.short },
  { id: 'decor', title: CATEGORY_META.decor.room, short: CATEGORY_META.decor.short },
]

// Координаты узлов в системе viewBox 0 0 1000 500 (проценты для позиционирования).
const NODE_POSITION: Record<BurrowRoomId, { left: number; top: number }> = {
  all: { left: 6, top: 50 },
  jewelry: { left: 22, top: 20 },
  forge: { left: 38, top: 78 },
  curiosities: { left: 54, top: 18 },
  charms: { left: 70, top: 78 },
  decor: { left: 90, top: 45 },
}

function RoomIcon({ id, active = false }: { id: RoomId; active?: boolean }) {
  if (id === 'all') return <FoxMark variant={active ? 'light' : 'dark'} />
  return <CategoryGlyph category={id} />
}

interface BurrowMapProps {
  selected: RoomId
  onSelect: (room: RoomId) => void
}

export function BurrowMap({ selected, onSelect }: BurrowMapProps) {
  return (
    <div className="burrow">
      {/* Мобильная композиция: вертикальная тропа по норе */}
      <div className="burrow__mobile">
        {ROOMS.map((room) => (
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
              d="M60,250 C130,150 170,100 220,100 C290,100 330,320 380,390
                 C420,440 500,150 540,100 C610,70 650,320 700,390
                 C740,450 830,320 880,225"
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="26"
              strokeLinecap="round"
              strokeDasharray="2 26"
            />
          </svg>

          {ROOMS.map((room) => {
            const pos = NODE_POSITION[room.id]
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
