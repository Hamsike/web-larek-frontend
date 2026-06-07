import { IProductItem, ICheckoutData, ValidationErrors } from '../../types';
import { IEvents } from '../base/events';

export class ShopModel {
  products: IProductItem[] = [];
  activeProductId: string = '';
  basketItems: IProductItem[] = [];
  checkoutData: ICheckoutData = {
    address: '',
    payment: 'card',
    email: '',
    total: 0,
    phone: '',
    items: []
  };

  constructor(private events: IEvents) { }

  resetBasket(): void {
    this.basketItems = [];
    this.checkoutData.items = [];
    this.events.emit('basket:updated', { basket: this.basketItems });
  }

  updateProductList(items: IProductItem[]): void {
    this.products = items.map(item => ({ ...item }));
    this.events.emit('products:loaded', { products: this.products });
  }

  setActiveProduct(item: IProductItem): void {
    this.activeProductId = item.id;
    this.events.emit('activeProduct:changed', item);
  }

  canAddToBasket(id: string) {
    return !this.basketItems.some(item => item.id === id);
  }

  addToBasket(item: IProductItem): void {
    this.basketItems.push(item);
    this.checkoutData.items.push(item.id);
    this.events.emit('basket:updated', { basket: this.basketItems });
  }

  removeFromBasket(item: IProductItem): void {
    const basketIndex = this.basketItems.findIndex(i => i.id === item.id);
    if (basketIndex >= 0) {
      this.basketItems.splice(basketIndex, 1);
      const checkoutIndex = this.checkoutData.items.indexOf(item.id);
      if (checkoutIndex >= 0) {
        this.checkoutData.items.splice(checkoutIndex, 1);
      }
      this.events.emit('basket:updated', { basket: this.basketItems });
    }
  }

  isBasketEmpty(): boolean {
    return this.basketItems.length === 0;
  }

  getBasketItems(): IProductItem[] {
    return this.basketItems;
  }

  calculateTotal(): number {
    return this.checkoutData.items.reduce((sum, itemId) => {
      const product = this.products.find(p => p.id === itemId);
      return sum + (product?.price || 0);
    }, 0);
  }

  updateCheckoutField(field: string, value: string): void {
    const validFields = ['payment', 'address', 'phone', 'email', 'total'];
    if (validFields.includes(field)) {
      if (field === 'total') {
        this.checkoutData.total = Number(value);
      } else {
        (this.checkoutData as any)[field] = value;
      }
    }
    this.events.emit('order:changed', this.checkoutData);
  }

  updateContactField(field: string, value: string): void {
    const validFields = ['email', 'phone'];
    if (validFields.includes(field)) {
      (this.checkoutData as any)[field] = value;
    }
    this.events.emit('order:changed', this.checkoutData);
  }

  getValidationErrors(): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!this.checkoutData.address || this.checkoutData.address.trim() === '') {
      errors.address = 'Укажите адрес доставки';
    }
    if (!this.checkoutData.payment) {
      errors.payment = 'Выберите способ оплаты';
    }
    if (!this.checkoutData.email || this.checkoutData.email.trim() === '') {
      errors.email = 'Укажите email';
    }
    if (!this.checkoutData.phone || this.checkoutData.phone.trim() === '') {
      errors.phone = 'Укажите телефон';
    }

    return errors;
  }

  resetOrderData(): void {
    this.checkoutData.address = '';
    this.checkoutData.payment = 'card';
    this.checkoutData.email = '';
    this.checkoutData.phone = '';
    this.checkoutData.total = 0;
    this.events.emit('order:changed', this.checkoutData);
  }
}
