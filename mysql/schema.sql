-- MySQL schema for Host-0 (reg.ru shared hosting)
-- Импорт: phpMyAdmin → ваша БД → Импорт → этот файл
-- Кодировка: utf8mb4

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(48) NOT NULL,
  label VARCHAR(80) NOT NULL,
  room VARCHAR(80) NOT NULL,
  short VARCHAR(120) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(1000) NOT NULL DEFAULT '',
  category VARCHAR(48) NOT NULL,
  image_url MEDIUMTEXT NULL,
  image_urls MEDIUMTEXT NULL,
  price_rub INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category),
  KEY idx_products_active_sort (is_active, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  city VARCHAR(120) NOT NULL DEFAULT '',
  address VARCHAR(300) NOT NULL DEFAULT '',
  pickup_point VARCHAR(400) NOT NULL DEFAULT '',
  tracking_number VARCHAR(120) NOT NULL DEFAULT '',
  contact_channel VARCHAR(32) NOT NULL DEFAULT '',
  contact_handle VARCHAR(200) NOT NULL DEFAULT '',
  product_id INT UNSIGNED NULL,
  product_name VARCHAR(2000) NOT NULL,
  items_json MEDIUMTEXT NULL,
  comment VARCHAR(1000) NOT NULL DEFAULT '',
  status VARCHAR(16) NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vk_user_id VARCHAR(64) NULL,
  vk_first_name VARCHAR(120) NULL,
  vk_last_name VARCHAR(120) NULL,
  vk_avatar_url VARCHAR(1000) NULL,
  vk_profile_url VARCHAR(300) NULL,
  PRIMARY KEY (id),
  KEY idx_orders_created_at (created_at),
  CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO categories (id, label, room, short, sort_order) VALUES
  ('seeds', 'Домики-семена', 'Домики-семена', 'символы будущего дома', 10),
  ('ceramics', 'Керамика', 'Керамика', 'вазы, фигурки, панно', 20),
  ('forge', 'Работы кузнеца', 'Работы кузнеца', 'звери и фигуры из металла', 30),
  ('dolls', 'Куклы коллекционные', 'Куклы коллекционные', 'лисы, пони, куклы', 40),
  ('jewelry', 'Украшения', 'Украшения', 'броши, венки, осколки фарфора', 50),
  ('perfume', 'Духи', 'Духи', 'ароматы из Карелии', 60),
  ('wood', 'Дерево', 'Дерево', 'кедр и деревянные обереги', 70),
  ('candles', 'Свечи', 'Свечи', 'тёплый свет для дома', 80),
  ('highlights', 'Самое интересное', 'Самое интересное', 'избранные находки норы', 90);

-- Базовый ассортимент (категории уже в финальных id). Фото — из public/images/products.
INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT * FROM (
  SELECT 'Всячница керамика' AS name, 'Керамика ручная работа.' AS description, 'ceramics' AS category,
    '/images/products/vsyachnitsa-keramika.webp' AS image_url,
    '["/images/products/vsyachnitsa-keramika.webp"]' AS image_urls, 16000 AS price_rub, 1 AS is_active, 10 AS sort_order
  UNION ALL SELECT 'Керамика-всячница, символ 2027 года', 'Интерьерная работа из керамики. Просто потрясающая детализация.', 'ceramics',
    '/images/products/keramika-vsyachnitsa-2027.webp', '["/images/products/keramika-vsyachnitsa-2027.webp"]', 18500, 1, 20
  UNION ALL SELECT 'Лошадки, керамика', 'Лошадки керамика для ценителей необычного.', 'ceramics',
    '/images/products/loshadki-keramika.webp', '["/images/products/loshadki-keramika.webp"]', 6500, 1, 30
  UNION ALL SELECT 'Керамические фигурки: драконы и лошади', 'Исключительно ручная работа, керамика с душой.', 'ceramics',
    '/images/products/keramicheskie-figurki.webp', '["/images/products/keramicheskie-figurki.webp"]', 9000, 1, 40
  UNION ALL SELECT 'Панно керамика с деревом', 'Панно ручная работа, разные сюжеты с природой Карельского перешейка.', 'ceramics',
    '/images/products/panno-derevo.webp', '["/images/products/panno-derevo.webp"]', 2900, 1, 50
  UNION ALL SELECT 'Уникальные украшения из осколков старинной посуды', 'Каждая работа уникальна.', 'jewelry',
    '/images/products/unikalnye-ukrashenia.webp', '["/images/products/unikalnye-ukrashenia.webp"]', 1100, 1, 60
  UNION ALL SELECT 'Украшения из фрагментов фарфоровой посуды', 'Потрясающие украшения из битых старинных тарелочек — нечто особенное, для избранных ценителей.', 'jewelry',
    '/images/products/ukrashenia-farfor.webp', '["/images/products/ukrashenia-farfor.webp"]', 1100, 1, 70
  UNION ALL SELECT 'Венок из кожаных цветов', 'Веночек на голову из кожаных цветов. Эксклюзивный аксессуар. Цены от 1800 до 3000 руб.', 'jewelry',
    '/images/products/venok-kozhanyh-tsvetov.webp', '["/images/products/venok-kozhanyh-tsvetov.webp"]', 3000, 1, 80
  UNION ALL SELECT 'Броши из кожи', 'Броши ручной работы, кожа. Ассортимент постоянно пополняется. Цены от 900 руб, средняя цена 1500 руб.', 'jewelry',
    '/images/products/broshi-kozha.webp', '["/images/products/broshi-kozha.webp"]', 1600, 1, 90
  UNION ALL SELECT 'Брошка керамика', 'Брошка керамическая, ручная работа.', 'jewelry',
    '/images/products/broshka-keramika.webp', '["/images/products/broshka-keramika.webp"]', 500, 1, 100
  UNION ALL SELECT 'Сова, ковка', 'Шикарные цвета побежалости, кованая сова ручной работы. Украсит гостиную или кабинет. Высота — 29 см, работа тяжёлая — при доставке это нужно учесть.', 'forge',
    '/images/products/sova-kovka.webp', '["/images/products/sova-kovka.webp"]', 6500, 1, 110
  UNION ALL SELECT 'Собака Ева, ковка', 'Кованая собака Ева. Авторская работа кузнеца.', 'forge',
    '/images/products/sobaka-eva.webp', '["/images/products/sobaka-eva.webp"]', 2500, 1, 120
  UNION ALL SELECT '«Мне только спросить», ковка', 'Кованая авторская работа. Эмоции в металле, проработанные детали и лёгкий юмор. Хорошая идея подарка.', 'forge',
    '/images/products/mne-tolko-sprosit.webp', '["/images/products/mne-tolko-sprosit.webp"]', 25000, 1, 130
  UNION ALL SELECT 'Магические шаманы-лисицы', 'Полностью подвижные куклы-лисы: искусственный мех, стеклянные глаза, принимают любую позу. Высота около 50 см.', 'dolls',
    '/images/products/shamany-lisitsy.webp', '["/images/products/shamany-lisitsy.webp"]', 22000, 1, 140
  UNION ALL SELECT 'А пони тоже кони', 'Пони ручной работы. Конечности подвижны, одежда снимается. Ищет своего человека.', 'dolls',
    '/images/products/poni.webp', '["/images/products/poni.webp"]', 13000, 1, 150
  UNION ALL SELECT 'Ворона Каркуша', 'Хозяйственная и домовитая ворона — ищет семью, чтобы накаркать ей счастье.', 'dolls',
    '/images/products/vorona-karkusha.webp', '["/images/products/vorona-karkusha.webp"]', 2400, 1, 160
  UNION ALL SELECT 'Кролик ручной работы', 'Сшитый вручную уютный кролик. Лапки подвижны, ушки сгибаются — подходит и как интерьерная игрушка, и как игрушка для ребёнка.', 'dolls',
    '/images/products/krolik.webp', '["/images/products/krolik.webp"]', 2800, 1, 170
  UNION ALL SELECT 'Игрушка коллекционная — под заказ', 'Сшита вручную, все части тела подвижны, одежда снимается. Не просто игрушка — душа мастера в работе.', 'dolls',
    '/images/products/igrushka-medved.webp', '["/images/products/igrushka-medved.webp"]', 13500, 1, 180
  UNION ALL SELECT 'Исторические куклы', 'Кукла в историческом костюме.', 'dolls',
    '/images/products/istoricheskie-kukly.webp', '["/images/products/istoricheskie-kukly.webp"]', 4750, 1, 190
  UNION ALL SELECT 'Баба Яга — под заказ', 'Бабка Ёжка, самая лучшая на свете женщина.', 'dolls',
    '/images/products/baba-yaga.webp', '["/images/products/baba-yaga.webp"]', 5000, 1, 200
  UNION ALL SELECT 'Семечко вашего будущего дома', 'Символическое семечко будущего дома: покупаете и начинаете делать добрые дела — когда дел будет сделано достаточно, дом появится.', 'seeds',
    '/images/products/semechko-doma.webp', '["/images/products/semechko-doma.webp"]', 500, 1, 210
  UNION ALL SELECT 'Кедр — семейный талисман', 'Пара из кедра, связанная кожаным шнурком, как нерушимыми узами любви — мощный семейный оберег. К изделию прилагается паспорт от мастерской.', 'wood',
    '/images/products/kedr-talisman.webp', '["/images/products/kedr-talisman.webp"]', 1500, 1, 220
  UNION ALL SELECT 'Духи', 'Ароматы из Карелии, ни на что не похожие — заявленная стойкость впечатляет.', 'perfume',
    '/images/products/duhi.webp', '["/images/products/duhi.webp"]', 2000, 1, 230
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
