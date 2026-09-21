import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { categoryLabel, type CategoryMeta, type ProductCategory } from '../../lib/categories'
import {
  ApiError,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
  type ProductInput,
} from '../../lib/api'
import { compressImageFile } from '../../lib/compressImage'
import { productImageList, type AdminProduct } from '../../lib/types'

const EMPTY_FORM: ProductInput = {
  name: '',
  description: '',
  category: 'jewelry',
  imageUrl: '',
  imageUrls: [],
  priceRub: null,
  isActive: true,
  sortOrder: 0,
}

function formatPrice(priceRub: number | null): string {
  if (priceRub == null) return 'Цена по запросу'
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽'
}

function formFromImages(urls: string[]): Pick<ProductInput, 'imageUrl' | 'imageUrls'> {
  return {
    imageUrl: urls[0] ?? '',
    imageUrls: urls,
  }
}

export function ProductsPanel() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<CategoryMeta[]>([])
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

  const formImages = productImageList({
    imageUrl: form.imageUrl || null,
    imageUrls: form.imageUrls,
  })

  function load() {
    setIsLoading(true)
    setError(null)
    Promise.all([fetchAdminProducts(), fetchAdminCategories()])
      .then(([productRes, categoryRes]) => {
        setProducts(productRes.products)
        setCategories(categoryRes.categories)
        setForm((prev) => {
          if (categoryRes.categories.some((category) => category.id === prev.category)) return prev
          return {
            ...prev,
            category: categoryRes.categories[0]?.id ?? prev.category,
          }
        })
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить товары'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function startCreate() {
    setForm({
      ...EMPTY_FORM,
      category: categories[0]?.id ?? 'jewelry',
    })
    setFormError(null)
    setImageNote(null)
    setShowUrlField(false)
    setEditingId('new')
  }

  function startEdit(product: AdminProduct) {
    const urls = productImageList(product)
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      ...formFromImages(urls),
      priceRub: product.priceRub,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
    })
    setFormError(null)
    setImageNote(null)
    setShowUrlField(Boolean(urls[0] && !urls[0].startsWith('data:')))
    setEditingId(product.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormError(null)
    setImageNote(null)
    setShowUrlField(false)
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (files.length === 0) return

    setFormError(null)
    setImageNote(null)
    setIsCompressing(true)
    try {
      const added: string[] = []
      let note: string | undefined
      for (const file of files) {
        const result = await compressImageFile(file)
        added.push(result.dataUrl)
        if (result.note) note = result.note
      }
      setForm((prev) => {
        const current = productImageList({ imageUrl: prev.imageUrl || null, imageUrls: prev.imageUrls })
        return { ...prev, ...formFromImages([...current, ...added]) }
      })
      setShowUrlField(false)
      if (note) setImageNote(note)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось обработать фото')
    } finally {
      setIsCompressing(false)
    }
  }

  function clearImages() {
    setForm((prev) => ({ ...prev, ...formFromImages([]) }))
    setImageNote(null)
  }

  function removeImageAt(index: number) {
    setForm((prev) => {
      const next = productImageList({ imageUrl: prev.imageUrl || null, imageUrls: prev.imageUrls }).filter(
        (_, i) => i !== index,
      )
      return { ...prev, ...formFromImages(next) }
    })
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
      const payload: ProductInput = {
        ...form,
        ...formFromImages(formImages),
      }
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
      const urls = productImageList(product)
      await updateAdminProduct(product.id, {
        name: product.name,
        description: product.description,
        category: product.category,
        ...formFromImages(urls),
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

            <div className="product-form__grid">
              <div className="form-field">
                <label htmlFor="p-category">Категория</label>
                <select
                  id="p-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="p-price">Цена, ₽</label>
                <input
                  id="p-price"
                  type="number"
                  min={0}
                  step={1}
                  value={form.priceRub ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priceRub: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="p-sort">Порядок</label>
                <input
                  id="p-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            <label className="admin-check">
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
              <span className="image-field__label">Фото товара (карусель)</span>

              {formImages.length > 0 ? (
                <div className="image-field__previews">
                  {formImages.map((src, index) => (
                    <div className="image-field__preview-wrap" key={`${index}-${src.slice(0, 24)}`}>
                      <img className="image-field__preview" src={src} alt={`Фото ${index + 1}`} />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeImageAt(index)}>
                        Убрать
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={clearImages}>
                    Очистить все
                  </button>
                </div>
              ) : (
                <p className="image-field__hint">Пока без фото — можно загрузить несколько с компьютера.</p>
              )}

              <div className="image-field__actions">
                <label className="btn btn-ghost btn-sm image-field__file-btn" htmlFor={fileInputId}>
                  {isCompressing ? 'Сжимаем…' : formImages.length ? 'Добавить фото' : 'Выбрать фото'}
                </label>
                <input
                  id={fileInputId}
                  className="visually-hidden"
                  type="file"
                  accept="image/*"
                  multiple
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
                {showUrlField ? 'Скрыть поле ссылки' : 'или вставить ссылку на первое фото'}
              </button>

              {showUrlField && (
                <div className="form-field" style={{ margin: 0 }}>
                  <label htmlFor="p-image">Ссылка на фото</label>
                  <input
                    id="p-image"
                    type="url"
                    placeholder="https://…"
                    value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                    onChange={(e) => {
                      const value = e.target.value
                      setForm((prev) => {
                        const rest = productImageList({
                          imageUrl: prev.imageUrl || null,
                          imageUrls: prev.imageUrls,
                        }).slice(1)
                        return { ...prev, ...formFromImages(value ? [value, ...rest] : rest) }
                      })
                    }}
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
            {products.map((product) => {
              const urls = productImageList(product)
              const thumb = urls[0]
              return (
                <div className="product-row" key={product.id}>
                  {thumb ? (
                    <div className="product-row__thumb">
                      <img src={thumb} alt="" loading="lazy" />
                    </div>
                  ) : (
                    <div className="product-row__thumb product-row__thumb--empty" aria-hidden="true">
                      без фото
                    </div>
                  )}
                  <div className="product-row__body">
                    <div className="product-row__info">
                      <strong>{product.name}</strong>
                      <span>
                        {categoryLabel(product.category, categories)} · {formatPrice(product.priceRub)}
                        {urls.length > 1 ? ` · ${urls.length} фото` : ''}
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
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
