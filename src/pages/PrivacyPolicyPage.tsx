import { Link } from 'react-router-dom'
import { FoxMark } from '../components/site/FoxMark'
import { MERCHANT } from '../lib/merchant'

export function PrivacyPolicyPage() {
  return (
    <div className="legal-page grain-bg">
      <header className="legal-page__bar">
        <div className="container legal-page__bar-inner">
          <Link to="/" className="legal-page__brand" aria-label="На главную «Лисья нора»">
            <FoxMark />
            <span>{MERCHANT.brandName}</span>
          </Link>
          <Link to="/" className="btn btn-ghost btn-sm">
            На сайт
          </Link>
        </div>
      </header>

      <main className="container legal-page__content">
        <span className="eyebrow">Документы</span>
        <h1>Политика обработки персональных данных</h1>
        <p className="legal-page__lead">
          Документ описывает, какие данные мы получаем через сайт-витрину магазина «Лисья нора» и
          как ими пользуемся. Это практический текст для посетителей; при необходимости его можно
          уточнить вместе с бухгалтером или юристом.
        </p>

        <section>
          <h2>1. Оператор</h2>
          <p>
            Оператор персональных данных: <strong>{MERCHANT.legalName}</strong>
            <br />
            ИНН {MERCHANT.inn}
            <br />
            ОГРНИП {MERCHANT.ogrnip}
            <br />
            Адрес: {MERCHANT.address}
            <br />
            Телефон:{' '}
            <a href={`tel:${MERCHANT.phoneTel}`}>{MERCHANT.phoneDisplay}</a>
            <br />
            Сообщество ВКонтакте:{' '}
            <a href={MERCHANT.vkUrl} target="_blank" rel="noreferrer">
              {MERCHANT.vkUrl}
            </a>
          </p>
        </section>

        <section>
          <h2>2. Какие данные собираем</h2>
          <p>Через форму заявки на сайте мы можем получить:</p>
          <ul>
            <li>имя;</li>
            <li>номер телефона;</li>
            <li>город получения;</li>
            <li>точный адрес (улица, дом);</li>
            <li>адрес пункта выдачи Ozon (если вы его указали);</li>
            <li>комментарий к заявке (если вы его оставили);</li>
            <li>список выбранных товаров из каталога.</li>
          </ul>
          <p>Мы не принимаем оплату на сайте и не просим данные банковской карты.</p>
        </section>

        <section>
          <h2>3. Зачем обрабатываем данные</h2>
          <ul>
            <li>чтобы связаться с вами по заявке;</li>
            <li>чтобы уточнить наличие товара, цену и способ получения;</li>
            <li>чтобы ответить на вопрос в комментарии.</li>
          </ul>
          <p>
            Правовое основание — ваше согласие, которое вы даёте, отмечая галочку в форме заявки
            (ст. 6, 9 Федерального закона № 152‑ФЗ «О персональных данных»).
          </p>
        </section>

        <section>
          <h2>4. Как обрабатываем и храним</h2>
          <p>
            Заявки просматривает сотрудник магазина в панели управления. Данные не передаём третьим
            лицам для рекламы. Храним столько, сколько нужно, чтобы обработать заявку и при
            необходимости связаться повторно, затем удаляем или обезличиваем.
          </p>
        </section>

        <section>
          <h2>5. Ваши права</h2>
          <p>
            Вы можете запросить уточнение, блокирование или удаление своих данных — напишите или
            позвоните по контактам выше. Также вы можете отозвать согласие тем же способом.
          </p>
        </section>

        <section>
          <h2>6. Условия заявки на сайте</h2>
          <ul>
            <li>Заявка — это не автоматическая оплата и не бронирование без подтверждения.</li>
            <li>
              Мы свяжемся с вами по телефону {MERCHANT.responsePromise} ({MERCHANT.hours}).
            </li>
            <li>
              Получение заказа — самовывоз по адресу {MERCHANT.addressShort} или доставка в выбранный
              пункт выдачи Ozon. Детали подтверждаем при звонке.
            </li>
            <li>Наличие и окончательную цену штучных изделий подтверждаем при ответе на заявку.</li>
          </ul>
        </section>

        <p className="legal-page__updated">Редакция от 19 сентября 2026 г.</p>
      </main>
    </div>
  )
}
