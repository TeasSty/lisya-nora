-- Каталог товаров и заявки на заказ для сайта "Лисья нора"

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  image_url TEXT,
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

-- Демонстрационные позиции каталога.
-- Это ИЛЛЮСТРАТИВНЫЕ примеры на основе реальных категорий магазина
-- (украшения/бижутерия, часы, сувениры, коллекционные диковинки, обереги) —
-- НЕ реальный ассортимент. Владелица заменит их через админ-панель на
-- настоящие товары со своими фото и названиями. [TODO: заменить на реальные товары]
INSERT INTO products (name, description, category, image_url, is_active, sort_order) VALUES
  ('Кольцо ручной работы', 'Авторское украшение из недрагоценного металла и камня — таких больше нигде не найти, мастер делает штучно.', 'jewelry', NULL, 1, 10),
  ('Серьги «Рыжий лес»', 'Лёгкие серьги в тёплой гамме — сделаны вручную мастерами Выборга и окрестностей.', 'jewelry', NULL, 1, 20),
  ('Настенные часы с росписью', 'Часы с ручной росписью циферблата — штучная работа, часовой уголок магазина.', 'watches', NULL, 1, 30),
  ('Старинный ключ', 'Экземпляр из коллекции старинных ключей — для тех, кто собирает необычные вещи с историей.', 'curiosities', NULL, 1, 40),
  ('Штык-нож (коллекционный)', 'Коллекционный предмет для ценителей военной истории — из подборки диковинок магазина.', 'curiosities', NULL, 1, 50),
  ('Карта-подсказка судьбы', 'Гадальная карта для тех, кто любит подсказки от вселенной — частый выбор на подарок с характером.', 'charms', NULL, 1, 60),
  ('Оберег-подвеска', 'Небольшой оберег ручной работы — на удачу, для себя или в подарок.', 'charms', NULL, 1, 70),
  ('Домик-шкатулка расписной', 'Тот самый декоративный домик, о которых пишут гости магазина — маленький, тёплый, ручной работы.', 'decor', NULL, 1, 80),
  ('Магнит «Выборгский замок»', 'Сувенир на память о Выборге — для тех, кто заглянул проездом и хочет забрать частичку города.', 'decor', NULL, 1, 90);
