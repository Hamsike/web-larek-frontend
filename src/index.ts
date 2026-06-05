import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { StoreApi } from './components/models/StoreApi';
import { cloneTemplate, ensureElement } from './utils/utils';
import { ShopModel } from './components/models/ShopModel';
import { PageLayout } from './components/view/PageLayout';
import { ModalWindow } from './components/view/ModalWindow';
import { BasketView } from './components/view/BasketView';
import { SuccessView } from './components/view/SuccessView';
import { IProductItem, ValidationErrors } from './types';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { CardGallery } from './components/view/CardGallery';
import { FormOrder } from './components/view/FormOrder';
import { FormContacts } from './components/view/FormContacts';

const events = new EventEmitter();
const api = new StoreApi(CDN_URL, API_URL);

const templates = {
  success: ensureElement<HTMLTemplateElement>('#success'),
  cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
  cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
  cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
  basket: ensureElement<HTMLTemplateElement>('#basket'),
  order: ensureElement<HTMLTemplateElement>('#order'),
  contacts: ensureElement<HTMLTemplateElement>('#contacts'),
};

const appData = new ShopModel(events);
const page = new PageLayout(document.body, events);
const modal = new ModalWindow(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new BasketView(cloneTemplate(templates.basket), events);
const orderForm = new FormOrder(cloneTemplate(templates.order), events);
const contactsForm = new FormContacts(cloneTemplate(templates.contacts), events);

events.on('basket:updated', () => {
  page.counter = appData.getBasketItems().length;
  basket.setButtonState(appData.isBasketEmpty());
  basket.total = appData.calculateTotal();
  
  basket.items = appData.getBasketItems().map((item, idx) => {
    const card = new CardBasket(cloneTemplate(templates.cardBasket), {
      onRemove: () => events.emit('card:remove', item)
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: idx + 1
    });
  });
});

events.on('products:loaded', (data: { products: IProductItem[] }) => {
  page.catalog = data.products.map((item) => {
    const card = new CardGallery(cloneTemplate(templates.cardCatalog), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      title: item.title,
      category: item.category,
      image: api.getImageUrl(item.image),
      price: item.price
    });
  });
});

events.on('card:select', (item: IProductItem) => {
  appData.setActiveProduct(item);
});

events.on('activeProduct:changed', (item: IProductItem) => {
  const preview = new CardPreview(cloneTemplate(templates.cardPreview), {
    onButtonClick: () => events.emit('card:add', item)
  });

  modal.render({
    content: preview.render({
      title: item.title,
      image: api.getImageUrl(item.image),
      description: item.description,
      price: item.price,
      category: item.category,
      isCanAdd: appData.canAddToBasket(item.id) && !!item.price
    })
  });
});

events.on('card:add', (item: IProductItem) => {
  appData.addToCheckout(item);
  appData.addToBasket(item);                  
  modal.hide();
});

events.on('basket:open', () => {
  events.emit('basket:updated');
  modal.render({
    content: basket.render()
  });
});

events.on('card:remove', (item: IProductItem) => {
  appData.removeFromBasket(item);                
  appData.removeFromCheckout(item);
});

events.on('validation:updated', (errors: ValidationErrors) => {
  const { email, phone, address } = errors;
  
  orderForm.valid = !address;
  contactsForm.valid = !email && !phone;
  orderForm.errors = address ? address : '';
  contactsForm.errors = [phone, email].filter(Boolean).join('; ');
});

events.on('order:change', (data: { field: string, value: string }) => {
  appData.updateCheckoutField(data.field, data.value);
});

events.on('contacts:change', (data: { field: string, value: string }) => {
  appData.updateContactField(data.field, data.value);
});

events.on('payment:selected', (data: { name: string }) => {
  appData.checkoutData.payment = data.name;
  appData.validateCheckoutForm();
});

events.on('order:submit', () => {
  appData.checkoutData.total = appData.calculateTotal();
  modal.render({
    content: contactsForm.render({
      valid: false,
      errors: '',
      email: '',
      phone: ''
    })
  });
});

events.on('checkout:start', () => {
  appData.resetOrderData();
  modal.render({
    content: orderForm.render({
      valid: false,
      errors: '',
      address: '',
      payment: 'card'
    })
  });
});

events.on('contacts:submit', () => {
  api.submitOrder(appData.checkoutData)
    .then((result) => {
      appData.resetBasket()
      const success = new SuccessView(cloneTemplate(templates.success), {
        onClick: () => {
          modal.hide();
        }
      });
    
      modal.render({
        content: success.render({
          total: result.total || appData.calculateTotal()
        })
      });
    })
    .catch((err: Error) => {
      console.error(err);
    });
});

events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
});

api.fetchProducts()
  .then(appData.updateProductList.bind(appData))
  .catch((err: Error) => {
    console.error(err);
  });

