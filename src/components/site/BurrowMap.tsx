import { CATEGORY_META, type ProductCategory } from '../../lib/categories'
import { CategoryGlyph } from './ProductPattern'
import { FoxMark } from './FoxMark'

export type RoomId = ProductCategory | 'all'

type BurrowRoomId = 'all' | 'jewelry' | 'forge' | 'curiosities' | 'charms' | 'decor' | 'misc'

const ROOMS: { id: BurrowRoomId; title: string; short: string }[] = [
  { id: 'all', title: 'Весь магазин', short: 'посмотреть всё сразу' },
  { id: 'jewelry', title: CATEGORY_META.jewelry.room, short: CATEGORY_META.jewelry.short },
  { id: 'forge', title: CATEGORY_META.forge.room, short: CATEGORY_META.forge.short },
  { id: 'curiosities', title: CATEGORY_META.curiosities.room, short: CATEGORY_META.curiosities.short },
  { id: 'charms', title: CATEGORY_META.charms.room, short: CATEGORY_META.charms.short },
  { id: 'decor', title: CATEGORY_META.decor.room, short: CATEGORY_META.decor.short },
  { id: 'misc', title: CATEGORY_META.misc.room, short: CATEGORY_META.misc.short },
]

// Координаты узлов в системе viewBox 0 0 1000 500 (проценты для позиционирования).
const NODE_POSITION: Record<BurrowRoomId, { left: number; top: number }> = {
  all: { left: 5, top: 48 },
  jewelry: { left: 18, top: 18 },
  forge: { left: 32, top: 78 },
  curiosities: { left: 48, top: 16 },
  charms: { left: 62, top: 78 },
  decor: { left: 78, top: 22 },
  misc: { left: 93, top: 55 },
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
              d="M50,240 C120,140 150,90 180,90 C250,90 290,320 320,390
                 C360,450 430,140 480,80 C550,40 590,320 620,390
                 C660,450 730,160 780,110 C840,60 880,280 930,275"
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
