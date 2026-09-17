-- Каталог товаров и заявки на заказ для сайта "Лисья нора"

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  image_url TEXT,
  price_rub INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Реальный ассортимент магазина на сентябрь 2026 — собран из раздела «Товары»
-- сообщества ВКонтакте (vk.com/lissi_nora). Названия, описания и цены подлинные.
-- Один товар («Чудо Мишаня») не включён — отмечен продавцом как «ПРОДАН».
-- Фото лежат в public/images/products и раздаются как статика этого же Worker'а.
-- [TODO владелице магазина]: актуализируйте цены и наличие через панель администратора —
-- ассортимент на маркетплейсе меняется быстрее, чем черновик сайта.
INSERT INTO products (name, description, category, image_url, price_rub, is_active, sort_order) VALUES
  ('Всячница керамика', 'Керамика ручная работа.', 'decor', '/images/products/vsyachnitsa-keramika.webp', 16000, 1, 10),
  ('Керамика-всячница, символ 2027 года', 'Интерьерная работа из керамики. Просто потрясающая детализация.', 'decor', '/images/products/keramika-vsyachnitsa-2027.webp', 18500, 1, 20),
  ('Лошадки, керамика', 'Лошадки керамика для ценителей необычного.', 'decor', '/images/products/loshadki-keramika.webp', 6500, 1, 30),
  ('Керамические фигурки: драконы и лошади', 'Исключительно ручная работа, керамика с душой.', 'decor', '/images/products/keramicheskie-figurki.webp', 9000, 1, 40),
  ('Панно керамика с деревом', 'Панно ручная работа, разные сюжеты с природой Карельского перешейка.', 'decor', '/images/products/panno-derevo.webp', 2900, 1, 50),
  ('Уникальные украшения из осколков старинной посуды', 'Каждая работа уникальна.', 'jewelry', '/images/products/unikalnye-ukrashenia.webp', 1100, 1, 60),
  ('Украшения из фрагментов фарфоровой посуды', 'Потрясающие украшения из битых старинных тарелочек — нечто особенное, для избранных ценителей.', 'jewelry', '/images/products/ukrashenia-farfor.webp', 1100, 1, 70),
  ('Венок из кожаных цветов', 'Веночек на голову из кожаных цветов. Эксклюзивный аксессуар. Цены от 1800 до 3000 руб.', 'jewelry', '/images/products/venok-kozhanyh-tsvetov.webp', 3000, 1, 80),
  ('Броши из кожи', 'Броши ручной работы, кожа. Ассортимент постоянно пополняется. Цены от 900 руб, средняя цена 1500 руб.', 'jewelry', '/images/products/broshi-kozha.webp', 1600, 1, 90),
  ('Брошка керамика', 'Брошка керамическая, ручная работа.', 'jewelry', '/images/products/broshka-keramika.webp', 500, 1, 100),
  ('Сова, ковка', 'Шикарные цвета побежалости, кованая сова ручной работы. Украсит гостиную или кабинет. Высота — 29 см, работа тяжёлая — при доставке это нужно учесть.', 'forge', '/images/products/sova-kovka.webp', 6500, 1, 110),
  ('Собака Ева, ковка', 'Кованая собака Ева. Авторская работа кузнеца.', 'forge', '/images/products/sobaka-eva.webp', 2500, 1, 120),
  ('«Мне только спросить», ковка', 'Кованая авторская работа. Эмоции в металле, проработанные детали и лёгкий юмор. Хорошая идея подарка.', 'forge', '/images/products/mne-tolko-sprosit.webp', 25000, 1, 130),
  ('Магические шаманы-лисицы', 'Полностью подвижные куклы-лисы: искусственный мех, стеклянные глаза, принимают любую позу. Высота около 50 см.', 'curiosities', '/images/products/shamany-lisitsy.webp', 22000, 1, 140),
  ('А пони тоже кони', 'Пони ручной работы. Конечности подвижны, одежда снимается. Ищет своего человека.', 'curiosities', '/images/products/poni.webp', 13000, 1, 150),
  ('Ворона Каркуша', 'Хозяйственная и домовитая ворона — ищет семью, чтобы накаркать ей счастье.', 'curiosities', '/images/products/vorona-karkusha.webp', 2400, 1, 160),
  ('Кролик ручной работы', 'Сшитый вручную уютный кролик. Лапки подвижны, ушки сгибаются — подходит и как интерьерная игрушка, и как игрушка для ребёнка.', 'curiosities', '/images/products/krolik.webp', 2800, 1, 170),
  ('Игрушка коллекционная — под заказ', 'Сшита вручную, все части тела подвижны, одежда снимается. Не просто игрушка — душа мастера в работе.', 'curiosities', '/images/products/igrushka-medved.webp', 13500, 1, 180),
  ('Исторические куклы', 'Кукла в историческом костюме.', 'curiosities', '/images/products/istoricheskie-kukly.webp', 4750, 1, 190),
  ('Баба Яга — под заказ', 'Бабка Ёжка, самая лучшая на свете женщина.', 'curiosities', '/images/products/baba-yaga.webp', 5000, 1, 200),
  ('Семечко вашего будущего дома', 'Символическое семечко будущего дома: покупаете и начинаете делать добрые дела — когда дел будет сделано достаточно, дом появится.', 'charms', '/images/products/semechko-doma.webp', 500, 1, 210),
  ('Кедр — семейный талисман', 'Пара из кедра, связанная кожаным шнурком, как нерушимыми узами любви — мощный семейный оберег. К изделию прилагается паспорт от мастерской.', 'charms', '/images/products/kedr-talisman.webp', 1500, 1, 220),
  ('Духи', 'Ароматы из Карелии, ни на что не похожие — заявленная стойкость впечатляет.', 'misc', '/images/products/duhi.webp', 2000, 1, 230);
