import { assetPath } from '../lib/assetPath'
import type { Product } from '../lib/types'

// Ассортимент из VK Market (vk.ru/market-212089451) + локальные позиции,
// которых нет в публичной витрине. Фото — карусель public/images/products.
// «Чудо Мишаня» не включён (помечен как ПРОДАН).
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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
    id: 10,
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
    id: 11,
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
    id: 12,
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
    id: 13,
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
    id: 14,
    name: 'Собака Ева, ковка',
    description: 'Кованая собака Ева. Авторская работа кузнеца.',
    category: 'forge',
    imageUrl: assetPath('images/products/sobaka-eva.webp'),
    imageUrls: [assetPath('images/products/sobaka-eva.webp')],
    priceRub: 2500,
  },
  {
    id: 15,
    name: '«Мне только спросить», ковка',
    description: 'Кованая авторская работа. Эмоции в металле, проработанные детали и лёгкий юмор. Хорошая идея подарка.',
    category: 'forge',
    imageUrl: assetPath('images/products/mne-tolko-sprosit.webp'),
    imageUrls: [assetPath('images/products/mne-tolko-sprosit.webp')],
    priceRub: 25000,
  },
  {
    id: 16,
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
    id: 17,
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
    id: 18,
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
    id: 19,
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
    id: 20,
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
    id: 21,
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
    id: 22,
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
    id: 23,
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
    id: 24,
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
    id: 25,
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
