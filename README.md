# Лисья нора — сайт-визитка с каталогом и заявками

Сайт магазина уникальных подарков «Лисья нора» (Выборг, Краснофлотская 4А):
витрина + каталог + форма заявки + панель администратора.

## Статус

Боевой путь: **reg.ru Host-0** (shared hosting) — **PHP + MySQL**.
Фронт (Vite React) ходит на `/api/*`; бэкенд — папка `api/` (plain PHP, PDO, без Composer).

- Загрузка: содержимое `dist/host0` → `public_html` (FTP).
- БД: MySQL в панели Host-0 + импорт `mysql/schema.sql`.
- SSL: Let's Encrypt в панели хостинга.
- Альтернативы: Node+SQLite на VPS (`server/`) или Cloudflare Workers + D1 (`worker/`).

**DEMO_MODE удалён** — каталог и заявки только через API.

## Стек

- **Frontend**: React 19 + TypeScript, Vite, CSS без UI-фреймворков.
- **Backend (бой)**: PHP 8+ + MySQL на Host-0 (`api/`).
- **Карта**: Leaflet + OSM.
- Сборка для хостинга: `npm run build:host0` → папка `dist/host0`.

## Структура

```
├── src/                 Фронтенд
├── api/                 PHP API для Host-0 (маршруты = worker/index.ts)
│   ├── index.php
│   ├── config.example.php  → скопировать в config.php на сервере
│   └── lib/             auth, helpers, ozon
├── mysql/schema.sql     Схема + стартовый каталог
├── public/.htaccess     SPA + /api → PHP (попадает в dist)
├── server/              Node + SQLite (VPS, опционально)
├── worker/              Cloudflare Worker (опционально)
└── migrations/          SQLite/D1 миграции (эталон для CF/Node)
```

## Деплой на Host-0 (основной путь)

Нужен тариф **Host-0** (или любой shared с PHP 8+ и MySQL), домен и доступ по FTP.

### 1. Сайт в панели

1. Личный кабинет reg.ru → **Хостинг** → ваш Host-0.
2. **Добавить сайт** / выбрать домен → корень сайта обычно `public_html`
   (или `www/domain.ru/public_html` — смотрите путь в панели).
3. PHP: в панели выберите **PHP 8.1+** (или 8.2/8.3). Нужны расширения:
   `pdo_mysql`, `mbstring`, `curl`, `json` (на Host-0 обычно уже есть).

### 2. База MySQL

1. Панель → **Базы данных MySQL** → **Создать**.
2. Запомните: **хост** (часто `localhost`), **имя БД**, **пользователь**, **пароль**.
3. Откройте **phpMyAdmin** → выберите БД → **Импорт** → файл
   `mysql/schema.sql` из репозитория → Выполнить.
4. После импорта в таблицах `categories` и `products` должны появиться строки.

### 3. Сборка на своём ПК

```bash
npm install
# опционально до сборки: VITE_VKID_APP_ID=... в .env
npm run build:host0
```

Готовая папка: **`dist/host0`** (статика + `api/` + `.htaccess`).

### 4. Конфиг PHP

На ПК (или сразу на сервере после заливки):

1. Скопируйте `api/config.example.php` → `api/config.php`.
2. Заполните:

| Ключ | Откуда |
|------|--------|
| `db_host` / `db_name` / `db_user` / `db_pass` | панель MySQL |
| `admin_password` | пароль входа на `/admin` |
| `session_secret` | длинная случайная строка |
| `ozon_delivery_*` | опционально (см. раздел Ozon) |

`config.php` **не коммитьте** и не светите в чатах.

### 5. FTP-загрузка

1. Панель → **FTP** (логин/пароль/хост) → FileZilla или встроенный файловый менеджер.
2. Залейте **всё содержимое** `dist/host0` в `public_html`
   (рядом должны лежать `index.html`, `assets/`, `api/`, `.htaccess`, `images/`).
