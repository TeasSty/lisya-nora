-- Hidden VK market products (market.get offset≥24) + carousel upgrades for forge pieces.

UPDATE products SET
  image_url = '/images/products/mne-tolko-sprosit.webp',
  image_urls = json_array('/images/products/mne-tolko-sprosit.webp', '/images/products/mne-tolko-sprosit-2.webp', '/images/products/mne-tolko-sprosit-3.webp', '/images/products/mne-tolko-sprosit-4.webp'),
  description = 'Кованая авторская  работа, фигура «мне только спросить».  Эмоции в металле, проработанные детали и легкий юмор.  Прекрасная идея подарка.',
  price_rub = 25000
WHERE name = '«Мне только спросить», ковка';

UPDATE products SET
  image_url = '/images/products/sobaka-eva.webp',
  image_urls = json_array('/images/products/sobaka-eva.webp', '/images/products/sobaka-eva-2.webp', '/images/products/sobaka-eva-3.webp'),
  description = 'Кованая собака Ева. Авторская работа кузнеца.',
  price_rub = 2500
WHERE name = 'Собака Ева, ковка';

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Семечко будущего дома (мини)',
  'Символическое семечко вашего будущего дома.  Вы приобретаете домик и начинаете делать добрые дела. Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , дом у вас появится.  Вы его купите, построите, унаследуете и т.д. Это может быть дом, дача, квартира или коттедж. Все о чем вы мечтаете или что для вас сейчас символ дома.  Чудеса там где в них верят.',
  'seeds',
  '/images/products/semechko-doma-mini.webp',
  json_array('/images/products/semechko-doma-mini.webp', '/images/products/semechko-doma-mini-2.webp', '/images/products/semechko-doma-mini-3.webp', '/images/products/semechko-doma-mini-4.webp'),
  300,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Семечко будущего дома (мини)');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Семечко вашего будущего дела',
  'Символическое семечко вашего будущего собственного дела, бизнеса. Вы приобретаете мельницу и начинаете делать добрые дела.  Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , Ваше собственное дело начнет расти и приносить доходы.  Мельница, как символ успешной работы, очень сильный талисман! И помните, дорогу осилит идущий.   Чудеса там где в них верят.',
  'seeds',
  '/images/products/semechko-dela.webp',
  json_array('/images/products/semechko-dela.webp', '/images/products/semechko-dela-2.webp', '/images/products/semechko-dela-3.webp', '/images/products/semechko-dela-4.webp', '/images/products/semechko-dela-6.webp'),
  700,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Семечко вашего будущего дела');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Керамический конь',
  'Керамическая фигурка коня.  Издревле конь считался главным оберегом с жизни человека.  Он был другом и защитником.  Сейчас же фигура коня дарится  тому, кто хочет добиться успеха.',
  'ceramics',
  '/images/products/keramicheskiy-kon.webp',
  json_array('/images/products/keramicheskiy-kon.webp', '/images/products/keramicheskiy-kon-2.webp', '/images/products/keramicheskiy-kon-3.webp', '/images/products/keramicheskiy-kon-4.webp'),
  8000,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Керамический конь');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Свистулька-кот, глина',
  'Глиняная свистулька котик, ручная работа.',
  'ceramics',
  '/images/products/svistulka-kot.webp',
  json_array('/images/products/svistulka-kot.webp', '/images/products/svistulka-kot-2.webp', '/images/products/svistulka-kot-3.webp', '/images/products/svistulka-kot-4.webp'),
  900,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Свистулька-кот, глина');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Светильник, керамика',
  'Светильник домик, ручная работа, керамика. Работает от сети 220 вольт, внутри светодиод.  Очень уютный свет, уникальное дизайнерское решение.',
  'ceramics',
  '/images/products/svetilnik-keramika.webp',
  json_array('/images/products/svetilnik-keramika.webp', '/images/products/svetilnik-keramika-2.webp', '/images/products/svetilnik-keramika-3.webp'),
  11800,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Светильник, керамика');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Сувенир из керамики',
  'Прекрасный подарок , керамика ручная работа',
  'ceramics',
  '/images/products/suvenir-keramika.webp',
  json_array('/images/products/suvenir-keramika.webp', '/images/products/suvenir-keramika-2.webp', '/images/products/suvenir-keramika-4.webp'),
  1200,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Сувенир из керамики');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Фигурка моряка',
  'Шикарная работа , фигурка моряка, выполнена из керамики',
  'dolls',
  '/images/products/figurka-moryaka.webp',
  json_array('/images/products/figurka-moryaka.webp', '/images/products/figurka-moryaka-2.webp', '/images/products/figurka-moryaka-3.webp'),
  30000,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Фигурка моряка');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Домик-светильник, керамика',
  'Светильник домик, ручная работа, керамика. Работает от сети 220 вольт, внутри светодиод. Очень уютный свет, уникальное дизайнерское решение.  Около 30 см.',
  'ceramics',
  '/images/products/domik-svetilnik.webp',
  json_array('/images/products/domik-svetilnik.webp', '/images/products/domik-svetilnik-2.webp', '/images/products/domik-svetilnik-3.webp', '/images/products/domik-svetilnik-4.webp'),
  11800,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Домик-светильник, керамика');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Брелок гномик Выборгский',
  'Связанный вручную, маленький персональный помощник гномик Вилли.  Носить с собой , просить о помощи в любой момент, он всегда поможет.',
  'jewelry',
  '/images/products/brelok-gnomik.webp',
  json_array('/images/products/brelok-gnomik.webp', '/images/products/brelok-gnomik-2.webp', '/images/products/brelok-gnomik-3.webp', '/images/products/brelok-gnomik-4.webp', '/images/products/brelok-gnomik-5.webp'),
  1500,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Брелок гномик Выборгский');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Гномик Выборгский Вилли',
  'Связанный вручную, маленький персональный помощник гномик Вилли.  Носить с собой , просить о помощи в любой момент, он всегда поможет.',
  'dolls',
  '/images/products/gnomik-villi.webp',
  json_array('/images/products/gnomik-villi.webp', '/images/products/gnomik-villi-2.webp', '/images/products/gnomik-villi-3.webp', '/images/products/gnomik-villi-4.webp', '/images/products/gnomik-villi-5.webp'),
  1500,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Гномик Выборгский Вилли');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Лягушка Подсказушка',
  'Связанная вручную игрушка , брелок.  Лягушка Подсказушка, помогает принимать решения.  Спросите у вашего помощника Подсказушки, как поступить и первое что придет вам в голову это и есть верное решение.',
  'jewelry',
  '/images/products/lyagushka-podskazushka.webp',
  json_array('/images/products/lyagushka-podskazushka.webp', '/images/products/lyagushka-podskazushka-2.webp', '/images/products/lyagushka-podskazushka-3.webp'),
  1500,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Лягушка Подсказушка');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Брошки вязаные',
  'Вязаные брошки ручной работы.',
  'jewelry',
  '/images/products/broshki-vyazanye.webp',
  json_array('/images/products/broshki-vyazanye.webp', '/images/products/broshki-vyazanye-2.webp', '/images/products/broshki-vyazanye-3.webp'),
  1700,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Брошки вязаные');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Брошка-брелок',
  'Шикарный мухомор 🍄, для тех кто хочет привлечь деньги.',
  'jewelry',
  '/images/products/broshka-brelok.webp',
  json_array('/images/products/broshka-brelok.webp', '/images/products/broshka-brelok-2.webp', '/images/products/broshka-brelok-3.webp', '/images/products/broshka-brelok-4.webp'),
  1500,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Брошка-брелок');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Мухомор-колокольчик, керамика',
  'Волшебный мухомор колокольчик, звенит к богатству.',
  'ceramics',
  '/images/products/muhomor-kolokolchik.webp',
  json_array('/images/products/muhomor-kolokolchik.webp', '/images/products/muhomor-kolokolchik-2.webp', '/images/products/muhomor-kolokolchik-3.webp', '/images/products/muhomor-kolokolchik-4.webp'),
  1300,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Мухомор-колокольчик, керамика');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Желудь, керамика',
  'Желудь издревле носили в кармане, для привлечения удачи.',
  'ceramics',
  '/images/products/zhelud-keramika.webp',
  json_array('/images/products/zhelud-keramika.webp', '/images/products/zhelud-keramika-2.webp', '/images/products/zhelud-keramika-3.webp', '/images/products/zhelud-keramika-4.webp'),
  1200,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Желудь, керамика');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Мухомор на удачу',
  'Мухомор 🍄 ручная работа',
  'ceramics',
  '/images/products/muhomor-na-udachu.webp',
  json_array('/images/products/muhomor-na-udachu.webp', '/images/products/muhomor-na-udachu-2.webp', '/images/products/muhomor-na-udachu-3.webp'),
  1700,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Мухомор на удачу');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Светильник-домик, керамика',
  'Керамический домик светильник , внутри светодиод, светит достаточно ярко и создает в комнате волшебную атмосферу уюта.',
  'ceramics',
  '/images/products/svetilnik-domik.webp',
  json_array('/images/products/svetilnik-domik.webp', '/images/products/svetilnik-domik-2.webp', '/images/products/svetilnik-domik-3.webp'),
  11000,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Светильник-домик, керамика');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Лисы из папье-маше',
  'Очаровательные лисы из папье-маше , ручная работа',
  'dolls',
  '/images/products/lisy-pape-mashe.webp',
  json_array('/images/products/lisy-pape-mashe.webp', '/images/products/lisy-pape-mashe-2.webp', '/images/products/lisy-pape-mashe-3.webp', '/images/products/lisy-pape-mashe-4.webp', '/images/products/lisy-pape-mashe-6.webp'),
  1100,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Лисы из папье-маше');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Бабка Ёжка и Лоухи',
  'Бабки Ёжки и Лоухи, куклы ручной работы, цена от 2300 до 4500. Зависит от размера куклы. Чудесная идея для подарка.',
  'dolls',
  '/images/products/babka-yozhka-louhi.webp',
  json_array('/images/products/babka-yozhka-louhi.webp', '/images/products/babka-yozhka-louhi-2.webp', '/images/products/babka-yozhka-louhi-3.webp', '/images/products/babka-yozhka-louhi-4.webp', '/images/products/babka-yozhka-louhi-5.webp'),
  3000,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Бабка Ёжка и Лоухи');

INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT
  'Странники',
  'Куклы странники, ошеломительно прекрасные работы , прекрасный подарок коллекционеру и просто человеку понимающему. Цены разные , ассортимент тоже меняется.',
  'dolls',
  '/images/products/stranniki.webp',
  json_array('/images/products/stranniki.webp', '/images/products/stranniki-2.webp', '/images/products/stranniki-3.webp'),
  10000,
  1,
  200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Странники');

