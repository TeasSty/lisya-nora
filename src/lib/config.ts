/**
 * Текущий этап: публичная витрина на GitHub Pages + демо-панель администратора.
 * В DEMO_MODE заявки и товары панели живут в localStorage этого браузера
 * (удобно показать заказчице), а Cloudflare Worker / D1 или MySQL на reg.ru
 * подключаются следующим шагом: достаточно поставить DEMO_MODE = false.
 *
 * Фото товаров: в DEMO_MODE и без R2 сохраняются как сжатый WebP data URL в imageUrl
 * (JPEG — только если браузер не умеет WebP encode; D1 TEXT). Для продакшена с
 * большим каталогом лучше подключить Cloudflare R2.
 */
export const DEMO_MODE = true
