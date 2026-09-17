/**
 * Текущий этап: публичная витрина на GitHub Pages + демо-панель администратора.
 * В DEMO_MODE заявки и товары панели живут в localStorage этого браузера
 * (удобно показать заказчице), а Cloudflare Worker / D1 или MySQL на reg.ru
 * подключаются следующим шагом: достаточно поставить DEMO_MODE = false.
 */
export const DEMO_MODE = true
