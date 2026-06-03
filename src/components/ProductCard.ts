import { BaseComponent } from './base/BaseComponent';
import { ensureElement } from '../utils/utils';

interface IProductCardData {
  title: string;
  category: string;
  image: string;
  price: number | null;
  description?: string;
}

interface IProductCardActions {
  onClick?: (event: MouseEvent) => void;
  onButtonClick?: (event: MouseEvent) => void;
}

const categoryStyles: Record<string, string> = {
  "софт-скил": "soft",
  "другое": "other",
  "дополнительное": "additional",
  "кнопка": "button",
  "хард-скил": "hard"
};

export class ProductCard extends BaseComponent<IProductCardData> {
  private titleElement: HTMLElement;
  private categoryElement: HTMLElement;
  private imageElement: HTMLImageElement;
  private priceElement: HTMLElement;
  private descriptionElement?: HTMLElement;
  private actionButton?: HTMLElement | null;

  constructor(container: HTMLElement, actions?: IProductCardActions, withDescription: boolean = false) {
    super(container);
    this.titleElement = ensureElement<HTMLElement>('.card__title', container);
    this.categoryElement = ensureElement<HTMLElement>('.card__category', container);
    this.imageElement = ensureElement<HTMLImageElement>('.card__image', container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', container);
    
    if (withDescription) {
      this.descriptionElement = ensureElement<HTMLElement>('.card__text', container);
      this.actionButton = container.querySelector('.card__button');
      
      if (actions?.onButtonClick && this.actionButton) {
        this.actionButton.addEventListener('click', actions.onButtonClick);
      }
    }
    
    if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

  set title(value: string) {
    this.setText(this.titleElement, value);
  }

  set category(value: string) {
    this.setText(this.categoryElement, value);
    const styleClass = categoryStyles[value] || 'other';
    this.categoryElement.className = `card__category card__category_${styleClass}`;
  }

  set image(value: string) {
    this.setImage(this.imageElement, value, this.title);
  }

  set price(value: number | null) {
    if (value === null) {
      this.setText(this.priceElement, 'Бесценно');
    } else {
      this.setText(this.priceElement, `${value} синапсов`);
    }
  }

  set description(value: string) {
    if (this.descriptionElement) {
      this.setText(this.descriptionElement, value);
    }
  }
}
