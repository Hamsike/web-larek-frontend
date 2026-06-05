# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/view/ — папка с компонентами представления
- src/components/models/ — папка с моделями данных

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
Брокер событий, обеспечивающий работу событий.

**Методы:**
- `on(eventName, callback)` — установить обработчик на событие
- `off(eventName, callback)` — снять обработчик
- `emit(eventName, data?)` — инициировать событие с данными
- `onAll(callback)` — слушать все события
- `offAll()` — сбросить все обработчики
- `trigger(eventName, context?)` — сделать коллбек, генерирующий событие при вызове

#### Класс `Api`
Базовый класс для работы с HTTP-запросами.

**Конструктор:**
- принимает `baseUrl: string` и опциональные `options: RequestInit`

**Методы:**
- `handleResponse(response)` — обрабатывает ответ сервера
- `get(uri)` — выполняет GET-запрос
- `post(uri, data, method)` — выполняет POST (или PUT/DELETE) запрос с телом

### Компоненты модели данных (Model)

#### Класс `StoreApi` (наследует `Api`)

**Конструктор:**
- принимает `cdn: string`, `baseUrl: string`, опциональные `options: RequestInit`
- передаёт `baseUrl` и `options` в родительский конструктор
- сохраняет `cdn` во внутреннее поле `imageBaseUrl`

**Поля:**
- `imageBaseUrl: string` — хранит URL для формирования полного пути к изображениям

**Методы:**
- `fetchProducts(): Promise<IProductItem[]>` — GET-запрос на `/product`, возвращает список товаров
- `submitOrder(order: ICheckoutData): Promise<IOrderResult>` — POST-запрос на `/order` с данными заказа
- `getImageUrl(imagePath: string): string` — возвращает полный URL изображения

#### Класс `ShopModel`
Центральная модель данных приложения. Не наследует базовых классов, работает напрямую с `EventEmitter`.

**Конструктор:**

- принимает events: IEvents

- инициализирует все поля начальными значениями

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

