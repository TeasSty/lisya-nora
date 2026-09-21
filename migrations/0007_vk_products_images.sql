-- Новые товары из VK Market + заполнение image_urls для каруселей.

-- Два новых товара (не было на сайте).
INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Ворона красотка',
  'Она шикарна',
  'dolls',
  '/images/products/vorona-krasotka.webp',
  json_array('/images/products/vorona-krasotka.webp'),
  3500,
  1,
  5
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ворона красотка');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Семейство Ворон',
  'Семейка ищет свою семью',
  'dolls',
  '/images/products/semeystvo-voron.webp',
  json_array('/images/products/semeystvo-voron.webp'),
  5000,
  1,
  6
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Семейство Ворон');

-- Карусели для существующих товаров (обложка + дополнительные кадры из VK).
UPDATE products SET image_urls = json_array(
  '/images/products/vsyachnitsa-keramika.webp',
  '/images/products/vsyachnitsa-keramika-2.webp',
  '/images/products/vsyachnitsa-keramika-3.webp'
), image_url = '/images/products/vsyachnitsa-keramika.webp'
WHERE name = 'Всячница керамика';

UPDATE products SET image_urls = json_array(
  '/images/products/keramika-vsyachnitsa-2027.webp',
  '/images/products/keramika-vsyachnitsa-2027-2.webp',
  '/images/products/keramika-vsyachnitsa-2027-3.webp'
), image_url = '/images/products/keramika-vsyachnitsa-2027.webp'
WHERE name LIKE 'Керамика%всячница%2027%';

UPDATE products SET image_urls = json_array(
  '/images/products/keramicheskie-figurki.webp',
  '/images/products/keramicheskie-figurki-2.webp',
  '/images/products/keramicheskie-figurki-3.webp'
), image_url = '/images/products/keramicheskie-figurki.webp'
WHERE name LIKE 'Керамические фигурки%';

UPDATE products SET image_urls = json_array(
  '/images/products/unikalnye-ukrashenia.webp',
  '/images/products/unikalnye-ukrashenia-2.webp',
  '/images/products/unikalnye-ukrashenia-3.webp',
  '/images/products/unikalnye-ukrashenia-4.webp',
  '/images/products/unikalnye-ukrashenia-5.webp'
), image_url = '/images/products/unikalnye-ukrashenia.webp'
WHERE name LIKE 'Уникальные украшения%';

UPDATE products SET image_urls = json_array(
  '/images/products/duhi.webp',
  '/images/products/duhi-2.webp',
  '/images/products/duhi-3.webp'
), image_url = '/images/products/duhi.webp'
WHERE name = 'Духи';

UPDATE products SET image_urls = json_array(
  '/images/products/baba-yaga.webp',
  '/images/products/baba-yaga-2.webp',
  '/images/products/baba-yaga-3.webp',
  '/images/products/baba-yaga-4.webp'
), image_url = '/images/products/baba-yaga.webp'
WHERE name LIKE '%Баба Яга%';

UPDATE products SET image_urls = json_array(
  '/images/products/istoricheskie-kukly.webp',
  '/images/products/istoricheskie-kukly-2.webp',
  '/images/products/istoricheskie-kukly-3.webp'
), image_url = '/images/products/istoricheskie-kukly.webp'
WHERE name = 'Исторические куклы';

UPDATE products SET image_urls = json_array(
  '/images/products/vorona-karkusha.webp',
  '/images/products/vorona-karkusha-2.webp',
  '/images/products/vorona-karkusha-3.webp',
  '/images/products/vorona-karkusha-4.webp',
  '/images/products/vorona-karkusha-5.webp'
), image_url = '/images/products/vorona-karkusha.webp'
WHERE name = 'Ворона Каркуша';

UPDATE products SET image_urls = json_array(
  '/images/products/sova-kovka.webp',
  '/images/products/sova-kovka-2.webp',
  '/images/products/sova-kovka-3.webp',
  '/images/products/sova-kovka-4.webp'
), image_url = '/images/products/sova-kovka.webp'
WHERE name LIKE 'Сова%ковка%';

