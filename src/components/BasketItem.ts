import { BaseComponent } from './base/BaseComponent';
import { ensureElement } from '../utils/utils';

interface IBasketItemData {
  title: string;
  price: number | null;
  index: number;
}

interface IBasketItemActions {
  onRemove: (event: MouseEvent) => void;
}

export class BasketItem extends BaseComponent<IBasketItemData> {
  private titleElement: HTMLElement;
  private priceElement: HTMLElement;
  private removeButton: HTMLElement | null;
  private indexElement: HTMLElement;

  constructor(container: HTMLElement, actions?: IBasketItemActions) {
    super(container);
    this.titleElement = ensureElement<HTMLElement>('.card__title', container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', container);
    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
    this.removeButton = container.querySelector('.card__button');

    if (actions?.onRemove && this.removeButton) {
      this.removeButton.addEventListener('click', actions.onRemove);
    }
  }

  set index(value: number) {
    this.setText(this.indexElement, value);
  }

  set title(value: string) {
    this.setText(this.titleElement, value);
  }

  set price(value: number | null) {
    if (value === null) {
      this.setText(this.priceElement, 'Бесценно');
    } else {
      this.setText(this.priceElement, `${value} синапсов`);
    }
  }
}
