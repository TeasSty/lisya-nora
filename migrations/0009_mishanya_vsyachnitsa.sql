-- Чудо Мишаня (VK 13556087, sold on marketplace) + older Всячница listing (VK 13513937).

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Чудо Мишаня',
  'Чудо чудное и диво дивное, полностью ручная работа, медвежонок Мишаня. Лапки и голова подвижные, одежда снимается. Ищет только любящую семью.',
  'dolls',
  '/images/products/chudo-mishanya.webp',
  json_array('/images/products/chudo-mishanya.webp', '/images/products/chudo-mishanya-2.webp', '/images/products/chudo-mishanya-3.webp', '/images/products/chudo-mishanya-4.webp'),
  13000,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/images/products/chudo-mishanya.webp');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Всячница керамика',
  'Всячница из керамики, ручная работа. Очень красивые овечки и козочки, все работы уникальны и прекрасны. Чудесная идея для подарка. Подойдут как фруктовница, конфетница, ваза или кашпо.',
  'ceramics',
  '/images/products/vsyachnitsa-ovechki.webp',
  json_array('/images/products/vsyachnitsa-ovechki.webp', '/images/products/vsyachnitsa-ovechki-2.webp', '/images/products/vsyachnitsa-ovechki-3.webp', '/images/products/vsyachnitsa-ovechki-4.webp'),
  16000,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/images/products/vsyachnitsa-ovechki.webp');
