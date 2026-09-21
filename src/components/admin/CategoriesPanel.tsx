import { useEffect, useState, type FormEvent } from 'react'
import {
  ApiError,
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type CategoryInput,
} from '../../lib/api'
import { type CategoryMeta, slugifyCategoryId } from '../../lib/categories'

const EMPTY_FORM: CategoryInput = {
  id: '',
  room: '',
  label: '',
  short: '',
  sortOrder: 100,
}

export function CategoriesPanel() {
  const [categories, setCategories] = useState<CategoryMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<CategoryInput>(EMPTY_FORM)

  function load() {
    setIsLoading(true)
    setError(null)
    fetchAdminCategories()
      .then((res) => setCategories(res.categories))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить категории'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function startCreate() {
    const nextOrder =
      categories.reduce((max, category) => Math.max(max, category.sortOrder), 0) + 10
    setForm({ ...EMPTY_FORM, sortOrder: nextOrder })
    setFormError(null)
    setEditingId('new')
  }

  function startEdit(category: CategoryMeta) {
    setForm({
      id: category.id,
      room: category.room,
      label: category.label,
      short: category.short,
      sortOrder: category.sortOrder,
    })
    setFormError(null)
    setEditingId(category.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setIsSaving(true)
    try {
      if (editingId === 'new') {
        await createAdminCategory(form)
      } else if (editingId) {
        await updateAdminCategory(editingId, form)
      }
      setEditingId(null)
      load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Не удалось сохранить категорию')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(category: CategoryMeta) {
    if (!window.confirm(`Удалить категорию «${category.label}»?`)) return
    setError(null)
    try {
      await deleteAdminCategory(category.id)
      if (editingId === category.id) cancelEdit()
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось удалить категорию')
    }
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__head">
          <h2>Категории</h2>
          <span className="admin-card__count">{categories.length}</span>
        </div>

        <div className="product-row__actions" style={{ marginBottom: 16 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
            Добавить категорию
          </button>
        </div>

        {editingId !== null && (
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="c-label">Название</label>
              <input
                id="c-label"
                value={form.label}
                onChange={(e) => {
                  const label = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    label,
                    room: prev.room || label,
                    id: editingId === 'new' ? slugifyCategoryId(label) : prev.id,
                  }))
                }}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="c-room">Название комнаты на карте</label>
              <input
                id="c-room"
                value={form.room ?? ''}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="Как на карте норы"
              />
            </div>

            <div className="form-field">
              <label htmlFor="c-short">Короткое описание</label>
              <input
                id="c-short"
                value={form.short}
                onChange={(e) => setForm({ ...form, short: e.target.value })}
                placeholder="что внутри комнаты"
              />
            </div>

            <div className="product-form__row">
              <div className="form-field" style={{ margin: 0 }}>
                <label htmlFor="c-id">Id (латиница)</label>
                <input
                  id="c-id"
                  value={form.id ?? ''}
                  onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase() })}
                  disabled={editingId !== 'new'}
                  required={editingId === 'new'}
                  pattern="[a-z][a-z0-9-]{1,47}"
                  title="Латиница, цифры и дефис"
                />
              </div>

              <div className="form-field" style={{ margin: 0 }}>
                <label htmlFor="c-sort">Порядок</label>
                <input
                  id="c-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="product-row__actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                {isSaving ? 'Сохраняем…' : 'Сохранить'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="admin-card">
        {isLoading && (
          <div className="admin-empty">
            <strong>Собираем комнаты…</strong>
            Загружаем категории.
          </div>
        )}
        {!isLoading && error && (
          <div className="admin-empty" role="alert">
            <strong>Не получилось</strong>
            {error}
          </div>
        )}
        {!isLoading && !error && categories.length === 0 && (
          <div className="admin-empty">
            <strong>Категорий пока нет</strong>
            Добавьте первую комнату норы.
          </div>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div>
            {categories.map((category) => (
              <div className="product-row" key={category.id}>
                <div className="product-row__body">
                  <div className="product-row__info">
                    <strong>{category.label}</strong>
                    <span>
                      {category.short || 'без подписи'} · id: {category.id} · порядок {category.sortOrder}
                    </span>
                  </div>
                  <div className="product-row__actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(category)}>
                      Изменить
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(category)}>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
