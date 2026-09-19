import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import {
  suggestAddresses,
  suggestCities,
  type AddressSuggestion,
} from '../../lib/addressSuggest'

interface AddressSuggestInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  mode: 'city' | 'address'
  /** Для режима address — сужаем поиск городом */
  cityHint?: string
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
  mode,
  cityHint,
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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<AddressSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const q = value.trim()
    const minLen = mode === 'city' ? 2 : 3
    if (q.length < minLen) {
      setItems([])
      setLoading(false)
      setActiveIndex(-1)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    const timer = window.setTimeout(() => {
      const request =
        mode === 'city'
          ? suggestCities(q, { signal: controller.signal })
          : suggestAddresses(q, { city: cityHint, signal: controller.signal })

      request
        .then((next) => {
          setItems(next)
          setOpen(next.length > 0)
          setActiveIndex(-1)
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setItems([])
            setOpen(false)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 320)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [value, mode, cityHint])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
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

  return (
    <div className="form-field address-suggest" ref={rootRef}>
      <label htmlFor={id}>{label}</label>
      <input
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
          if (items.length > 0) setOpen(true)
        }}
        onKeyDown={onKeyDown}
      />
      {hint && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="form-error form-error--field" id={errorId} role="alert">
          {error}
        </p>
      )}
      {loading && open && <p className="address-suggest__status">Ищем адрес…</p>}
      {open && items.length > 0 && (
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
    </div>
  )
}
