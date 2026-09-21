import { assetPath } from '../lib/assetPath'
import type { Product } from '../lib/types'

// Полный ассортимент VK Market (47 позиций, market.get + anonym token).
// Витрина без скролла отдаёт только первые 24; остальные — со 2-й страницы API.
export const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Ворона красотка',
    description: 'Она шикарна',
    category: 'dolls',
    imageUrl: assetPath('images/products/vorona-krasotka.webp'),
    imageUrls: [
      assetPath('images/products/vorona-krasotka.webp')
    ],
    priceRub: 3500,
  },
  {
    id: 2,
    name: 'Семейство Ворон',
    description: 'Семейка ищет свою семью',
    category: 'dolls',
    imageUrl: assetPath('images/products/semeystvo-voron.webp'),
    imageUrls: [
      assetPath('images/products/semeystvo-voron.webp')
    ],
    priceRub: 5000,
  },
  {
    id: 3,
    name: 'Странники',
    description: 'Куклы странники, ошеломительно прекрасные работы , прекрасный подарок коллекционеру и просто человеку понимающему. Цены разные , ассортимент тоже меняется.',
    category: 'dolls',
    imageUrl: assetPath('images/products/stranniki.webp'),
    imageUrls: [
      assetPath('images/products/stranniki.webp'),
      assetPath('images/products/stranniki-2.webp'),
      assetPath('images/products/stranniki-3.webp')
    ],
    priceRub: 10000,
  },
  {
    id: 4,
    name: 'Бабка Ёжка и Лоухи',
    description: 'Бабки Ёжки и Лоухи, куклы ручной работы, цена от 2300 до 4500. Зависит от размера куклы. Чудесная идея для подарка.',
    category: 'dolls',
    imageUrl: assetPath('images/products/babka-yozhka-louhi.webp'),
    imageUrls: [
      assetPath('images/products/babka-yozhka-louhi.webp'),
      assetPath('images/products/babka-yozhka-louhi-2.webp'),
      assetPath('images/products/babka-yozhka-louhi-3.webp'),
      assetPath('images/products/babka-yozhka-louhi-4.webp'),
      assetPath('images/products/babka-yozhka-louhi-5.webp')
    ],
    priceRub: 3000,
  },
  {
    id: 5,
    name: 'Лисы из папье-маше',
    description: 'Очаровательные лисы из папье-маше , ручная работа',
    category: 'dolls',
    imageUrl: assetPath('images/products/lisy-pape-mashe.webp'),
    imageUrls: [
      assetPath('images/products/lisy-pape-mashe.webp'),
      assetPath('images/products/lisy-pape-mashe-2.webp'),
      assetPath('images/products/lisy-pape-mashe-3.webp'),
      assetPath('images/products/lisy-pape-mashe-4.webp'),
      assetPath('images/products/lisy-pape-mashe-6.webp')
    ],
    priceRub: 1100,
  },
  {
    id: 6,
    name: 'Гномик Выборгский Вилли',
    description: 'Связанный вручную, маленький персональный помощник гномик Вилли. Носить с собой , просить о помощи в любой момент, он всегда поможет.',
    category: 'dolls',
    imageUrl: assetPath('images/products/gnomik-villi.webp'),
    imageUrls: [
      assetPath('images/products/gnomik-villi.webp'),
      assetPath('images/products/gnomik-villi-2.webp'),
      assetPath('images/products/gnomik-villi-3.webp'),
      assetPath('images/products/gnomik-villi-4.webp'),
      assetPath('images/products/gnomik-villi-5.webp')
    ],
    priceRub: 1500,
  },
  {
    id: 7,
    name: 'Фигурка моряка',
    description: 'Шикарная работа , фигурка моряка, выполнена из керамики',
    category: 'dolls',
    imageUrl: assetPath('images/products/figurka-moryaka.webp'),
    imageUrls: [
      assetPath('images/products/figurka-moryaka.webp'),
      assetPath('images/products/figurka-moryaka-2.webp'),
      assetPath('images/products/figurka-moryaka-3.webp')
    ],
    priceRub: 30000,
  },
  {
    id: 8,
    name: 'Чудо Мишаня',
    description: 'Чудо чудное и диво дивное, полностью ручная работа, медвежонок Мишаня. Лапки и голова подвижные , одежда снимается. Ищет только любящую семью.',
    category: 'dolls',
    imageUrl: assetPath('images/products/chudo-mishanya.webp'),
    imageUrls: [
      assetPath('images/products/chudo-mishanya.webp'),
      assetPath('images/products/chudo-mishanya-2.webp'),
      assetPath('images/products/chudo-mishanya-3.webp'),
      assetPath('images/products/chudo-mishanya-4.webp')
    ],
    priceRub: 13000,
  },
  {
    id: 9,
    name: 'Всячница керамика',
    description: 'Керамика ручная работа',
    category: 'ceramics',
    imageUrl: assetPath('images/products/vsyachnitsa-keramika.webp'),
    imageUrls: [
      assetPath('images/products/vsyachnitsa-keramika.webp'),
      assetPath('images/products/vsyachnitsa-keramika-2.webp'),
      assetPath('images/products/vsyachnitsa-keramika-3.webp')
    ],
    priceRub: 16000,
  },
  {
    id: 10,
    name: 'Всячница керамика',
    description: 'Всячница из керамики, ручная работа. Очень красивые овечки и козочки, все работы уникальны и прекрасны. Чудесная идея для подарка. Подойдут как фруктовница, конфетница, ваза или кашпо.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/vsyachnitsa-ovechki.webp'),
    imageUrls: [
      assetPath('images/products/vsyachnitsa-ovechki.webp'),
      assetPath('images/products/vsyachnitsa-ovechki-2.webp'),
      assetPath('images/products/vsyachnitsa-ovechki-3.webp'),
      assetPath('images/products/vsyachnitsa-ovechki-4.webp')
    ],
    priceRub: 16000,
  },
  {
    id: 11,
    name: 'Керамика-всячница, символ 2027 года',
    description: 'Интерьерная работа из керамики. Просто потрясающая детализация.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/keramika-vsyachnitsa-2027.webp'),
    imageUrls: [
      assetPath('images/products/keramika-vsyachnitsa-2027.webp'),
      assetPath('images/products/keramika-vsyachnitsa-2027-2.webp'),
      assetPath('images/products/keramika-vsyachnitsa-2027-3.webp')
    ],
    priceRub: 18500,
  },
  {
    id: 12,
    name: 'Лошадки, керамика',
    description: 'Лошадки керамика для ценителей необычного.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/loshadki-keramika.webp'),
    imageUrls: [
      assetPath('images/products/loshadki-keramika.webp')
    ],
    priceRub: 6500,
  },
  {
    id: 13,
    name: 'Керамические фигурки: драконы и лошади',
    description: 'Исключительно ручная работа, керамика с душой.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/keramicheskie-figurki.webp'),
    imageUrls: [
      assetPath('images/products/keramicheskie-figurki.webp'),
      assetPath('images/products/keramicheskie-figurki-2.webp'),
      assetPath('images/products/keramicheskie-figurki-3.webp')
    ],
    priceRub: 9000,
  },
  {
    id: 14,
    name: 'Керамический конь',
    description: 'Керамическая фигурка коня. Издревле конь считался главным оберегом с жизни человека. Он был другом и защитником. Сейчас же фигура коня дарится тому, кто хочет добиться успеха.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/keramicheskiy-kon.webp'),
    imageUrls: [
      assetPath('images/products/keramicheskiy-kon.webp'),
      assetPath('images/products/keramicheskiy-kon-2.webp'),
      assetPath('images/products/keramicheskiy-kon-3.webp'),
      assetPath('images/products/keramicheskiy-kon-4.webp')
    ],
    priceRub: 8000,
  },
  {
    id: 15,
    name: 'Светильник-домик, керамика',
    description: 'Керамический домик светильник , внутри светодиод, светит достаточно ярко и создает в комнате волшебную атмосферу уюта.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/svetilnik-domik.webp'),
    imageUrls: [
      assetPath('images/products/svetilnik-domik.webp'),
      assetPath('images/products/svetilnik-domik-2.webp'),
      assetPath('images/products/svetilnik-domik-3.webp')
    ],
    priceRub: 11000,
  },
  {
    id: 16,
    name: 'Домик-светильник, керамика',
    description: 'Светильник домик, ручная работа, керамика. Работает от сети 220 вольт, внутри светодиод. Очень уютный свет, уникальное дизайнерское решение. Около 30 см.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/domik-svetilnik.webp'),
    imageUrls: [
      assetPath('images/products/domik-svetilnik.webp'),
      assetPath('images/products/domik-svetilnik-2.webp'),
      assetPath('images/products/domik-svetilnik-3.webp'),
      assetPath('images/products/domik-svetilnik-4.webp')
    ],
    priceRub: 11800,
  },
  {
    id: 17,
    name: 'Светильник, керамика',
    description: 'Светильник домик, ручная работа, керамика. Работает от сети 220 вольт, внутри светодиод. Очень уютный свет, уникальное дизайнерское решение.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/svetilnik-keramika.webp'),
    imageUrls: [
      assetPath('images/products/svetilnik-keramika.webp'),
      assetPath('images/products/svetilnik-keramika-2.webp'),
      assetPath('images/products/svetilnik-keramika-3.webp')
    ],
    priceRub: 11800,
  },
  {
    id: 18,
    name: 'Мухомор на удачу',
    description: 'Мухомор 🍄 ручная работа',
    category: 'ceramics',
    imageUrl: assetPath('images/products/muhomor-na-udachu.webp'),
    imageUrls: [
      assetPath('images/products/muhomor-na-udachu.webp'),
      assetPath('images/products/muhomor-na-udachu-2.webp'),
      assetPath('images/products/muhomor-na-udachu-3.webp')
    ],
    priceRub: 1700,
  },
  {
    id: 19,
    name: 'Мухомор-колокольчик, керамика',
    description: 'Волшебный мухомор колокольчик, звенит к богатству.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/muhomor-kolokolchik.webp'),
    imageUrls: [
      assetPath('images/products/muhomor-kolokolchik.webp'),
      assetPath('images/products/muhomor-kolokolchik-2.webp'),
      assetPath('images/products/muhomor-kolokolchik-3.webp'),
      assetPath('images/products/muhomor-kolokolchik-4.webp')
    ],
    priceRub: 1300,
  },
  {
    id: 20,
    name: 'Желудь, керамика',
    description: 'Желудь издревле носили в кармане, для привлечения удачи.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/zhelud-keramika.webp'),
    imageUrls: [
      assetPath('images/products/zhelud-keramika.webp'),
      assetPath('images/products/zhelud-keramika-2.webp'),
      assetPath('images/products/zhelud-keramika-3.webp'),
      assetPath('images/products/zhelud-keramika-4.webp')
    ],
    priceRub: 1200,
  },
  {
    id: 21,
    name: 'Сувенир из керамики',
    description: 'Прекрасный подарок , керамика ручная работа',
    category: 'ceramics',
    imageUrl: assetPath('images/products/suvenir-keramika.webp'),
    imageUrls: [
      assetPath('images/products/suvenir-keramika.webp'),
      assetPath('images/products/suvenir-keramika-2.webp'),
      assetPath('images/products/suvenir-keramika-4.webp')
    ],
    priceRub: 1200,
  },
  {
    id: 22,
    name: 'Свистулька-кот, глина',
    description: 'Глиняная свистулька котик, ручная работа.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/svistulka-kot.webp'),
    imageUrls: [
      assetPath('images/products/svistulka-kot.webp'),
      assetPath('images/products/svistulka-kot-2.webp'),
      assetPath('images/products/svistulka-kot-3.webp'),
      assetPath('images/products/svistulka-kot-4.webp')
    ],
    priceRub: 900,
  },
  {
    id: 23,
    name: 'Панно керамика с деревом',
    description: 'Панно ручная работа, разные сюжеты с природой Карельского перешейка.',
    category: 'ceramics',
    imageUrl: assetPath('images/products/panno-derevo.webp'),
    imageUrls: [
      assetPath('images/products/panno-derevo.webp'),
      assetPath('images/products/panno-derevo-2.webp'),
      assetPath('images/products/panno-derevo-3.webp'),
      assetPath('images/products/panno-derevo-4.webp'),
      assetPath('images/products/panno-derevo-5.webp')
    ],
    priceRub: 2900,
  },
  {
    id: 24,
    name: 'Уникальные украшения из осколков старинной посуды',
    description: 'Каждая работа уникальна',
    category: 'jewelry',
    imageUrl: assetPath('images/products/unikalnye-ukrashenia.webp'),
    imageUrls: [
      assetPath('images/products/unikalnye-ukrashenia.webp'),
      assetPath('images/products/unikalnye-ukrashenia-2.webp'),
      assetPath('images/products/unikalnye-ukrashenia-3.webp'),
      assetPath('images/products/unikalnye-ukrashenia-4.webp'),
      assetPath('images/products/unikalnye-ukrashenia-5.webp')
    ],
    priceRub: 1100,
  },
  {
    id: 25,
    name: 'Украшения из фрагментов фарфоровой посуды',
    description: 'Потрясающие украшения из битых старинных тарелочек. Это нечто очень особенное, для избранных ценителей.',
    category: 'jewelry',
    imageUrl: assetPath('images/products/ukrashenia-farfor.webp'),
    imageUrls: [
      assetPath('images/products/ukrashenia-farfor.webp'),
      assetPath('images/products/ukrashenia-farfor-2.webp'),
      assetPath('images/products/ukrashenia-farfor-3.webp'),
      assetPath('images/products/ukrashenia-farfor-4.webp')
    ],
    priceRub: 1100,
  },
  {
    id: 26,
    name: 'Венок из кожаных цветов',
    description: 'Веночек на голову из кожаных цветов. Эксклюзивный аксессуар. Цены от 1800 до 3000 руб.',
    category: 'jewelry',
    imageUrl: assetPath('images/products/venok-kozhanyh-tsvetov.webp'),
    imageUrls: [
      assetPath('images/products/venok-kozhanyh-tsvetov.webp'),
      assetPath('images/products/venok-kozhanyh-tsvetov-2.webp'),
      assetPath('images/products/venok-kozhanyh-tsvetov-3.webp'),
      assetPath('images/products/venok-kozhanyh-tsvetov-4.webp')
    ],
    priceRub: 3000,
  },
  {
    id: 27,
    name: 'Броши из кожи',
    description: 'Броши ручной работы, кожа. Ассортимент постоянно пополняется. Цены от 900 руб. Средняя цена 1500 руб. Фото по запросу.',
    category: 'jewelry',
    imageUrl: assetPath('images/products/broshi-kozha.webp'),
    imageUrls: [
      assetPath('images/products/broshi-kozha.webp'),
      assetPath('images/products/broshi-kozha-2.webp'),
      assetPath('images/products/broshi-kozha-3.webp'),
      assetPath('images/products/broshi-kozha-4.webp'),
      assetPath('images/products/broshi-kozha-5.webp')
    ],
    priceRub: 1600,
  },
  {
    id: 28,
    name: 'Брошка керамика',
    description: 'Брошка керамическая, ручная работа',
    category: 'jewelry',
    imageUrl: assetPath('images/products/broshka-keramika.webp'),
    imageUrls: [
      assetPath('images/products/broshka-keramika.webp'),
      assetPath('images/products/broshka-keramika-2.webp'),
      assetPath('images/products/broshka-keramika-3.webp')
    ],
    priceRub: 500,
  },
  {
    id: 29,
    name: 'Брошка-брелок',
    description: 'Шикарный мухомор 🍄, для тех кто хочет привлечь деньги.',
    category: 'jewelry',
    imageUrl: assetPath('images/products/broshka-brelok.webp'),
    imageUrls: [
      assetPath('images/products/broshka-brelok.webp'),
      assetPath('images/products/broshka-brelok-2.webp'),
      assetPath('images/products/broshka-brelok-3.webp'),
      assetPath('images/products/broshka-brelok-4.webp')
    ],
    priceRub: 1500,
  },
  {
    id: 30,
    name: 'Брошки вязаные',
    description: 'Вязаные брошки ручной работы.',
    category: 'jewelry',
    imageUrl: assetPath('images/products/broshki-vyazanye.webp'),
    imageUrls: [
      assetPath('images/products/broshki-vyazanye.webp'),
      assetPath('images/products/broshki-vyazanye-2.webp'),
      assetPath('images/products/broshki-vyazanye-3.webp')
    ],
    priceRub: 1700,
  },
  {
    id: 31,
    name: 'Лягушка Подсказушка',
    description: 'Связанная вручную игрушка , брелок. Лягушка Подсказушка, помогает принимать решения. Спросите у вашего помощника Подсказушки, как поступить и первое что придет вам в голову это и есть верное решение.',
    category: 'jewelry',
    imageUrl: assetPath('images/products/lyagushka-podskazushka.webp'),
    imageUrls: [
      assetPath('images/products/lyagushka-podskazushka.webp'),
      assetPath('images/products/lyagushka-podskazushka-2.webp'),
      assetPath('images/products/lyagushka-podskazushka-3.webp')
    ],
    priceRub: 1500,
  },
  {
    id: 32,
    name: 'Брелок гномик Выборгский',
    description: 'Связанный вручную, маленький персональный помощник гномик Вилли. Носить с собой , просить о помощи в любой момент, он всегда поможет.',
    category: 'jewelry',
    imageUrl: assetPath('images/products/brelok-gnomik.webp'),
    imageUrls: [
      assetPath('images/products/brelok-gnomik.webp'),
      assetPath('images/products/brelok-gnomik-2.webp'),
      assetPath('images/products/brelok-gnomik-3.webp'),
      assetPath('images/products/brelok-gnomik-4.webp'),
      assetPath('images/products/brelok-gnomik-5.webp')
    ],
    priceRub: 1500,
  },
  {
    id: 33,
    name: 'Сова, ковка',
    description: 'Шикарные цвета побежалости , кованная сова ручной работы. Украсит любой интерьер , очень хорошо впишется в гостиную или кабинет. 29 см в высоту , работа тяжелая , при доставка нужно будет учесть это.',
    category: 'forge',
    imageUrl: assetPath('images/products/sova-kovka.webp'),
    imageUrls: [
      assetPath('images/products/sova-kovka.webp'),
      assetPath('images/products/sova-kovka-2.webp'),
      assetPath('images/products/sova-kovka-3.webp'),
      assetPath('images/products/sova-kovka-4.webp')
    ],
    priceRub: 6500,
  },
  {
    id: 34,
    name: 'Собака Ева, ковка',
    description: 'Кованая собака Ева. Авторская работа кузнеца.',
    category: 'forge',
    imageUrl: assetPath('images/products/sobaka-eva.webp'),
    imageUrls: [
      assetPath('images/products/sobaka-eva.webp'),
      assetPath('images/products/sobaka-eva-2.webp'),
      assetPath('images/products/sobaka-eva-3.webp')
    ],
    priceRub: 2500,
  },
  {
    id: 35,
    name: '«Мне только спросить», ковка',
    description: 'Кованая авторская работа. Эмоции в металле, проработанные детали и лёгкий юмор. Хорошая идея подарка.',
    category: 'forge',
    imageUrl: assetPath('images/products/mne-tolko-sprosit.webp'),
    imageUrls: [
      assetPath('images/products/mne-tolko-sprosit.webp'),
      assetPath('images/products/mne-tolko-sprosit-2.webp'),
      assetPath('images/products/mne-tolko-sprosit-3.webp'),
      assetPath('images/products/mne-tolko-sprosit-4.webp')
    ],
    priceRub: 25000,
  },
  {
    id: 36,
    name: 'Магические шаманы-лисицы',
    description: 'Необыкновенные работы, полностью подвижные куклы, искусственный мех, стеклянные глаза, лисы принимают любую позу. Размер около 50 см в высоту',
    category: 'dolls',
    imageUrl: assetPath('images/products/shamany-lisitsy.webp'),
    imageUrls: [
      assetPath('images/products/shamany-lisitsy.webp'),
      assetPath('images/products/shamany-lisitsy-2.webp'),
      assetPath('images/products/shamany-lisitsy-3.webp'),
      assetPath('images/products/shamany-lisitsy-4.webp')
    ],
    priceRub: 22000,
  },
  {
    id: 37,
    name: 'А пони тоже кони',
    description: 'Пони ручной работы. Конечности подвижны, одежда снимается. Ищет своего человека.',
    category: 'dolls',
    imageUrl: assetPath('images/products/poni.webp'),
    imageUrls: [
      assetPath('images/products/poni.webp'),
      assetPath('images/products/poni-2.webp'),
      assetPath('images/products/poni-3.webp'),
      assetPath('images/products/poni-4.webp')
    ],
    priceRub: 13000,
  },
  {
    id: 38,
    name: 'Ворона Каркуша',
    description: 'Ворона Каркуша! Хозяйственная и домовитая, ищет семью чтобы накаркать ей счастье.',
    category: 'dolls',
    imageUrl: assetPath('images/products/vorona-karkusha.webp'),
    imageUrls: [
      assetPath('images/products/vorona-karkusha.webp'),
      assetPath('images/products/vorona-karkusha-2.webp'),
      assetPath('images/products/vorona-karkusha-3.webp'),
      assetPath('images/products/vorona-karkusha-4.webp'),
      assetPath('images/products/vorona-karkusha-5.webp')
    ],
    priceRub: 2400,
  },
  {
    id: 39,
    name: 'Кролик ручной работы',
    description: 'Сшитый вручную с большой любовью, уютный кролик. Подходит и как интерьерная игрушка и как игрушка для ребенка. Лапки подвижны , ушки сгибаются. Тактильно прекрасен, внешне просто волшебный.',
    category: 'dolls',
    imageUrl: assetPath('images/products/krolik.webp'),
    imageUrls: [
      assetPath('images/products/krolik.webp'),
      assetPath('images/products/krolik-2.webp'),
      assetPath('images/products/krolik-3.webp'),
      assetPath('images/products/krolik-4.webp'),
      assetPath('images/products/krolik-5.webp')
    ],
    priceRub: 2800,
  },
  {
    id: 40,
    name: 'Игрушка коллекционная — под заказ',
    description: 'Нереально милый медвежонок ищет семью. Сшит вручную, все части тела подвижны. Одежда снимается. Такую игрушку приятно взять в руки, да это и не просто игрушка , это душа мастера в работе.',
    category: 'dolls',
    imageUrl: assetPath('images/products/igrushka-medved.webp'),
    imageUrls: [
      assetPath('images/products/igrushka-medved.webp'),
      assetPath('images/products/igrushka-medved-2.webp'),
      assetPath('images/products/igrushka-medved-3.webp'),
      assetPath('images/products/igrushka-medved-4.webp'),
      assetPath('images/products/igrushka-medved-5.webp')
    ],
    priceRub: 13500,
  },
  {
    id: 41,
    name: 'Исторические куклы',
    description: 'Кукла в историческом костюме.',
    category: 'dolls',
    imageUrl: assetPath('images/products/istoricheskie-kukly.webp'),
    imageUrls: [
      assetPath('images/products/istoricheskie-kukly.webp'),
      assetPath('images/products/istoricheskie-kukly-2.webp'),
      assetPath('images/products/istoricheskie-kukly-3.webp')
    ],
    priceRub: 4750,
  },
  {
    id: 42,
    name: 'Баба Яга — под заказ',
    description: 'Бабка ежка , самая лучшая на свете женщина',
    category: 'dolls',
    imageUrl: assetPath('images/products/baba-yaga.webp'),
    imageUrls: [
      assetPath('images/products/baba-yaga.webp'),
      assetPath('images/products/baba-yaga-2.webp'),
      assetPath('images/products/baba-yaga-3.webp'),
      assetPath('images/products/baba-yaga-4.webp')
    ],
    priceRub: 5000,
  },
  {
    id: 43,
    name: 'Семечко вашего будущего дома',
    description: 'Символическое семечко вашего будущего дома. Вы приобретаете домик и начинаете делать добрые дела. Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , дом у вас появится. Вы его купите, построите, унаследуете и т.д. Это может быть дом, дача, квартира или коттедж. Все о чем вы мечтаете или что для вас сейчас символ дома. Чудеса там где в них верят.',
    category: 'seeds',
    imageUrl: assetPath('images/products/semechko-doma.webp'),
    imageUrls: [
      assetPath('images/products/semechko-doma.webp'),
      assetPath('images/products/semechko-doma-2.webp'),
      assetPath('images/products/semechko-doma-3.webp')
    ],
    priceRub: 500,
  },
  {
    id: 44,
    name: 'Семечко будущего дома (мини)',
    description: 'Символическое семечко вашего будущего дома. Вы приобретаете домик и начинаете делать добрые дела. Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , дом у вас появится. Вы его купите, построите, унаследуете и т.д. Это может быть дом, дача, квартира или коттедж. Все о чем вы мечтаете или что для вас сейчас символ дома. Чудеса там где в них верят.',
    category: 'seeds',
    imageUrl: assetPath('images/products/semechko-doma-mini.webp'),
    imageUrls: [
      assetPath('images/products/semechko-doma-mini.webp'),
      assetPath('images/products/semechko-doma-mini-2.webp'),
      assetPath('images/products/semechko-doma-mini-3.webp'),
      assetPath('images/products/semechko-doma-mini-4.webp')
    ],
    priceRub: 300,
  },
  {
    id: 45,
    name: 'Семечко вашего будущего дела',
    description: 'Символическое семечко вашего будущего собственного дела, бизнеса. Вы приобретаете мельницу и начинаете делать добрые дела. Любые добрые дела на ваше усмотрение! Когда дел будет сделано достаточно , Ваше собственное дело начнет расти и приносить доходы. Мельница, как символ успешной работы, очень сильный талисман! И помните, дорогу осилит идущий. Чудеса там где в них верят.',
    category: 'seeds',
    imageUrl: assetPath('images/products/semechko-dela.webp'),
    imageUrls: [
      assetPath('images/products/semechko-dela.webp'),
      assetPath('images/products/semechko-dela-2.webp'),
      assetPath('images/products/semechko-dela-3.webp'),
      assetPath('images/products/semechko-dela-4.webp'),
      assetPath('images/products/semechko-dela-6.webp')
    ],
    priceRub: 700,
  },
  {
    id: 46,
    name: 'Кедр — семейный талисман',
    description: 'Пара из кедра, двое как единое целое. Две половинки связаны между собой кожаным шнурком, как нерушимыми узами любви. Мощный семейный оберег. К каждому изделию прилагается паспорт изделия от мастерской.',
    category: 'wood',
    imageUrl: assetPath('images/products/kedr-talisman.webp'),
    imageUrls: [
      assetPath('images/products/kedr-talisman.webp'),
      assetPath('images/products/kedr-talisman-2.webp'),
      assetPath('images/products/kedr-talisman-3.webp')
    ],
    priceRub: 1500,
  },
  {
    id: 47,
    name: 'Духи',
    description: 'Шикарные не на что не похожие ароматы из Карелии. Стойкость 100 лет не меньше :)',
    category: 'perfume',
    imageUrl: assetPath('images/products/duhi.webp'),
    imageUrls: [
      assetPath('images/products/duhi.webp'),
      assetPath('images/products/duhi-2.webp'),
      assetPath('images/products/duhi-3.webp')
    ],
    priceRub: 2000,
  }
]
