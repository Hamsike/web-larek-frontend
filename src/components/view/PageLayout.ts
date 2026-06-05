import { BaseComponent } from '../base/BaseComponent';
import {IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

interface IPageData {
  catalog: HTMLElement[];
}

export class PageLayout extends BaseComponent<IPageData> {
  private cartCounter: HTMLElement;
  private catalogContainer: HTMLElement;
  private pageWrapper: HTMLElement;
  private cartButton: HTMLElement;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);
    this.cartCounter = ensureElement('.header__basket-counter');
    this.catalogContainer = ensureElement('.gallery');
    this.pageWrapper = ensureElement('.page__wrapper');
    this.cartButton = ensureElement('.header__basket');

    this.cartButton.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  set counter(value: number) {
    this.setText(this.cartCounter, String(value));
  }

  set catalog(items: HTMLElement[]) {
    this.catalogContainer.replaceChildren(...items);
  }

  set locked(value: boolean) {
    if (value) {
      this.pageWrapper.classList.add('page__wrapper_locked');
    } else {
      this.pageWrapper.classList.remove('page__wrapper_locked');
    }
  }
}