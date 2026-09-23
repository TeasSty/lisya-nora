# Лисья нора — сайт-визитка с каталогом и заявками

Сайт магазина уникальных подарков «Лисья нора» (Выборг, Краснофлотская 4А):
витрина + каталог + форма заявки + панель администратора.

## Статус

Сайт работает через **реальный backend** (`/api/*`): каталог, заявки и админка
идут на сервер (SQLite / D1), не в localStorage браузера.

- **Боевой деплой:** VPS / Node на **reg.ru** — раздел «Деплой на reg.ru».
- Альтернатива: Cloudflare Workers + D1 (раздел «Деплой backend»).
- **VK App ID** (`VITE_VKID_APP_ID`) можно добавить позже — без него кнопка VK скрыта,
  гостевые заявки работают.
- Превью на GitHub Pages больше не является целевым режимом: без backend API там
  каталог и заявки не заработают. После переезда обновите canonical в `index.html`.


## Стек

- **Frontend**: React 19 + TypeScript, Vite, обычный CSS (без UI-фреймворков и
  motion-библиотек — вся анимация на CSS-переходах и `IntersectionObserver`).
- **Карта**: Leaflet + бесплатные тайлы OpenStreetMap (без ключей), подключена
  отдельным ленивым чанком, чтобы не раздувать основной бандл.
- **Backend**: Hono API — Node + SQLite на VPS (reg.ru) **или** Cloudflare Worker + D1.
- **Деплой бой**: `server/` + `npm run build:regru` на reg.ru; либо `npm run deploy` на Cloudflare.
- Локально CF-путь: `@cloudflare/vite-plugin` (`vite dev` / `vite build`).
  Боевая сборка для Node: `vite.config.reg.ts` (`npm run build:regru`).

Боевой путь — Node на VPS reg.ru (+ SQLite). Cloudflare Workers + D1 остаются
как альтернатива без своего сервера.

## Структура проекта

```
├── src/                     Фронтенд (React)
│   ├── components/site/     Публичный сайт (Header, Hero, карта норы, StoreMap...)
│   ├── components/admin/    Панель администратора (заявки, товары)
│   ├── pages/                Страницы: публичный сайт, вход админа, дашборд
│   ├── data/demoProducts.ts  Справочный снимок ассортимента (сид/история)
│   ├── lib/                  API-клиент, категории, типы, хук useReveal
│   └── styles/                CSS публичного сайта и админки
├── public/images/products/  Оптимизированные фото товаров (WebP, локально)
├── public/images/fox-liisa.webp  Фото рыжей лисы (Frida Lannerström / Unsplash License)
├── scripts/optimize-images.mjs  Ресайз + конвертация фото в WebP (sharp)
├── server/                   Node-сервер для reg.ru (Hono + SQLite + статика)
├── worker/                   Backend API (Hono; CF Worker или через server/)
│   ├── index.ts               Все API-маршруты
│   ├── auth.ts                 Подписанная cookie-сессия администратора
│   └── types.ts                 Типы строк из D1
├── migrations/0001_init.sql   Схема D1 (products, orders) + реальный ассортимент
└── wrangler.jsonc              Конфигурация Cloudflare Worker
```

## Как это работает

### Публичный сайт

Сигнатурная фишка сайта — **«карта норы»**: категории товаров показаны как комнаты
лисьей норы (шкатулка с украшениями, кузница, полка зверят, уголок оберегов, горница
керамики). Клик по комнате фильтрует каталог ниже. На мобильных — та же идея, но в
виде вертикальной тропы (не просто сжатая десктопная версия). Комнаты подобраны под
реальный ассортимент (см. ниже), а не под шаблонный список категорий.

В каталоге есть текстовый поиск (по названию и описанию) — пригодится, когда товаров
много, как сейчас (23 позиции).

### Заявка на заказ

У каждого товара — кнопка «Оставить заявку». Открывается форма (имя, телефон,
комментарий), товар уже выбран автоматически. Заявка сохраняется в БД через
`POST /api/orders` и сразу видна в панели администратора. Оплаты и доставки в этой
версии нет — по договорённости это осознанно вне scope черновика, но архитектура
(таблица `orders`, отдельный статус заявки) не мешает добавить это позже.