3. Убедитесь, что на сервере есть `api/config.php` (если собирали без него —
   залейте отдельно).
4. Права на `api/cache/` — запись для PHP (обычно 755/775; если кэш Ozon
   не пишется — поставьте 775 или уточните у поддержки).

### 6. SSL (HTTPS)

1. Панель Host-0 → **SSL** / **Let's Encrypt** / «Выпустить сертификат».
2. Включите сертификат для домена и (по желанию) редирект HTTP→HTTPS.
3. Без HTTPS cookie админки всё равно работает (без флага Secure), но для боя
   HTTPS обязателен.

### 7. Проверка

1. `https://ваш-домен.ru` — открывается сайт.
2. `https://ваш-домен.ru/api/products` — JSON с товарами.
3. `https://ваш-домен.ru/admin` — вход паролем из `admin_password`.
4. Тестовая заявка с витрины → видна во вкладке заявок админки.

### Обновление сайта позже

```bash
npm run build:host0
# залить dist/host0 поверх public_html
# config.php на сервере не затирайте (его нет в сборке)
```

---

## Локальная разработка (Cloudflare / Node)

```bash
npm install
npm run db:migrate:local   # D1 local
npm run dev                # Vite + Worker/D1

# или Node + SQLite:
cp .env.example .env
npm run db:migrate:node
npm run build:regru
npm start
```

## Ozon API (поиск ПВЗ)

Нужен **Ozon Доставка для бизнеса** (Client ID + Client Secret), не Seller Api-Key.
Документация: [docs.ozon.ru/api/ozon-delivery](https://docs.ozon.ru/api/ozon-delivery/).

1. Кабинет Ozon → Доставка для бизнеса → частное приложение → Client ID / Secret.
2. На Host-0 впишите в `api/config.php`:
   `ozon_delivery_client_id`, `ozon_delivery_client_secret`.
3. Пока ключей нет — на форме ссылка на [карту Ozon](https://www.ozon.ru/info/map/).

Кэш списка ПВЗ: файл `api/cache/ozon-pvz.json` (первый запрос может быть долгим).

## VK ID

1. Приложение на [id.vk.com](https://id.vk.com), Redirect URL = `https://ваш-домен.ru/`.
2. Перед сборкой: `VITE_VKID_APP_ID=...` в `.env`.
3. Без App ID кнопка VK скрыта; гостевые заявки работают.

## Как устроен API

Те же контракты, что `src/lib/api.ts` / `worker/index.ts`:

| Метод | Путь |
|-------|------|
| GET | `/api/products`, `/api/categories` |
| POST | `/api/orders` (в т.ч. поля VK) |
| GET/POST | `/api/admin/session`, `login`, `logout` |
| GET/PATCH | `/api/admin/orders` |
| CRUD | `/api/admin/products`, `/api/admin/categories` |
| GET | `/api/ozon/pvz`, `/api/ozon/pvz/status` |

Сессия админа — HMAC cookie `ln_admin_session` (как в Worker).

## Альтернатива: VPS Node + SQLite

См. прежние инструкции: `server/`, `npm run build:regru`, `npm start`, Caddy/nginx + SSL.
Имеет смысл, если нужен долгоживущий Node-процесс; для Host-0 **не нужен**.

## Альтернатива: Cloudflare Workers + D1

```bash
npx wrangler login
npx wrangler d1 create lisya-nora-db
# database_id → wrangler.jsonc
npm run db:migrate:remote
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npm run deploy
```

## GitHub Pages

Статика без PHP/MySQL каталог и заявки **не** обслужит. Целевой хостинг — Host-0.

## Атрибуция

Фото лисы: [Frida Lannerström](https://unsplash.com/@fridalannerstrom) /
[Unsplash](https://unsplash.com/photos/a-close-up-of-a-red-foxs-face-DUXOafpG6To).
Иконки комнат: Game-icons.net (CC BY 3.0) — `public/icons/*/ATTRIBUTION.md`.