UPDATE products SET image_urls = json_array(
  '/images/products/shamany-lisitsy.webp',
  '/images/products/shamany-lisitsy-2.webp',
  '/images/products/shamany-lisitsy-3.webp',
  '/images/products/shamany-lisitsy-4.webp'
), image_url = '/images/products/shamany-lisitsy.webp'
WHERE name LIKE '%шаманы%лис%';

UPDATE products SET image_urls = json_array(
  '/images/products/semechko-doma.webp',
  '/images/products/semechko-doma-2.webp',
  '/images/products/semechko-doma-3.webp'
), image_url = '/images/products/semechko-doma.webp'
WHERE name LIKE 'Семечко%';

UPDATE products SET image_urls = json_array(
  '/images/products/poni.webp',
  '/images/products/poni-2.webp',
  '/images/products/poni-3.webp',
  '/images/products/poni-4.webp'
), image_url = '/images/products/poni.webp'
WHERE name LIKE '%пони%';

UPDATE products SET image_urls = json_array(
  '/images/products/venok-kozhanyh-tsvetov.webp',
  '/images/products/venok-kozhanyh-tsvetov-2.webp',
  '/images/products/venok-kozhanyh-tsvetov-3.webp',
  '/images/products/venok-kozhanyh-tsvetov-4.webp'
), image_url = '/images/products/venok-kozhanyh-tsvetov.webp'
WHERE name LIKE 'Венок%';

UPDATE products SET image_urls = json_array(
  '/images/products/ukrashenia-farfor.webp',
  '/images/products/ukrashenia-farfor-2.webp',
  '/images/products/ukrashenia-farfor-3.webp',
  '/images/products/ukrashenia-farfor-4.webp'
), image_url = '/images/products/ukrashenia-farfor.webp'
WHERE name LIKE 'Украшения из фрагментов%';

UPDATE products SET image_urls = json_array(
  '/images/products/broshi-kozha.webp',
  '/images/products/broshi-kozha-2.webp',
  '/images/products/broshi-kozha-3.webp',
  '/images/products/broshi-kozha-4.webp',
  '/images/products/broshi-kozha-5.webp'
), image_url = '/images/products/broshi-kozha.webp'
WHERE name LIKE 'Броши%кожа%';

UPDATE products SET image_urls = json_array(
  '/images/products/panno-derevo.webp',
  '/images/products/panno-derevo-2.webp',
  '/images/products/panno-derevo-3.webp',
  '/images/products/panno-derevo-4.webp',
  '/images/products/panno-derevo-5.webp'
), image_url = '/images/products/panno-derevo.webp'
WHERE name LIKE 'Панно%';

UPDATE products SET image_urls = json_array(
  '/images/products/broshka-keramika.webp',
  '/images/products/broshka-keramika-2.webp',
  '/images/products/broshka-keramika-3.webp'
), image_url = '/images/products/broshka-keramika.webp'
WHERE name = 'Брошка керамика';

UPDATE products SET image_urls = json_array(
  '/images/products/krolik.webp',
  '/images/products/krolik-2.webp',
  '/images/products/krolik-3.webp',
  '/images/products/krolik-4.webp',
  '/images/products/krolik-5.webp'
), image_url = '/images/products/krolik.webp'
WHERE name LIKE 'Кролик%';

UPDATE products SET image_urls = json_array(
  '/images/products/igrushka-medved.webp',
  '/images/products/igrushka-medved-2.webp',
  '/images/products/igrushka-medved-3.webp',
  '/images/products/igrushka-medved-4.webp',
  '/images/products/igrushka-medved-5.webp'
), image_url = '/images/products/igrushka-medved.webp'
WHERE name LIKE 'Игрушка коллекционная%';

UPDATE products SET image_urls = json_array(
  '/images/products/kedr-talisman.webp',
  '/images/products/kedr-talisman-2.webp',
  '/images/products/kedr-talisman-3.webp'
), image_url = '/images/products/kedr-talisman.webp'
WHERE name LIKE 'Кедр%';

-- Одиночные фото (без доп. кадров в VK) — всё равно заполняем image_urls.
UPDATE products SET image_urls = json_array(image_url)
WHERE image_urls IS NULL AND image_url IS NOT NULL AND trim(image_url) != '';