### Панель администратора (`/admin`)

- Вход по паролю (без логина/имени пользователя — максимально просто, как просили).
- **Заявки**: список всех заявок с сайта — имя, телефон (кликабельный, можно сразу
  позвонить), товар, комментарий, дата. Кнопка «Отметить выполненной» — чтобы видеть,
  что уже обработано.
- **Товары**: добавление / редактирование / удаление товаров каталога без участия
  разработчика — название, категория, описание, необязательная ссылка на фото,
  видимость на сайте, порядок отображения.

Сессия администратора — подписанный HMAC-токен в HttpOnly cookie (без библиотек и
без таблицы сессий в базе). Пароль сравнивается через постоянное время сравнения
(защита от timing-атак).

### Каталог и фото товаров — реальные данные

23 позиции каталога (кроме одной, отмеченной продавцом как «ПРОДАН») — это настоящий
ассортимент, собранный из раздела «Товары» сообщества ВКонтакте
([vk.com/lissi_nora](https://vk.com/lissi_nora)) через браузерную автоматизацию:
названия, описания и цены — подлинные, фотографии скачаны и оптимизированы локально
(`public/images/products`, WebP, ~46 КБ на фото в среднем) — не хотлинк на ВК.
Исходные данные и скрипт оптимизации: `src/data/demoProducts.ts` и
`scripts/optimize-images.mjs`.

Категории карты норы подобраны под этот реальный ассортимент: украшения (осколки
фарфора, кожаные броши), кованые фигуры (сова, собака, авторские скульптуры),
куклы и зверята (лисы-шаманы, пони, мишки — коллекционные игрушки), обереги и
талисманы (кедровые талисманы, «семечко дома»), керамика и панно (вазы-всячницы,
лошадки, панно с деревом).

Процедурный узор (`src/components/site/ProductPattern.tsx`) остаётся как осмысленный
fallback — сработает, если владелица добавит через админку новый товар без фото.
Иконки комнат на карте норы и в fallback — SVG с [Game-icons.net](https://game-icons.net/)
(CC BY 3.0); список авторов и файлов: `public/icons/rooms/ATTRIBUTION.md`.
Иконки на иллюстрации полок в About: `public/icons/shelf/ATTRIBUTION.md`.

**[TODO владелице магазина]**: цены и наличие на маркетплейсе меняются быстрее, чем
черновик сайта — проверьте актуальность через панель администратора перед запуском.

### Иллюстрации

Лиса в hero-блоке — собственная векторная SVG-иллюстрация (`Hero.tsx`).
Полки в About (`ShelfArt` в `About.tsx`) — деревянные полки на бежевом овале;
предметы на них — силуэты Game-icons (CC BY 3.0), см. `public/icons/shelf/ATTRIBUTION.md`.
Круглые бейджи вокруг норы в hero — те же иконки категорий, что и в карточках
товаров (`ProductPattern.tsx`), а не случайные системные глифы.

### Карта

В блоке «Где нас найти» — рабочая карта на **Leaflet** + бесплатных тайлах
OpenStreetMap (без API-ключей). Тон тайлов сдвинут CSS-фильтром
(`invert + hue-rotate`) в фирменный тёмно-зелёный — сам маркер и попап не затронуты
(фильтр применяется только к `leaflet-tile-pane`). Метка стоит по координатам
Краснофлотской улицы, уточнённым через геокодер OpenStreetMap. Карта не перехватывает
скролл страницы: на ней показана кнопка «Нажмите, чтобы включить карту» — жесты
(драг/зум) включаются только после явного клика, это особенно важно на мобильных.
Leaflet — не маленькая библиотека, поэтому она грузится отдельным чанком лениво
(`React.lazy`), только когда пользователь долистал до блока с картой.

## Локальный запуск

```bash
npm install

# Секреты для локальной разработки — только в файле .dev.vars (он в .gitignore).
# Скопируйте пример у себя локально и задайте свои значения, не коммитьте файл.
# Применить схему БД к локальной D1 (один раз, при первом запуске):
npm run db:migrate:local

npm run dev        # http://localhost:5173 — фронтенд + API + локальная D1
npm run build       # production-сборка (tsc + vite build)
npm run preview      # прогнать собранную сборку в Workers runtime локально
```

Локальный пароль администратора задаётся в `.dev.vars` (`ADMIN_PASSWORD`) — **не
пишите его в README и не пушьте `.dev.vars` в git**.

## Ozon API: где нажать, чтобы получить ключи для карты ПВЗ

Нам нужен **Ozon Доставка для бизнеса** (Delivery API), а не обычный Seller
`Client-Id` / `Api-Key` из seller.ozon.ru. Документация:
[docs.ozon.ru/api/ozon-delivery](https://docs.ozon.ru/api/ozon-delivery/).

### Пошагово в кабинете Ozon

1. Войдите в личный кабинет Ozon под аккаунтом магазина / ИП.
2. Откройте раздел **Ozon Доставка** / **Доставка для бизнеса**
   (если пункта нет — подключите услугу доставки в том же кабинете; без неё
   списка ПВЗ через API не будет).
3. Найдите блок вроде **Приложения** / **Частные приложения** / **API**.
4. Нажмите **Создать** (частное приложение).
5. Укажите название, например `lisya-nora` или домен сайта.
6. Сохраните приложение.
7. В строке приложения нажмите иконку **ключа** (или «Данные приложения» /
   «Посмотреть данные клиента») и скопируйте:
   - **Client ID**
   - **Client Secret**
8. Эти два значения **никому не отправляйте в чат и не кладите в git**.

### Куда вставить на нашем сайте (Cloudflare)

После деплоя Worker:

```bash
npx wrangler secret put OZON_DELIVERY_CLIENT_ID
# вставьте Client ID и Enter

npx wrangler secret put OZON_DELIVERY_CLIENT_SECRET
# вставьте Client Secret и Enter
```

Локально — те же имена переменных в `.dev.vars`.

После этого в форме заявки можно будет искать ПВЗ по городу через API.
Пока ключей нет — на форме есть ссылка на карту [ozon.ru/info/map](https://www.ozon.ru/info/map/),
а в админке остаётся ручной сценарий: «Скопировать для Ozon» + трек-номер.
Автосоздание отправления в Ozon — следующий шаг после ключей.

## VK ID (вход через ВКонтакте)

В форме заявки покупатель может **необязательно** войти через VK ID. Тогда в заявке
сохраняются id, имя, фото и ссылка на профиль — они видны в панели администратора.
Гостевой заказ без входа по-прежнему работает.

1. Создайте приложение на [id.vk.com](https://id.vk.com) (кабинет VK ID / «Подключить VK ID»).
2. Укажите доверенный **Redirect URL** — точный адрес сайта, с которого открывается форма
   (например `https://teassty.github.io/lisya-nora/` для превью или ваш боевой домен).
3. Скопируйте **App ID** (это публичный идентификатор, не секрет приложения).
4. Добавьте в окружение сборки переменную:

```bash
VITE_VKID_APP_ID=12345678
```

Локально — в `.env` / `.env.local` (файлы `.env*` в git не коммитятся). Для GitHub Pages —
секрет репозитория / переменная Actions, которую подставляет workflow при `npm run build`.

Без `VITE_VKID_APP_ID` кнопка входа VK в шапке скрыта; в форме заявки — короткая
подсказка «не настроен». С App ID — компактный вход в шапке и OneTap в модалке заказа;
сессия общая (`sessionStorage`).

Миграция D1: `migrations/0011_vk_profile.sql` (после деплоя backend —
`npm run db:migrate:remote`).

In-memory rate limit на Worker (заявки / вход) — мягкая защита изолята.
На проде лучше включить **Cloudflare Rate Limiting** на `/api/orders` и `/api/admin/login`.

Переезд на reg.ru: см. раздел «Деплой на reg.ru» (Node + SQLite). Чистый PHP
shared-хостинг без Node этот backend не запустит.

**Частая путаница:** ключи из **Настройки → Seller API → Сгенерировать ключ**
(Api-Key) для этого сценария **не подходят**. Нужны именно Client ID + Client Secret
частного приложения доставки.

## Деплой на reg.ru (основной боевой путь)

Сайт — **Vite SPA + API на Hono + SQLite**. На reg.ru нужен **VPS с Ubuntu**
(или любой Linux VPS), **не** обычный PHP shared-хостинг: там нет Node.js,
SQLite-файла на диске и нормального HTTPS-прокси до нашего процесса.

В репозитории уже есть: `server/`, `npm run build:regru`, `.env.example`,
`Dockerfile` + `docker-compose.yml`. Ниже — чеклист «сегодня открыть сайт с SSL».

### 1. Заказать VPS на reg.ru

1. В личном кабинете reg.ru закажите **VPS** (облачный сервер), ОС **Ubuntu 22.04**
   или 24.04.
2. Запомните **IP-адрес** сервера и пароль/ключ root (или создайте пользователя).
3. **Не** берите «хостинг сайтов» / PHP / ISPmanager только под статику — этот
   проект запускается как Node-приложение (порт 3000) + reverse proxy с HTTPS.

### 2. DNS: домен → IP VPS

В панели DNS домена (reg.ru или где куплен домен):

1. Создайте запись **A**: имя `@` (или `www`) → **IP вашего VPS**.
2. Подождите 5–60 минут (иногда дольше), пока DNS обновится.
3. Проверка с вашего ПК: `ping ваш-домен.ru` — должен показать IP VPS.

Для SSL сертификат выпустится только когда домен уже указывает на этот сервер.

### 3. Войти по SSH

С Windows (PowerShell) или с Mac/Linux:

```bash
ssh root@IP_ВАШЕГО_VPS
```

Дальше все команды — **на сервере**, если не сказано иное.

### 4. Поставить Node 20+ **или** Docker

**Вариант A — Node (проще для первого раза):**

```bash
# Ubuntu: Node 22 через NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential git
node -v   # должно быть v20+ (лучше 22)
```

**Вариант B — Docker** (если привычнее контейнеры):

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo systemctl enable --now docker
```

### 5. Код на сервер и файл `.env`

```bash
cd /opt
sudo git clone https://github.com/TeasSty/lisya-nora.git
cd lisya-nora
cp .env.example .env
nano .env   # или любой редактор
```

В `.env` на сервере обязательно задайте (свои значения, **не** в чат и не в git):

- `ADMIN_PASSWORD` — пароль входа в `/admin`
- `SESSION_SECRET` — длинная случайная строка
- `PORT=3000` (можно оставить)
- по желанию: `OZON_DELIVERY_*`, `VITE_VKID_APP_ID` (VK — **до** сборки)

### 6. Сборка и запуск приложения

**Без Docker:**

```bash
cd /opt/lisya-nora
npm ci
npm run build:regru
npm start
```

Приложение слушает `http://127.0.0.1:3000` (и `0.0.0.0:3000`). Для фона
удобно systemd или `pm2`:

```bash
sudo npm i -g pm2
pm2 start "npm start" --name lisya-nora
pm2 save
pm2 startup
```

**С Docker:**

```bash
cd /opt/lisya-nora
# .env уже заполнен
docker compose up -d --build
```

Контейнер отдаёт порт **3000**. Снаружи наружу открываем только 80/443 (см. ниже).

### 7. HTTPS (SSL) — выберите один способ

Откройте в файрволе порты **80** и **443** (панель VPS reg.ru и/или `ufw`):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### Способ 1 — Caddy (рекомендуем: SSL сам)

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy
```

Файл `/etc/caddy/Caddyfile` (подставьте свой домен):

```
ваш-домен.ru {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo systemctl reload caddy
```

Caddy сам получит Let's Encrypt сертификат. Сайт: `https://ваш-домен.ru`.

#### Способ 2 — nginx + Certbot

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Сайт `/etc/nginx/sites-available/lisya-nora`:

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lisya-nora /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

Certbot сам допишет HTTPS. Обновление сертификата — через таймер certbot.

### 8. Канонический URL под ваш домен

В `index.html` сейчас указан прежний GitHub Pages адрес. Перед финальной сборкой
замените `canonical`, `og:url`, `og:image`, `twitter:image` на
`https://ваш-домен.ru/` (и картинку og на тот же домен). База Vite для reg.ru уже
`/` (`vite.config.reg.ts`) — менять не нужно, если сайт на корне домена.

После правки на сервере:

```bash
npm run build:regru
# и перезапуск: pm2 restart lisya-nora   или   docker compose up -d --build
```

### 9. Проверка после запуска

1. В браузере: `https://ваш-домен.ru` — сайт открывается, замок SSL есть.
2. `https://ваш-домен.ru/api/products` — JSON каталога (не 404/502).
3. `https://ваш-домен.ru/admin` — вход паролем из `.env` (`ADMIN_PASSWORD`).

### Переменные `.env`

| Имя | Обязательно |
|-----|-------------|
| `ADMIN_PASSWORD` | да |
| `SESSION_SECRET` | да |
| `PORT` / `HOST` | нет (`3000` / `0.0.0.0`) |
| `DATABASE_PATH` | нет (`./data/lisya-nora.sqlite`) |
| `OZON_DELIVERY_CLIENT_ID` / `SECRET` | нет |
| `VITE_VKID_APP_ID` | нет (нужен **до** `build:regru`) |

Секреты в git не кладём. Разбор безопасности кода — отдельным шагом позже.

### Альтернатива: Cloudflare + домен reg.ru

Раздел «Деплой backend» ниже + Custom Domain в Cloudflare на домен с reg.ru.

---

## GitHub Pages (устаревшее превью)

Workflow `.github/workflows/deploy-pages.yml` ещё может публиковать статику на
https://teassty.github.io/lisya-nora/ , но **без backend** каталог и заявки не работают.
Целевой хостинг — **reg.ru (VPS/Node)**. Секреты в репозиторий не коммитим.

## Деплой backend (следующий этап, после согласования дизайна)

Полноценный backend (Cloudflare Worker + D1 для каталога и заявок, панель
администратора) уже написан и протестирован локально, но не развёрнут: в этой рабочей
среде нет авторизованного доступа к Cloudflare (`wrangler whoami` возвращает
«Not logged in», интерактивный логин недоступен). Когда дизайн одобрят, разверните
backend самостоятельно — это займёт 5–10 минут:

```bash
# 1. Войти в Cloudflare (откроется браузер)
npx wrangler login

# 2. Создать базу D1 и подставить её id в wrangler.jsonc (поле database_id)
npx wrangler d1 create lisya-nora-db

# 3. Применить схему и демо-данные к реальной (remote) базе
npm run db:migrate:remote

# 4. Задать секреты (пароль администратора и секрет для подписи сессий)
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET

# Опционально: список ПВЗ через Ozon Delivery for Business API
# Пошагово «куда нажать» — раздел «Ozon API» выше в этом README.
# Документация: https://docs.ozon.ru/api/ozon-delivery/
npx wrangler secret put OZON_DELIVERY_CLIENT_ID
npx wrangler secret put OZON_DELIVERY_CLIENT_SECRET

# 5. Собрать и опубликовать
npm run deploy
```

После деплоя Cloudflare выдаст бесплатный адрес вида `https://lisya-nora.<ваш-поддомен>.workers.dev`
— это и есть рабочая ссылка на черновик, которую можно сразу показать владелице
магазина (desktop и mobile). Домен на reg.ru и переход на платный хостинг — отдельный
следующий шаг **после** её одобрения; когда домен будет готов, его достаточно
привязать к этому же Worker'у через Custom Domains в Cloudflare (DNS настраивается
один раз, без переписывания кода).

После получения реального адреса на Cloudflare (а позже — домена на reg.ru) обновите
`canonical` и `og:*`/`twitter:*` ссылки в `index.html` (сейчас там указан адрес
текущего GitHub Pages превью).

## Git

Репозиторий инициализирован, есть `.gitignore` (исключены `node_modules`, `dist`,
`.wrangler`, `.dev.vars` и любые `.env*` — секреты не попадают в git). Проверьте перед
пушем, что вы не коммитите свои личные `.dev.vars` с настоящими паролями.

## Атрибуция

Фото рыжей лисы на первом экране и в блоке «О магазине»:
[Frida Lannerström](https://unsplash.com/@fridalannerstrom) —
[«a close up of a red fox's face»](https://unsplash.com/photos/a-close-up-of-a-red-foxs-face-DUXOafpG6To),
лицензия [Unsplash License](https://unsplash.com/license) (коммерческое использование разрешено).
Локальная копия: `public/images/fox-liisa.webp` (~57 КБ).
