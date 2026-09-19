import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  suggestFullAddresses,
  type AddressSuggestion,
} from '../../lib/addressSuggest'

interface AddressSuggestInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  error?: string | null
  errorId?: string
  onPickSuggestion?: (item: AddressSuggestion) => void
}

export function AddressSuggestInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid,
  describedBy,
  hint,
  error,
  errorId,
  onPickSuggestion,
}: AddressSuggestInputProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<AddressSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [empty, setEmpty] = useState(false)
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null)

  useEffect(() => {
    const q = value.trim()
    if (q.length < 3) {
      setItems([])
      setLoading(false)
      setActiveIndex(-1)
      setEmpty(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setEmpty(false)
    const timer = window.setTimeout(() => {
      suggestFullAddresses(q, { signal: controller.signal })
        .then((next) => {
          setItems(next)
          setOpen(true)
          setEmpty(next.length === 0)
          setActiveIndex(-1)
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setItems([])
            setOpen(false)
            setEmpty(false)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 280)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [value])

  useLayoutEffect(() => {
    if (!open || (!items.length && !loading && !empty)) {
      setMenuBox(null)
      return
    }
    const input = inputRef.current
    if (!input) return

    function update() {
      const rect = input!.getBoundingClientRect()
      setMenuBox({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, items.length, loading, empty])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if ((target as HTMLElement).closest?.('.address-suggest__portal')) return
      setOpen(false)
      setActiveIndex(-1)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function pick(item: AddressSuggestion) {
    if (onPickSuggestion) onPickSuggestion(item)
    else onChange(item.label)
    setOpen(false)
    setItems([])
    setActiveIndex(-1)
    setEmpty(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      pick(items[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const showMenu = open && menuBox && (loading || empty || items.length > 0)

  return (
    <div className="form-field address-suggest" ref={rootRef}>
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
        autoComplete={autoComplete ?? 'off'}
        placeholder={placeholder}
        value={value}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (items.length > 0 || empty) setOpen(true)
        }}
        onKeyDown={onKeyDown}
      />
      {hint && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="form-error form-error--field" id={errorId} role="alert">
          {error}
        </p>
      )}
      {showMenu &&
        createPortal(
          <div
            className="address-suggest__portal"
            style={{ top: menuBox.top, left: menuBox.left, width: menuBox.width }}
          >
            {loading && <p className="address-suggest__status">Ищем адрес…</p>}
            {!loading && empty && (
              <p className="address-suggest__status">Ничего не нашли — попробуйте другое написание</p>
            )}
            {!loading && items.length > 0 && (
              <ul id={listId} className="address-suggest__list" role="listbox">
                {items.map((item, index) => (
                  <li key={item.id} role="presentation">
                    <button
                      type="button"
                      id={`${listId}-opt-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      className={`address-suggest__option${index === activeIndex ? ' is-active' : ''}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(item)}
                    >
                      <strong>{item.label}</strong>
                      {item.detail !== item.label && <span>{item.detail}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
