import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { CATEGORY_META, CATEGORY_ORDER, type ProductCategory } from '../../lib/categories'
import {
  ApiError,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  type ProductInput,
} from '../../lib/api'
import { compressImageFile } from '../../lib/compressImage'
import type { AdminProduct } from '../../lib/types'

const EMPTY_FORM: ProductInput = {
  name: '',
  description: '',
  category: 'jewelry',
  imageUrl: '',
  priceRub: null,
  isActive: true,
  sortOrder: 0,
}

function formatPrice(priceRub: number | null): string {
  if (priceRub == null) return 'Цена по запросу'
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽'
}

export function ProductsPanel() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM)
  const [showUrlField, setShowUrlField] = useState(false)
  const [imageNote, setImageNote] = useState<string | null>(null)
  const fileInputId = useId()

  function load() {
    setIsLoading(true)
    setError(null)
    fetchAdminProducts()
      .then((res) => setProducts(res.products))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить товары'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function startCreate() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setImageNote(null)
    setShowUrlField(false)
    setEditingId('new')
  }

  function startEdit(product: AdminProduct) {
    const imageUrl = product.imageUrl ?? ''
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl,
      priceRub: product.priceRub,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
    })
    setFormError(null)
    setImageNote(null)
    setShowUrlField(Boolean(imageUrl && !imageUrl.startsWith('data:')))
    setEditingId(product.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormError(null)
    setImageNote(null)
    setShowUrlField(false)
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setFormError(null)
    setImageNote(null)
    setIsCompressing(true)
    try {
      const { dataUrl, note } = await compressImageFile(file)
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }))
      setShowUrlField(false)
      if (note) setImageNote(note)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось обработать фото')
    } finally {
      setIsCompressing(false)
    }
  }

  function clearImage() {
    setForm((prev) => ({ ...prev, imageUrl: '' }))
    setImageNote(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!form.name.trim()) {
      setFormError('Укажите название товара')
      return
    }

    setIsSaving(true)
    try {
      const payload = { ...form }
      if (editingId === 'new') {
        await createAdminProduct(payload)
      } else if (typeof editingId === 'number') {
        await updateAdminProduct(editingId, payload)
      }
      setEditingId(null)
      setShowUrlField(false)
      load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Не удалось сохранить товар')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(product: AdminProduct) {
    try {
      await updateAdminProduct(product.id, {
        name: product.name,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl ?? '',
        priceRub: product.priceRub,
        isActive: !product.isActive,
        sortOrder: product.sortOrder,
      })
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, isActive: !product.isActive } : item,
        ),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось изменить видимость')
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`Удалить «${product.name}» из каталога?`)) return
    try {
      await deleteAdminProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось удалить товар')
    }
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__head">
          <h2>Товары каталога</h2>
          {editingId === null && (
            <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
              + Добавить товар
            </button>
          )}
        </div>

        {editingId !== null && (
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="p-name">Название</label>
              <input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="product-form__row">
              <div className="form-field" style={{ margin: 0 }}>
                <label htmlFor="p-category">Категория</label>
                <select
                  id="p-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                >
                  {CATEGORY_ORDER.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_META[category].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field" style={{ margin: 0 }}>
                <label htmlFor="p-sort">Порядок на странице</label>
                <input
                  id="p-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-field" style={{ margin: 0 }}>
              <label htmlFor="p-price">Цена, ₽ (необязательно — оставьте пустым, если цена уточняется)</label>
              <input
                id="p-price"
                type="number"
                min="0"
                value={form.priceRub ?? ''}
                onChange={(e) => setForm({ ...form, priceRub: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </div>

            <label className="product-form__active">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span>Показывать на витрине</span>
            </label>

            <div className="form-field" style={{ margin: 0 }}>
              <label htmlFor="p-description">Описание</label>
              <textarea
                id="p-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="image-field">
              <span className="image-field__label">Фото товара</span>

              {form.imageUrl ? (
                <div className="image-field__preview-wrap">
                  <img className="image-field__preview" src={form.imageUrl} alt="Превью фото товара" />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={clearImage}>
                    Убрать фото
                  </button>
                </div>
              ) : (
                <p className="image-field__hint">Пока без фото — можно загрузить с компьютера.</p>
              )}

              <div className="image-field__actions">
                <label className="btn btn-ghost btn-sm image-field__file-btn" htmlFor={fileInputId}>
                  {isCompressing ? 'Сжимаем…' : form.imageUrl ? 'Заменить фото' : 'Выбрать фото'}
                </label>
                <input
                  id={fileInputId}
                  className="visually-hidden"
                  type="file"
                  accept="image/*"
                  disabled={isCompressing || isSaving}
                  onChange={handleFileChange}
                />
              </div>

              {imageNote && <p className="image-field__hint">{imageNote}</p>}

              <button
                type="button"
                className="image-field__link-toggle"
                onClick={() => setShowUrlField((v) => !v)}
              >
                {showUrlField ? 'Скрыть поле ссылки' : 'или вставить ссылку'}
              </button>

              {showUrlField && (
                <div className="form-field" style={{ margin: 0 }}>
                  <label htmlFor="p-image">Ссылка на фото</label>
                  <input
                    id="p-image"
                    type="url"
                    placeholder="https://…"
                    value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </div>
              )}
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="product-row__actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || isCompressing}>
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
            <strong>Собираем полки…</strong>
            Загружаем товары каталога.
          </div>
        )}
        {!isLoading && error && (
          <div className="admin-empty" role="alert">
            <strong>Не получилось загрузить</strong>
            {error}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="admin-empty">
            <strong>Каталог пуст</strong>
            Добавьте первый товар — и он появится на витрине.
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div>
            {products.map((product) => (
              <div className="product-row" key={product.id}>
                {product.imageUrl ? (
                  <div className="product-row__thumb">
                    <img src={product.imageUrl} alt="" loading="lazy" />
                  </div>
                ) : (
                  <div className="product-row__thumb product-row__thumb--empty" aria-hidden="true">
                    без фото
                  </div>
                )}
                <div className="product-row__body">
                  <div className="product-row__info">
                    <strong>
                      {product.name}
                      {!product.isActive && <span className="product-row__badge">скрыт</span>}
                    </strong>
                    <span>
                      {CATEGORY_META[product.category].label} · {formatPrice(product.priceRub)}
                    </span>
                  </div>
                  <div className="product-row__actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(product)}>
                      Изменить
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleToggleActive(product)}
                    >
                      {product.isActive ? 'Скрыть' : 'Показать'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(product)}>
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
