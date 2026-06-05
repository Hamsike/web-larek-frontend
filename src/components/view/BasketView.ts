import { BaseComponent } from '../base/BaseComponent';
import { EventEmitter } from '../base/events';
import { ensureElement, createElement } from '../../utils/utils';

interface IBasketViewData {
  items: HTMLElement[];
  total: number;
}

export class BasketView extends BaseComponent<IBasketViewData> {
  private itemsContainer: HTMLElement;
  private totalElement: HTMLElement | null;
  private checkoutButton: HTMLElement | null;

  constructor(container: HTMLElement, private events: EventEmitter) {
    super(container);
    this.itemsContainer = ensureElement<HTMLElement>('.basket__list', this.container);
    this.totalElement = this.container.querySelector('.basket__price');
    this.checkoutButton = this.container.querySelector('.basket__button');

    if (this.checkoutButton) {
      this.checkoutButton.addEventListener('click', () => {
        this.events.emit('checkout:start');
      });
    }
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this.itemsContainer.replaceChildren(...items);
    } else {
      this.itemsContainer.replaceChildren(createElement<HTMLParagraphElement>('p', {
        textContent: 'Корзина пуста'
      }));
    }
  }

  set total(total: number) {
    if (this.totalElement) {
      this.setText(this.totalElement, `${total} синапсов`);
    }
  }

  setButtonState(isDisabled: boolean): void {
    if (this.checkoutButton) {
      this.setDisabled(this.checkoutButton, isDisabled);
    }
  }
}