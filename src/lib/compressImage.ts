const MAX_INPUT_BYTES = 8 * 1024 * 1024
const MAX_EDGE = 800
const WEBP_QUALITY = 0.8
const JPEG_QUALITY = 0.82
/** ~450 КБ data URL — комфортно для localStorage / D1 TEXT без R2. */
const MAX_DATA_URL_CHARS = 620_000

export type CompressImageResult = {
  dataUrl: string
  mimeType: 'image/webp' | 'image/jpeg'
  /** Мягкая подсказка, если браузер не умеет WebP encode */
  note?: string
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Не удалось прочитать изображение'))
    }
    img.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/webp' | 'image/jpeg',
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Не удалось сохранить изображение'))
    }
    reader.onerror = () => reject(new Error('Не удалось сохранить изображение'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Кодирует canvas в data URL выбранного MIME с понижением quality при переполнении лимита.
 * Возвращает null, если браузер не умеет данный формат (например WebP encode).
 */
async function encodeDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: 'image/webp' | 'image/jpeg',
  startQuality: number,
): Promise<string | null> {
  let quality = startQuality
  let lastDataUrl: string | null = null

  while (quality >= 0.45) {
    const blob = await canvasToBlob(canvas, mimeType, quality)
    if (!blob || blob.type !== mimeType) return null

    const dataUrl = await blobToDataUrl(blob)
    lastDataUrl = dataUrl
    if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl
    quality -= 0.1
  }

  return lastDataUrl
}

/**
 * Сжимает фото на клиенте до ~800px по длинной стороне.
 * Предпочитает WebP (quality ~0.8); если браузер не умеет encode — JPEG.
 * Возвращает data URL, пригодный для хранения в imageUrl (SQLite/D1 TEXT).
 */
export async function compressImageFile(file: File): Promise<CompressImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Выберите файл изображения (JPG, PNG, WebP…)')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Файл слишком большой (макс. 8 МБ). Выберите другое фото или уменьшите его.')
  }

  const img = await loadImageFromFile(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Браузер не смог обработать изображение')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  const webpDataUrl = await encodeDataUrl(canvas, 'image/webp', WEBP_QUALITY)
  if (webpDataUrl && webpDataUrl.length <= MAX_DATA_URL_CHARS) {
    return { dataUrl: webpDataUrl, mimeType: 'image/webp' }
  }

  const jpegDataUrl = await encodeDataUrl(canvas, 'image/jpeg', JPEG_QUALITY)
  if (jpegDataUrl && jpegDataUrl.length <= MAX_DATA_URL_CHARS) {
    return {
      dataUrl: jpegDataUrl,
      mimeType: 'image/jpeg',
      note:
        webpDataUrl === null
          ? 'Браузер не умеет сохранять WebP — фото сжато в JPEG. В современных браузерах будет WebP.'
          : undefined,
    }
  }

  throw new Error('После сжатия фото всё ещё слишком большое. Выберите другое изображение.')
}
