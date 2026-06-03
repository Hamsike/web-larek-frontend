# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Архитектура приложения

### Подход разработки
В проекте используется **событийно-ориентированный подход** — взаимодействие между компонентами осуществляется через обмен сообщениями (событиями).  
Также применяется **MVP** (Model-View-Presenter): модель отвечает за данные и бизнес-логику, представление — за интерфейс, а презентатором выступает центральный `EventEmitter`, связывающий всё через события.

### Базовый код

#### Класс `BaseComponent<T>`
Абстрактный класс-дженерик, обобщающий конструктор и основные методы работы с компонентами отображения.

**Конструктор:**
- принимает на вход `container` типа `HTMLElement`

**Методы:**
- `toggleClass(element, className, force?)` — переключает класс элемента
- `setDisabled(element, state)` — блокирует/разблокирует кнопку
- `setText(element, value)` — устанавливает текстовое содержимое элемента
- `setImage(element, src, alt?)` — устанавливает изображение и его alt
- `render(data?)` — сливает переданные данные с текущим объектом и возвращает контейнер

#### Класс `EventEmitter`
Брокер событий, обеспечивающий работу событий. Функциональность стандартная: установка/снятие слушателей, вызов слушателей при возникновении события.

**Методы:**
- `on(eventName, callback)` — установить обработчик на событие
- `off(eventName, callback)` — снять обработчик
- `emit(eventName, data?)` — инициировать событие с данными
- `onAll(callback)` — слушать все события
- `offAll()` — сбросить все обработчики
- `trigger(eventName, context?)` — сделать коллбек, генерирующий событие при вызове

#### Класс `Api`
Базовый класс для работы с HTTP-запросами. Хранит базовый URL и опции запроса.

**Конструктор:**
- принимает `baseUrl: string` и опциональные `options: RequestInit`

**Методы:**
- `handleResponse(response)` — обрабатывает ответ сервера
- `get(uri)` — выполняет GET-запрос
- `post(uri, data, method)` — выполняет POST (или PUT/DELETE) запрос с телом

### Компоненты модели данных (Model)

#### Класс `StoreApi` (наследует `Api`)
Основной класс работы с сетью в проекте.

**Конструктор:**
- принимает `cdn: string`, `baseUrl: string`, опциональные `options: RequestInit`
- передаёт `baseUrl` и `options` в родительский конструктор
- сохраняет `cdn` во внутреннее поле `imageBaseUrl`

**Поля:**
- `imageBaseUrl` — хранит URL для формирования полного пути к изображениям

**Методы:**
- `fetchProducts()` — GET-запрос на `/product`, возвращает список товаров (`IProductItem[]`)
- `submitOrder(order)` — POST-запрос на `/order` с данными заказа, возвращает результат (`IOrderResult`)
- `getImageUrl(imagePath)` — возвращает полный URL изображения (склеивает `imageBaseUrl` и `imagePath`)

#### Класс `ShopModel`

Является центральной моделью данных приложения. Содержит все основные группы данных страницы и методы работы с ними.  
(Не наследует базовых классов, работает напрямую с `EventEmitter`.)

**Интерфейсы:**
```ts
interface ICheckoutData {
  payment?: string;
  address?: string;
  phone?: string;
  email?: string;
  total?: number;
  items: string[];
}
```
**Поля**
- products: IProductItem[] — список товаров, полученных с сервера
- activeProductId: string — идентификатор товара, открытого в превью
- basketItems: IProductItem[] — товары, добавленные в корзину (полные объекты)
- checkoutData: ICheckoutData — данные заказа: адрес, способ оплаты, контакты, сумма, список id товаров
- fieldErrors: ValidationErrors — объект текущих ошибок валидации

**Методы**
- resetBasket() — очищает basketItems и checkoutData.items, генерирует событие basket:updated

- addToCheckout(item) — добавляет id товара в checkoutData.items

- removeFromCheckout(item) — удаляет id товара из checkoutData.items

- updateProductList(items) — сохраняет каталог, генерирует products:loaded

- setActiveProduct(item) — сохраняет activeProductId, генерирует activeProduct:changed

- addToBasket(item) — добавляет товар в basketItems, генерирует basket:updated

- removeFromBasket(item) — удаляет товар из basketItems, генерирует basket:updated

- isBasketEmpty(): boolean — возвращает true, если корзина пуста

- getBasketItems(): IProductItem[] — возвращает массив товаров в корзине

- calculateTotal(): number — вычисляет общую стоимость заказа на основе checkoutData.items и products

