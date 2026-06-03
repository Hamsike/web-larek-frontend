import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { StoreApi } from './components/StoreApi';
import { cloneTemplate, ensureElement } from './utils/utils';
import { ShopModel } from './components/models/ShopModel';
import { PageLayout } from './components/PageLayout';
import { ProductCard} from './components/ProductCard';
import { ModalWindow } from './components/ModalWindow';
import { BasketView } from './components/BasketView';
import { CheckoutForm } from './components/CheckoutForm';
import { SuccessView } from './components/SuccessView';
import { IProductItem, ValidationErrors } from './types';
import { BasketItem } from './components/BasketItem';

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
const orderForm = new CheckoutForm(cloneTemplate(templates.order), events, 'order');
const contactsForm = new CheckoutForm(cloneTemplate(templates.contacts), events, 'contacts');

events.on('products:loaded', (data: { products: IProductItem[] }) => {
  page.catalog = data.products.map((item) => {
    const card = new ProductCard(cloneTemplate(templates.cardCatalog), {
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
  const preview = new ProductCard(cloneTemplate(templates.cardPreview), {
    onButtonClick: () => events.emit('card:add', item)
  }, true);

  modal.render({
    content: preview.render({
      title: item.title,
      image: api.getImageUrl(item.image),
      description: item.description,
      price: item.price,
      category: item.category
    })
  });
});

events.on('card:add', (item: IProductItem) => {
  appData.addToCheckout(item);
  appData.addToBasket(item);                  
  page.counter = appData.getBasketItems().length; 
  modal.hide();
});

events.on('basket:open', () => {
  basket.setButtonState(appData.isBasketEmpty());
  basket.total = appData.calculateTotal();
  
  let position = 1;
  basket.items = appData.getBasketItems().map((item) => {
    const card = new BasketItem(cloneTemplate(templates.cardBasket), {
      onRemove: () => events.emit('card:remove', item)
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: position++
    });
  });
  
  modal.render({
    content: basket.render()
  });
});

events.on('card:remove', (item: IProductItem) => {
  appData.removeFromBasket(item);                
  appData.removeFromCheckout(item);
  page.counter = appData.getBasketItems().length;
  basket.setButtonState(appData.isBasketEmpty());
  basket.total = appData.calculateTotal();
  
  let position = 1;
  basket.items = appData.getBasketItems().map((cartItem) => {
    const card = new BasketItem(cloneTemplate(templates.cardBasket), {
      onRemove: () => events.emit('card:remove', cartItem)
    });
    return card.render({
      title: cartItem.title,
      price: cartItem.price,
      index: position++
    });
  });
  
  modal.render({
    content: basket.render()
  });
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
});

events.on('order:submit', () => {
  appData.checkoutData.total = appData.calculateTotal();
  appData.checkoutData.email = '';
  appData.checkoutData.phone = '';
  appData.validateContactForm();
  contactsForm.resetForm();
  modal.render({
    content: contactsForm.render({
      valid: false,
      errors: []
    })
  });
});

events.on('checkout:start', () => {
  appData.checkoutData.address = '';
  appData.checkoutData.payment = 'card';
  appData.checkoutData.total = 0; 
  appData.validateCheckoutForm();
  orderForm.resetForm();
  modal.render({
    content: orderForm.render({
      valid: false,
      errors: []
    })
  });
});

events.on('contacts:submit', () => {
  api.submitOrder(appData.checkoutData)
    .then(() => {
      const success = new SuccessView(cloneTemplate(templates.success), {
        onClick: () => {
          modal.hide();
        }
      });
    
      modal.render({
        content: success.render({
          total: appData.calculateTotal()
        })
      });

      const onModalClose = () => {
        appData.resetBasket();                              
        page.counter = appData.getBasketItems().length;
        events.off('modal:close', onModalClose);
      };
      events.on('modal:close', onModalClose);
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