type ValidationErrors = Partial<Record<keyof ICheckoutData, string>>;
```
**Поля:**
- products: IProductItem[] — список товаров, полученных с сервера

- activeProductId: string — идентификатор товара, открытого в превью

- basketItems: IProductItem[] — товары, добавленные в корзину (полные объекты)

- checkoutData: ICheckoutData — данные заказа: адрес, способ оплаты, контакты, сумма, список id товаров

- fieldErrors: ValidationErrors — объект текущих ошибок валидации

**Методы:**
- resetBasket(): void — очищает basketItems и checkoutData.items, генерирует basket:updated

- resetOrderData(): void — очищает все поля checkoutData (address, payment, email, phone, total), вызывает валидацию

- addToCheckout(item: IProductItem): void — добавляет id товара в checkoutData.items

- removeFromCheckout(item: IProductItem): void — удаляет id товара из checkoutData.items

- updateProductList(items: IProductItem[]): void — сохраняет каталог, генерирует products:loaded

- setActiveProduct(item: IProductItem): void — сохраняет activeProductId, генерирует activeProduct:changed

- canAddToBasket(id: string): boolean — возвращает true, если товара ещё нет в корзине

- addToBasket(item: IProductItem): void — добавляет товар в basketItems, генерирует basket:updated

- removeFromBasket(item: IProductItem): void — удаляет товар из basketItems, генерирует basket:updated

- isBasketEmpty(): boolean — возвращает true, если корзина пуста

- getBasketItems(): IProductItem[] — возвращает массив товаров в корзине

- calculateTotal(): number — вычисляет общую стоимость заказа на основе checkoutData.items и products

- updateCheckoutField(field: string, value: string): void — обновляет поле в checkoutData (валидные поля: payment, address, phone, email, total), затем вызывает validateCheckoutForm()

- updateContactField(field: string, value: string): void — обновляет поля email/phone, затем вызывает validateContactForm()

- validateCheckoutForm(): boolean — проверяет address и payment, заполняет fieldErrors, генерирует validation:updated, возвращает true если ошибок нет

- validateContactForm(): boolean — проверяет email и phone, генерирует validation:updated

### Компоненты представления (View)

#### Класс `Card<T extends ICardData>` (наследует `BaseComponent<T>`)

**Интерфейс:**
```ts
interface ICardData {
  title: string;
  price: number | null;
}
```

**Конструктор:**
- принимает container: HTMLElement

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .card__title и .card__price

**Поля:**

- _titleElement: HTMLElement — элемент заголовка

- _priceElement: HTMLElement — элемент цены

**Методы:**

- set title(value: string) — устанавливает заголовок

- set price(value: number | null) — устанавливает цену (если null — «Бесценно», иначе — «X синапсов»)

#### Класс `CardGallery<T extends ICardGalleryData>` (наследует `Card<T>`)

**Интерфейс:**
```ts
interface ICardGalleryData extends ICardData {
  image: string;
  category: string;
}
```

**Конструктор:**

- принимает container: HTMLElement и опциональный action: ICardGalleryAction

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .card__category и .card__image

- если передан action.onClick, вешает его на container

**Поля:**

- _categoryElement: HTMLElement — элемент категории

- _imageElement: HTMLImageElement — элемент изображения

- _categoryColor: Record<string, string> — словарь для CSS-классов категорий

**Методы:**

- set image(value: string) — устанавливает изображение

- set category(value: string) — устанавливает текст категории и динамический CSS-класс

#### Класс `CardPreview` (наследует `Card<ICardPreviewData>`)

**Интерфейс:**
```ts
interface ICardPreviewData extends ICardGalleryData {
  description?: string;
  isCanAdd: boolean;
}
```

**Конструктор:**

- принимает container: HTMLElement и опциональный actions: ICardPreviewButtonAction

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .card__button и .card__text

- если передан actions.onButtonClick, вешает его на кнопку

**Поля:**

- _descriptionElement: HTMLElement — элемент описания

- _actionButton: HTMLElement | null — кнопка добавления в корзину

**Методы:**

- set description(value: string) — устанавливает описание

- set isCanAdd(value: boolean) — блокирует/разблокирует кнопку

#### Класс `CardBasket` (наследует `Card<ICardBasketData>`)

**Интерфейс:**
```ts
interface ICardBasketData extends ICardData {
  index: number;
}
```

**Конструктор:**

- принимает container: HTMLElement и опциональный actions: ICardBasketButtonAction

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .basket__item-index и .card__button

- если передан actions.onRemove, вешает его на кнопку удаления

**Поля:**

- _indexElement: HTMLElement — элемент порядкового номера

- _removeButton: HTMLElement | null — кнопка удаления

**Методы:**

- set index(value: number) — устанавливает порядковый номер

#### Класс `BasketView` (наследует `BaseComponent<IBasketViewData>`)

**Интерфейс:**
```ts
interface IBasketViewData {
  items: HTMLElement[];
  total: number;
}
```

**Конструктор:**

- принимает container: HTMLElement и events: EventEmitter

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .basket__list, .basket__price, .basket__button

- вешает на кнопку оформления обработчик, генерирующий checkout:start

**Поля:**

- itemsContainer: HTMLElement — контейнер для списка товаров

- totalElement: HTMLElement | null — элемент общей суммы

- checkoutButton: HTMLElement | null — кнопка оформления

**Методы:**

- set items(items: HTMLElement[]) — заменяет содержимое списка (если пусто — выводит «Корзина пуста»)

- set total(total: number) — устанавливает текст суммы

- setButtonState(isDisabled: boolean): void — блокирует/разблокирует кнопку оформления

#### Класс `Form<T extends IFormData>` (наследует `BaseComponent<T>`)

**Интерфейс:**
```ts
interface IFormData {
  valid: boolean;
  errors: string;
}
```

**Конструктор:**

- принимает formContainer: HTMLFormElement и events: IEvents

- передаёт formContainer в родительский конструктор через super()

- получает formName из атрибута name формы

- сохраняет в поля кнопку сабмита и контейнер ошибок

- на событие input генерирует ${formName}:change с полем и значением

- на событие submit генерирует ${formName}:submit

**Поля:**

- formName: string | null — имя формы (из атрибута name)

- _submitButton: HTMLButtonElement — кнопка отправки

- _errorContainer: HTMLElement — контейнер для ошибок

**Методы:**

- set valid(value: boolean) — блокирует/разблокирует кнопку отправки

- set errors(value: string) — устанавливает текст ошибок

#### Класс `FormOrder` (наследует `Form<IFormOrderData>`)

**Интерфейс:**
```ts
interface IFormOrderData extends IFormData {
  address: string;
  payment: string;
}
```

**Конструктор:**

- принимает formContainer: HTMLFormElement и events: IEvents

- вызывает родительский конструктор через super()

- сохраняет в поле кнопки выбора оплаты (.button_alt)

- на каждую кнопку оплаты вешает клик: устанавливает payment и генерирует payment:selected

**Поля:**

- _paymentButtons: HTMLButtonElement[] — кнопки выбора способа оплаты

**Методы:**

- set address(value: string) — устанавливает значение поля адреса

- set payment(value: string) — переключает активный класс на кнопках оплаты

##### Класс `FormContacts` (наследует `Form<IFormContactsData>`)

**Интерфейс:**
```ts
interface IFormContactsData extends IFormData {
  phone: string;
  email: string;
}
```

**Конструктор:**

- принимает formContainer: HTMLFormElement и events: IEvents

- вызывает родительский конструктор через super()

- (своих полей не добавляет)

**Методы:**

- set phone(value: string) — устанавливает значение поля телефона

- set email(value: string) — устанавливает значение поля email

#### Класс `PageLayout` (наследует `BaseComponent<IPageData>`)

**Интерфейс:**
```ts
interface IPageData {
  catalog: HTMLElement[];
}
```

**Конструктор:**

- принимает container: HTMLElement и events: IEvents

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .header__basket-counter, .gallery, .page__wrapper, .header__basket

- вешает на кнопку корзины обработчик, генерирующий basket:open

**Поля:**

- cartCounter: HTMLElement — счётчик товаров в корзине

- catalogContainer: HTMLElement — контейнер галереи

- pageWrapper: HTMLElement — обёртка страницы

- cartButton: HTMLElement — кнопка корзины

**Методы:**

- set counter(value: number) — устанавливает число в счётчике

- set catalog(items: HTMLElement[]) — заменяет содержимое галереи

- set locked(value: boolean) — добавляет/убирает класс page__wrapper_locked, блокирующий прокрутку

#### Класс `ModalWindow` (наследует `BaseComponent<IModalData>`)

**Интерфейс:** 
```ts
interface IModalData {
  content: HTMLElement;
}
```

**Конструктор:**

- принимает container: HTMLElement и events: IEvents

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .modal__close и .modal__content

- вешает на крестик и фон закрытие (hide()), на контент — остановку всплытия

**Поля:**

- closeButton: HTMLButtonElement — кнопка закрытия

- contentContainer: HTMLElement — контейнер для контента

**Методы:**

- set content(value: HTMLElement) — заменяет содержимое контейнера

- show(): void — добавляет класс modal_active, генерирует modal:open

- hide(): void — удаляет класс modal_active, очищает контейнер, генерирует modal:close

- render(data: IModalData): HTMLElement — вызывает render родителя, затем show(), возвращает контейнер

#### Класс `SuccessView` (наследует `BaseComponent<ISuccessData>`)

**Интерфейс:**
```ts
interface ISuccessData {
  total: number;
}
```

**Конструктор:**

- принимает container: HTMLElement и actions: { onClick: () => void }

- передаёт container в родительский конструктор через super()

- сохраняет в поля элементы .order-success__close и .order-success__description

- вешает actions.onClick на кнопку закрытия

**Поля:**

- totalDisplay: HTMLElement — элемент для отображения суммы

- closeButton: HTMLElement — кнопка закрытия

**Методы:**

- set total(value: number) — устанавливает текст «Списано X синапсов»

### Событийная логика (`index.ts`)
**Основные потоки:**

- Загрузка товаров → api.fetchProducts() → updateProductList() → products:loaded → создание CardGallery → отрисовка каталога

- Выбор карточки → card:select → setActiveProduct() → activeProduct:changed → открытие CardPreview в модалке, проверка canAddToBasket

- Добавление в корзину → card:add → addToBasket() и addToCheckout() → basket:updated → обновление счётчика и корзины

- Открытие корзины → basket:open → basket:updated → отображение BasketView в модалке

- Удаление из корзины → card:remove → removeFromBasket() и removeFromCheckout() → basket:updated

- Начало оформления → checkout:start → resetOrderData() → отображение FormOrder в модалке

- Валидация → изменение полей → order:change / contacts:change → updateCheckoutField() / updateContactField() → validateCheckoutForm() / validateContactForm() → validation:updated → управление активностью кнопки

- Выбор оплаты → payment:selected → сохранение payment в модели → validateCheckoutForm()

- Отправка заказа → order:submit → установка total → отображение FormContacts

- Отправка контактов → contacts:submit → api.submitOrder() → отображение SuccessView → сброс корзины при закрытии

- Блокировка скролла → modal:open / modal:close → управление page.locked