- updateCheckoutField(field, value) — обновляет поле в checkoutData (валидные поля: payment, address, phone, email, total), затем вызывает validateCheckoutForm()

- updateContactField(field, value) — обновляет поля email/phone, затем вызывает validateContactForm()

- validateCheckoutForm(): boolean — проверяет address и payment, заполняет fieldErrors, генерирует validation:updated, возвращает true если ошибок нет

- validateContactForm(): boolean — проверяет email и phone, аналогично генерирует validation:updated

### Компоненты представления (View)

#### Класс `ProductCard`

Отвечает за отображение карточки товара в каталоге или в режиме превью.

Расширяет `BaseComponent<T>` по интерфейсу `IProductCardData`
```ts 
interface IProductCardData {
  title: string;
  category: string;
  image: string;
  price: number | null;
  description?: string;
}
```

**Конструктор**
- принимает container: HTMLElement, опциональный объект actions (поля onClick и onButtonClick) и флаг withDescription: boolean

- сохраняет в поля элементы .card__title, .card__category, .card__image, .card__price

- если withDescription === true, дополнительно сохраняет .card__text и .card__button, и вешает onButtonClick на кнопку

- если передан actions.onClick, вешает его на весь container

**Поля**

- _title, _category, _image, _price — элементы разметки

- _description, _actionButton — опциональные элементы для превью

**Методы**
- set title(value) — устанавливает заголовок

- set category(value) — устанавливает текст категории и динамический CSS-класс (на основе словаря categoryStyles)

- set image(value) — устанавливает изображение

- set price(value) — отображает цену с суффиксом «синапсов» или «Бесценно»

- set description(value) — устанавливает описание (для превью)

#### Класс `BasketItem`
Отвечает за отображение одной строки товара в корзине.

Расширяет `BaseComponent<T>` по интерфейсу `IBasketItemData`.

```ts
interface IBasketItemData {
  title: string;
  price: number | null;
  index: number;
}
```

**Конструктор**
- принимает container: HTMLElement и опциональный объект actions с полем onRemove

- сохраняет в поля элементы .card__title, .card__price, .basket__item-index, .card__button

- если передан actions.onRemove, вешает его на кнопку удаления

**Поля**
- _title, _price, _index, _button — элементы разметки

**Методы**
- set index(value) — устанавливает порядковый номер

- set title(value) — устанавливает название товара

- set price(value) — отображает цену

#### Класс `BasketView`

Отвечает за отображение всей корзины (список товаров, общая сумма, кнопка оформления).

Расширяет `BaseComponent<T>` по интерфейсу `IBasketViewData`.

```ts
interface IBasketViewData {
  items: HTMLElement[];
  total: number;
}
```

**Конструктор**
- принимает container: HTMLElement и объект events: EventEmitter

- сохраняет в поля элементы .basket__list, .basket__price, .basket__button

- вешает на кнопку обработчик, генерирующий событие checkout:start

**Поля**
- _list — контейнер для списка товаров

- _total — элемент общей суммы

- _checkoutButton — кнопка «Оформить»

**Методы**

- set items(items) — заменяет содержимое списка; если массив пуст, выводит сообщение «Корзина пуста»

- set total(total) — устанавливает текст суммы (добавляет «синапсов»)

- setButtonState(isDisabled) — блокирует/разблокирует кнопку оформления

#### Класс `PageLayout`
Управляет глобальными элементами страницы: галерея товаров, счётчик корзины, блокировка прокрутки.

Расширяет `BaseComponent<T>` по интерфейсу `IPageData`.

```ts
interface IPageData {
  catalog: HTMLElement[];
}
```

**Конструктор**
- принимает container: HTMLElement и объект events: EventEmitter

- сохраняет в поля элементы .header__basket-counter, .gallery, .page__wrapper, .header__basket

- вешает на кнопку корзины обработчик, генерирующий событие basket:open

**Поля**

- _counter — счётчик товаров в корзине

- _catalog — контейнер галереи

- _wrapper — обёртка страницы (для блокировки скролла)

- _basket — кнопка корзины

**Методы**

- set counter(value) — устанавливает число в счётчике

- set catalog(items) — заменяет содержимое галереи

- set locked(value) — добавляет/убирает класс page__wrapper_locked, блокирующий прокрутку

#### Класс `ModalWindow`

Отвечает за отображение модального окна. Служит контейнером для любого контента.

Расширяет `BaseComponent<T>` по интерфейсу `IModalData`.

