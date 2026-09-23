-- Additive full catalog sync for Host-0 (safe: does not DROP orders).
-- Inserts missing products by name from demoProducts (47).
SET NAMES utf8mb4;

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Ворона красотка', 'Она шикарна', 'dolls', '/images/products/vorona-krasotka.webp', '["/images/products/vorona-krasotka.webp"]', 3500, 1, 10
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ворона красотка' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Семейство Ворон', 'Семейка ищет свою семью', 'dolls', '/images/products/semeystvo-voron.webp', '["/images/products/semeystvo-voron.webp"]', 5000, 1, 20
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Семейство Ворон' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Странники', 'Куклы странники, ошеломительно прекрасные работы , прекрасный подарок коллекционеру и просто человеку понимающему. Цены разные , ассортимент тоже меняется.', 'dolls', '/images/products/stranniki.webp', '["/images/products/stranniki.webp","/images/products/stranniki-2.webp","/images/products/stranniki-3.webp"]', 10000, 1, 30
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Странники' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Бабка Ёжка и Лоухи', 'Бабки Ёжки и Лоухи, куклы ручной работы, цена от 2300 до 4500. Зависит от размера куклы. Чудесная идея для подарка.', 'dolls', '/images/products/babka-yozhka-louhi.webp', '["/images/products/babka-yozhka-louhi.webp","/images/products/babka-yozhka-louhi-2.webp","/images/products/babka-yozhka-louhi-3.webp","/images/products/babka-yozhka-louhi-4.webp","/images/products/babka-yozhka-louhi-5.webp"]', 3000, 1, 40
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Бабка Ёжка и Лоухи' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Лисы из папье-маше', 'Очаровательные лисы из папье-маше , ручная работа', 'dolls', '/images/products/lisy-pape-mashe.webp', '["/images/products/lisy-pape-mashe.webp","/images/products/lisy-pape-mashe-2.webp","/images/products/lisy-pape-mashe-3.webp","/images/products/lisy-pape-mashe-4.webp","/images/products/lisy-pape-mashe-6.webp"]', 1100, 1, 50
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Лисы из папье-маше' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Гномик Выборгский Вилли', 'Связанный вручную, маленький персональный помощник гномик Вилли. Носить с собой , просить о помощи в любой момент, он всегда поможет.', 'dolls', '/images/products/gnomik-villi.webp', '["/images/products/gnomik-villi.webp","/images/products/gnomik-villi-2.webp","/images/products/gnomik-villi-3.webp","/images/products/gnomik-villi-4.webp","/images/products/gnomik-villi-5.webp"]', 1500, 1, 60
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Гномик Выборгский Вилли' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Фигурка моряка', 'Шикарная работа , фигурка моряка, выполнена из керамики', 'dolls', '/images/products/figurka-moryaka.webp', '["/images/products/figurka-moryaka.webp","/images/products/figurka-moryaka-2.webp","/images/products/figurka-moryaka-3.webp"]', 30000, 1, 70
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Фигурка моряка' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Чудо Мишаня', 'Чудо чудное и диво дивное, полностью ручная работа, медвежонок Мишаня. Лапки и голова подвижные , одежда снимается. Ищет только любящую семью.', 'dolls', '/images/products/chudo-mishanya.webp', '["/images/products/chudo-mishanya.webp","/images/products/chudo-mishanya-2.webp","/images/products/chudo-mishanya-3.webp","/images/products/chudo-mishanya-4.webp"]', 13000, 1, 80
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Чудо Мишаня' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Всячница керамика', 'Керамика ручная работа', 'ceramics', '/images/products/vsyachnitsa-keramika.webp', '["/images/products/vsyachnitsa-keramika.webp","/images/products/vsyachnitsa-keramika-2.webp","/images/products/vsyachnitsa-keramika-3.webp"]', 16000, 1, 90
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Всячница керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Всячница керамика', 'Всячница из керамики, ручная работа. Очень красивые овечки и козочки, все работы уникальны и прекрасны. Чудесная идея для подарка. Подойдут как фруктовница, конфетница, ваза или кашпо.', 'ceramics', '/images/products/vsyachnitsa-ovechki.webp', '["/images/products/vsyachnitsa-ovechki.webp","/images/products/vsyachnitsa-ovechki-2.webp","/images/products/vsyachnitsa-ovechki-3.webp","/images/products/vsyachnitsa-ovechki-4.webp"]', 16000, 1, 100
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Всячница керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Керамика-всячница, символ 2027 года', 'Интерьерная работа из керамики. Просто потрясающая детализация.', 'ceramics', '/images/products/keramika-vsyachnitsa-2027.webp', '["/images/products/keramika-vsyachnitsa-2027.webp","/images/products/keramika-vsyachnitsa-2027-2.webp","/images/products/keramika-vsyachnitsa-2027-3.webp"]', 18500, 1, 110
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Керамика-всячница, символ 2027 года' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Лошадки, керамика', 'Лошадки керамика для ценителей необычного.', 'ceramics', '/images/products/loshadki-keramika.webp', '["/images/products/loshadki-keramika.webp"]', 6500, 1, 120
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Лошадки, керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Керамические фигурки: драконы и лошади', 'Исключительно ручная работа, керамика с душой.', 'ceramics', '/images/products/keramicheskie-figurki.webp', '["/images/products/keramicheskie-figurki.webp","/images/products/keramicheskie-figurki-2.webp","/images/products/keramicheskie-figurki-3.webp"]', 9000, 1, 130
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Керамические фигурки: драконы и лошади' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Керамический конь', 'Керамическая фигурка коня. Издревле конь считался главным оберегом с жизни человека. Он был другом и защитником. Сейчас же фигура коня дарится тому, кто хочет добиться успеха.', 'ceramics', '/images/products/keramicheskiy-kon.webp', '["/images/products/keramicheskiy-kon.webp","/images/products/keramicheskiy-kon-2.webp","/images/products/keramicheskiy-kon-3.webp","/images/products/keramicheskiy-kon-4.webp"]', 8000, 1, 140
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Керамический конь' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Светильник-домик, керамика', 'Керамический домик светильник , внутри светодиод, светит достаточно ярко и создает в комнате волшебную атмосферу уюта.', 'ceramics', '/images/products/svetilnik-domik.webp', '["/images/products/svetilnik-domik.webp","/images/products/svetilnik-domik-2.webp","/images/products/svetilnik-domik-3.webp"]', 11000, 1, 150
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Светильник-домик, керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Домик-светильник, керамика', 'Светильник домик, ручная работа, керамика. Работает от сети 220 вольт, внутри светодиод. Очень уютный свет, уникальное дизайнерское решение. Около 30 см.', 'ceramics', '/images/products/domik-svetilnik.webp', '["/images/products/domik-svetilnik.webp","/images/products/domik-svetilnik-2.webp","/images/products/domik-svetilnik-3.webp","/images/products/domik-svetilnik-4.webp"]', 11800, 1, 160
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Домик-светильник, керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Светильник, керамика', 'Светильник домик, ручная работа, керамика. Работает от сети 220 вольт, внутри светодиод. Очень уютный свет, уникальное дизайнерское решение.', 'ceramics', '/images/products/svetilnik-keramika.webp', '["/images/products/svetilnik-keramika.webp","/images/products/svetilnik-keramika-2.webp","/images/products/svetilnik-keramika-3.webp"]', 11800, 1, 170
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Светильник, керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Мухомор на удачу', 'Мухомор 🍄 ручная работа', 'ceramics', '/images/products/muhomor-na-udachu.webp', '["/images/products/muhomor-na-udachu.webp","/images/products/muhomor-na-udachu-2.webp","/images/products/muhomor-na-udachu-3.webp"]', 1700, 1, 180
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Мухомор на удачу' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Мухомор-колокольчик, керамика', 'Волшебный мухомор колокольчик, звенит к богатству.', 'ceramics', '/images/products/muhomor-kolokolchik.webp', '["/images/products/muhomor-kolokolchik.webp","/images/products/muhomor-kolokolchik-2.webp","/images/products/muhomor-kolokolchik-3.webp","/images/products/muhomor-kolokolchik-4.webp"]', 1300, 1, 190
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Мухомор-колокольчик, керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Желудь, керамика', 'Желудь издревле носили в кармане, для привлечения удачи.', 'ceramics', '/images/products/zhelud-keramika.webp', '["/images/products/zhelud-keramika.webp","/images/products/zhelud-keramika-2.webp","/images/products/zhelud-keramika-3.webp","/images/products/zhelud-keramika-4.webp"]', 1200, 1, 200
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Желудь, керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Сувенир из керамики', 'Прекрасный подарок , керамика ручная работа', 'ceramics', '/images/products/suvenir-keramika.webp', '["/images/products/suvenir-keramika.webp","/images/products/suvenir-keramika-2.webp","/images/products/suvenir-keramika-4.webp"]', 1200, 1, 210
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Сувенир из керамики' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Свистулька-кот, глина', 'Глиняная свистулька котик, ручная работа.', 'ceramics', '/images/products/svistulka-kot.webp', '["/images/products/svistulka-kot.webp","/images/products/svistulka-kot-2.webp","/images/products/svistulka-kot-3.webp","/images/products/svistulka-kot-4.webp"]', 900, 1, 220
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Свистулька-кот, глина' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Панно керамика с деревом', 'Панно ручная работа, разные сюжеты с природой Карельского перешейка.', 'ceramics', '/images/products/panno-derevo.webp', '["/images/products/panno-derevo.webp","/images/products/panno-derevo-2.webp","/images/products/panno-derevo-3.webp","/images/products/panno-derevo-4.webp","/images/products/panno-derevo-5.webp"]', 2900, 1, 230
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Панно керамика с деревом' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Уникальные украшения из осколков старинной посуды', 'Каждая работа уникальна', 'jewelry', '/images/products/unikalnye-ukrashenia.webp', '["/images/products/unikalnye-ukrashenia.webp","/images/products/unikalnye-ukrashenia-2.webp","/images/products/unikalnye-ukrashenia-3.webp","/images/products/unikalnye-ukrashenia-4.webp","/images/products/unikalnye-ukrashenia-5.webp"]', 1100, 1, 240
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Уникальные украшения из осколков старинной посуды' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Украшения из фрагментов фарфоровой посуды', 'Потрясающие украшения из битых старинных тарелочек. Это нечто очень особенное, для избранных ценителей.', 'jewelry', '/images/products/ukrashenia-farfor.webp', '["/images/products/ukrashenia-farfor.webp","/images/products/ukrashenia-farfor-2.webp","/images/products/ukrashenia-farfor-3.webp","/images/products/ukrashenia-farfor-4.webp"]', 1100, 1, 250
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Украшения из фрагментов фарфоровой посуды' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Венок из кожаных цветов', 'Веночек на голову из кожаных цветов. Эксклюзивный аксессуар. Цены от 1800 до 3000 руб.', 'jewelry', '/images/products/venok-kozhanyh-tsvetov.webp', '["/images/products/venok-kozhanyh-tsvetov.webp","/images/products/venok-kozhanyh-tsvetov-2.webp","/images/products/venok-kozhanyh-tsvetov-3.webp","/images/products/venok-kozhanyh-tsvetov-4.webp"]', 3000, 1, 260
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Венок из кожаных цветов' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Броши из кожи', 'Броши ручной работы, кожа. Ассортимент постоянно пополняется. Цены от 900 руб. Средняя цена 1500 руб. Фото по запросу.', 'jewelry', '/images/products/broshi-kozha.webp', '["/images/products/broshi-kozha.webp","/images/products/broshi-kozha-2.webp","/images/products/broshi-kozha-3.webp","/images/products/broshi-kozha-4.webp","/images/products/broshi-kozha-5.webp"]', 1600, 1, 270
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Броши из кожи' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Брошка керамика', 'Брошка керамическая, ручная работа', 'jewelry', '/images/products/broshka-keramika.webp', '["/images/products/broshka-keramika.webp","/images/products/broshka-keramika-2.webp","/images/products/broshka-keramika-3.webp"]', 500, 1, 280
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Брошка керамика' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Брошка-брелок', 'Шикарный мухомор 🍄, для тех кто хочет привлечь деньги.', 'jewelry', '/images/products/broshka-brelok.webp', '["/images/products/broshka-brelok.webp","/images/products/broshka-brelok-2.webp","/images/products/broshka-brelok-3.webp","/images/products/broshka-brelok-4.webp"]', 1500, 1, 290
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Брошка-брелок' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Брошки вязаные', 'Вязаные брошки ручной работы.', 'jewelry', '/images/products/broshki-vyazanye.webp', '["/images/products/broshki-vyazanye.webp","/images/products/broshki-vyazanye-2.webp","/images/products/broshki-vyazanye-3.webp"]', 1700, 1, 300
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Брошки вязаные' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Лягушка Подсказушка', 'Связанная вручную игрушка , брелок. Лягушка Подсказушка, помогает принимать решения. Спросите у вашего помощника Подсказушки, как поступить и первое что придет вам в голову это и есть верное решение.', 'jewelry', '/images/products/lyagushka-podskazushka.webp', '["/images/products/lyagushka-podskazushka.webp","/images/products/lyagushka-podskazushka-2.webp","/images/products/lyagushka-podskazushka-3.webp"]', 1500, 1, 310
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Лягушка Подсказушка' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Брелок гномик Выборгский', 'Связанный вручную, маленький персональный помощник гномик Вилли. Носить с собой , просить о помощи в любой момент, он всегда поможет.', 'jewelry', '/images/products/brelok-gnomik.webp', '["/images/products/brelok-gnomik.webp","/images/products/brelok-gnomik-2.webp","/images/products/brelok-gnomik-3.webp","/images/products/brelok-gnomik-4.webp","/images/products/brelok-gnomik-5.webp"]', 1500, 1, 320
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Брелок гномик Выборгский' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Сова, ковка', 'Шикарные цвета побежалости , кованная сова ручной работы. Украсит любой интерьер , очень хорошо впишется в гостиную или кабинет. 29 см в высоту , работа тяжелая , при доставка нужно будет учесть это.', 'forge', '/images/products/sova-kovka.webp', '["/images/products/sova-kovka.webp","/images/products/sova-kovka-2.webp","/images/products/sova-kovka-3.webp","/images/products/sova-kovka-4.webp"]', 6500, 1, 330
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Сова, ковка' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Собака Ева, ковка', 'Кованая собака Ева. Авторская работа кузнеца.', 'forge', '/images/products/sobaka-eva.webp', '["/images/products/sobaka-eva.webp","/images/products/sobaka-eva-2.webp","/images/products/sobaka-eva-3.webp"]', 2500, 1, 340
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Собака Ева, ковка' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT '«Мне только спросить», ковка', 'Кованая авторская работа. Эмоции в металле, проработанные детали и лёгкий юмор. Хорошая идея подарка.', 'forge', '/images/products/mne-tolko-sprosit.webp', '["/images/products/mne-tolko-sprosit.webp","/images/products/mne-tolko-sprosit-2.webp","/images/products/mne-tolko-sprosit-3.webp","/images/products/mne-tolko-sprosit-4.webp"]', 25000, 1, 350
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '«Мне только спросить», ковка' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Магические шаманы-лисицы', 'Необыкновенные работы, полностью подвижные куклы, искусственный мех, стеклянные глаза, лисы принимают любую позу. Размер около 50 см в высоту', 'dolls', '/images/products/shamany-lisitsy.webp', '["/images/products/shamany-lisitsy.webp","/images/products/shamany-lisitsy-2.webp","/images/products/shamany-lisitsy-3.webp","/images/products/shamany-lisitsy-4.webp"]', 22000, 1, 360
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Магические шаманы-лисицы' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'А пони тоже кони', 'Пони ручной работы. Конечности подвижны, одежда снимается. Ищет своего человека.', 'dolls', '/images/products/poni.webp', '["/images/products/poni.webp","/images/products/poni-2.webp","/images/products/poni-3.webp","/images/products/poni-4.webp"]', 13000, 1, 370
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'А пони тоже кони' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Ворона Каркуша', 'Ворона Каркуша! Хозяйственная и домовитая, ищет семью чтобы накаркать ей счастье.', 'dolls', '/images/products/vorona-karkusha.webp', '["/images/products/vorona-karkusha.webp","/images/products/vorona-karkusha-2.webp","/images/products/vorona-karkusha-3.webp","/images/products/vorona-karkusha-4.webp","/images/products/vorona-karkusha-5.webp"]', 2400, 1, 380
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ворона Каркуша' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Кролик ручной работы', 'Сшитый вручную с большой любовью, уютный кролик. Подходит и как интерьерная игрушка и как игрушка для ребенка. Лапки подвижны , ушки сгибаются. Тактильно прекрасен, внешне просто волшебный.', 'dolls', '/images/products/krolik.webp', '["/images/products/krolik.webp","/images/products/krolik-2.webp","/images/products/krolik-3.webp","/images/products/krolik-4.webp","/images/products/krolik-5.webp"]', 2800, 1, 390
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Кролик ручной работы' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Игрушка коллекционная — под заказ', 'Нереально милый медвежонок ищет семью. Сшит вручную, все части тела подвижны. Одежда снимается. Такую игрушку приятно взять в руки, да это и не просто игрушка , это душа мастера в работе.', 'dolls', '/images/products/igrushka-medved.webp', '["/images/products/igrushka-medved.webp","/images/products/igrushka-medved-2.webp","/images/products/igrushka-medved-3.webp","/images/products/igrushka-medved-4.webp","/images/products/igrushka-medved-5.webp"]', 13500, 1, 400
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Игрушка коллекционная — под заказ' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Исторические куклы', 'Кукла в историческом костюме.', 'dolls', '/images/products/istoricheskie-kukly.webp', '["/images/products/istoricheskie-kukly.webp","/images/products/istoricheskie-kukly-2.webp","/images/products/istoricheskie-kukly-3.webp"]', 4750, 1, 410
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Исторические куклы' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Баба Яга — под заказ', 'Бабка ежка , самая лучшая на свете женщина', 'dolls', '/images/products/baba-yaga.webp', '["/images/products/baba-yaga.webp","/images/products/baba-yaga-2.webp","/images/products/baba-yaga-3.webp","/images/products/baba-yaga-4.webp"]', 5000, 1, 420
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Баба Яга — под заказ' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Семечко вашего будущего дома', 'Символическое семечко вашего будущего дома. Вы приобретаете домик и начинаете делать добрые дела. Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , дом у вас появится. Вы его купите, построите, унаследуете и т.д. Это может быть дом, дача, квартира или коттедж. Все о чем вы мечтаете или что для вас сейчас символ дома. Чудеса там где в них верят.', 'seeds', '/images/products/semechko-doma.webp', '["/images/products/semechko-doma.webp","/images/products/semechko-doma-2.webp","/images/products/semechko-doma-3.webp"]', 500, 1, 430
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Семечко вашего будущего дома' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Семечко будущего дома (мини)', 'Символическое семечко вашего будущего дома. Вы приобретаете домик и начинаете делать добрые дела. Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , дом у вас появится. Вы его купите, построите, унаследуете и т.д. Это может быть дом, дача, квартира или коттедж. Все о чем вы мечтаете или что для вас сейчас символ дома. Чудеса там где в них верят.', 'seeds', '/images/products/semechko-doma-mini.webp', '["/images/products/semechko-doma-mini.webp","/images/products/semechko-doma-mini-2.webp","/images/products/semechko-doma-mini-3.webp","/images/products/semechko-doma-mini-4.webp"]', 300, 1, 440
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Семечко будущего дома (мини)' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Семечко вашего будущего дела', 'Символическое семечко вашего будущего собственного дела, бизнеса. Вы приобретаете мельницу и начинаете делать добрые дела. Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , Ваше собственное дело начнет расти и приносить доходы. Мельница, как символ успешной работы, очень сильный талисман! И помните, дорогу осилит идущий. Чудеса там где в них верят.', 'seeds', '/images/products/semechko-dela.webp', '["/images/products/semechko-dela.webp","/images/products/semechko-dela-2.webp","/images/products/semechko-dela-3.webp","/images/products/semechko-dela-4.webp","/images/products/semechko-dela-6.webp"]', 700, 1, 450
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Семечко вашего будущего дела' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Кедр — семейный талисман', 'Пара из кедра, двое как единое целое. Две половинки связаны между собой кожаным шнурком, как нерушимыми узами любви. Мощный семейный оберег. К каждому изделию прилагается паспорт изделия от мастерской.', 'wood', '/images/products/kedr-talisman.webp', '["/images/products/kedr-talisman.webp","/images/products/kedr-talisman-2.webp","/images/products/kedr-talisman-3.webp"]', 1500, 1, 460
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Кедр — семейный талисман' LIMIT 1);

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT 'Духи', 'Шикарные не на что не похожие ароматы из Карелии. Стойкость 100 лет не меньше :)', 'perfume', '/images/products/duhi.webp', '["/images/products/duhi.webp","/images/products/duhi-2.webp","/images/products/duhi-3.webp"]', 2000, 1, 470
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Духи' LIMIT 1);

