const MAX_INPUT_BYTES = 8 * 1024 * 1024
const MAX_EDGE = 800
const JPEG_QUALITY = 0.82
/** ~450 КБ data URL — комфортно для localStorage / D1 TEXT без R2. */
const MAX_DATA_URL_CHARS = 620_000

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

/**
 * Сжимает фото на клиенте до ~800px по длинной стороне (JPEG).
 * Возвращает data URL, пригодный для DEMO_MODE / хранения в imageUrl.
 */
export async function compressImageFile(file: File): Promise<string> {
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

  let quality = JPEG_QUALITY
  let dataUrl = canvas.toDataURL('image/jpeg', quality)

  while (dataUrl.length > MAX_DATA_URL_CHARS && quality > 0.45) {
    quality -= 0.1
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }

  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error('После сжатия фото всё ещё слишком большое. Выберите другое изображение.')
  }

  return dataUrl
}