```ts
interface IModalData {
  content: HTMLElement;
}
```

**Конструктор**

- принимает container: HTMLElement и объект events: EventEmitter

- сохраняет в поля .modal__close и .modal__content

- вешает обработчики: на крестик и фон — закрытие (hide()), на контент — остановка всплытия

**Поля**

- _closeButton — кнопка закрытия

- _contentContainer — контейнер для динамического контента

**Методы**

- set content(value) — заменяет содержимое контейнера на переданный элемент

- show() — добавляет класс modal_active, генерирует событие modal:open

- hide() — удаляет класс modal_active, очищает innerHTML контейнера, генерирует modal:close

- render(data) — вызывает родительский render, затем show(), возвращает контейнер

#### Класс `CheckoutForm`

Универсальная форма для первого шага заказа (адрес + способ оплаты) и для контактов (email + телефон).

Расширяет `BaseComponent<T>` по интерфейсу `IFormState`.

```ts
export interface IFormState {
  valid: boolean;
  errors: string[];
}
```

**Конструктор**
- принимает formContainer: HTMLFormElement, events: EventEmitter, formName: string (например, 'order' или 'contacts')

- сохраняет кнопку сабмита, контейнер ошибок, кнопки выбора оплаты (.button_alt)

- на каждую кнопку оплаты вешает клик: вызывает setPaymentMethod, генерирует payment:selected

- на событие input генерирует событие ${formName}:change (с полем и значением)

- на submit вызывает preventDefault и генерирует ${formName}:submit

**Поля**
- _submit, _errorContainer, _paymentButtons — элементы формы

- _formName — имя формы (используется в именах событий)

**Методы**

- setPaymentMethod(method) — переключает активный класс на кнопках оплаты

- set valid(value) — блокирует/разблокирует кнопку сабмита

- set errors(value) — устанавливает текст ошибок

- set address(value) — устанавливает значение поля address

- set phone(value) — устанавливает значение поля phone

- set email(value) — устанавливает значение поля email

- resetForm() — очищает все поля ввода, сбрасывает активные кнопки оплаты, сбрасывает valid и errors

#### Класс `SuccessView`

Отображает сообщение об успешном оформлении заказа.

Расширяет `BaseComponent<T>` по интерфейсу `ISuccessData`.

```ts
interface ISuccessData {
  total: number;
}
```

**Конструктор**
- принимает container: HTMLElement и объект actions: { onClick }

- сохраняет элементы .order-success__close и .order-success__description

- вешает actions.onClick на кнопку закрытия

**Поля**
- _total — элемент для отображения списанной суммы

- _close — кнопка закрытия

**Методы**
- set total(value) — устанавливает текст «Списано X синапсов»

### Событийная логика `(index.ts)`

В `index.ts` создаются экземпляры всех компонентов и настраиваются обработчики событий. 

**Основные потоки**
- Загрузка товаров → api.fetchProducts() → updateProductList() → событие products:loaded → отрисовка каталога через PageLayout.catalog.

- Выбор карточки → card:select → setActiveProduct() → activeProduct:changed → открытие модального окна с ProductCard в режиме превью, на кнопку «В корзину» вешается card:add.

- Добавление в корзину → card:add → addToCheckout() и addToBasket() → обновление счётчика → закрытие модалки.

- Открытие корзины → basket:open → получение данных из модели, создание BasketItem для каждого товара, отображение BasketView в модалке.

- Удаление из корзины → card:remove → removeFromBasket() и removeFromCheckout() → перерисовка корзины.

- Начало оформления → checkout:start → сброс данных в модели (address, payment), вызов orderForm.resetForm(), отображение формы заказа в модалке.

- Валидация → при любом изменении полей генерируются события order:change или contacts:change → вызываются методы модели updateCheckoutField / updateContactField → выполняются validateCheckoutForm / validateContactForm → генерируется validation:updated, который управляет активностью кнопки и выводит ошибки.

- Выбор способа оплаты → payment:selected → сохраняется payment в модели.

- Отправка формы заказа → order:submit → устанавливается checkoutData.total, сбрасываются поля контактов в модели, вызывается contactsForm.resetForm(), отображается форма контактов.

- Отправка контактов → contacts:submit → отправка заказа через api.submitOrder(). При успехе показывается SuccessView. При закрытии модалки успеха (любым способом) вызывается resetBasket(), сбрасывается счётчик корзины.

- Блокировка скролла → события modal:open / modal:close управляют свойством locked страницы.