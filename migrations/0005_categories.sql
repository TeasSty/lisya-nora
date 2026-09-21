-- Категории витрины (комнаты норы) + перенос товаров на список Инны.

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  room TEXT NOT NULL,
  short TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO categories (id, label, room, short, sort_order) VALUES
  ('seeds', 'Домики-семена', 'Домики-семена', 'символы будущего дома', 10),
  ('ceramics', 'Керамика', 'Керамика', 'вазы, фигурки, панно', 20),
  ('forge', 'Работы кузнеца', 'Работы кузнеца', 'звери и фигуры из металла', 30),
  ('dolls', 'Куклы коллекционные', 'Куклы коллекционные', 'лисы, пони, куклы', 40),
  ('jewelry', 'Украшения', 'Украшения', 'броши, венки, осколки фарфора', 50),
  ('perfume', 'Духи', 'Духи', 'ароматы из Карелии', 60),
  ('wood', 'Дерево', 'Дерево', 'кедр и деревянные обереги', 70),
  ('candles', 'Свечи', 'Свечи', 'тёплый свет для дома', 80),
  ('highlights', 'Самое интересное', 'Самое интересное', 'избранные находки норы', 90);

-- Перенос старых id категорий на новые.
UPDATE products SET category = 'ceramics' WHERE category = 'decor';
UPDATE products SET category = 'dolls' WHERE category = 'curiosities';
UPDATE products SET category = 'perfume' WHERE category = 'misc';
UPDATE products SET category = 'wood' WHERE category = 'charms' AND name LIKE '%Кедр%';
UPDATE products SET category = 'seeds' WHERE category = 'charms';
