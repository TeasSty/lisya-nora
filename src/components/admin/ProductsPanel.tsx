import { useEffect, useState, type FormEvent } from 'react'
import { CATEGORY_META, CATEGORY_ORDER, type ProductCategory } from '../../lib/categories'
import {
  ApiError,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  type ProductInput,
} from '../../lib/api'
import type { AdminProduct } from '../../lib/types'

const EMPTY_FORM: ProductInput = {
  name: '',
  description: '',
  category: 'jewelry',
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
}

export function ProductsPanel() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM)

  function load() {
    setIsLoading(true)
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
    setEditingId('new')
  }

  function startEdit(product: AdminProduct) {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl ?? '',
      isActive: product.isActive,
      sortOrder: product.sortOrder,
    })
    setFormError(null)
    setEditingId(product.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormError(null)
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
      if (editingId === 'new') {
        await createAdminProduct(form)
      } else if (typeof editingId === 'number') {
        await updateAdminProduct(editingId, form)
      }
      setEditingId(null)
      load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Не удалось сохранить товар')
    } finally {
      setIsSaving(false)
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
              <label htmlFor="p-description">Описание</label>
              <textarea
                id="p-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-field" style={{ margin: 0 }}>
              <label htmlFor="p-image">Ссылка на фото (необязательно)</label>
              <input
                id="p-image"
                type="url"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Показывать на сайте
            </label>

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
        {isLoading && <p className="admin-empty">Загружаем товары…</p>}
        {!isLoading && error && <p className="admin-empty">{error}</p>}
        {!isLoading && !error && products.length === 0 && (
          <p className="admin-empty">Каталог пуст — добавьте первый товар.</p>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div>
            {products.map((product) => (
              <div className="product-row" key={product.id}>
                <div className="product-row__info">
                  <strong>
                    {product.name} {!product.isActive && '(скрыт)'}
                  </strong>
                  <span>{CATEGORY_META[product.category].label}</span>
                </div>
                <div className="product-row__actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(product)}>
                    Изменить
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(product)}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
