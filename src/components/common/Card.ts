import { ensureElement } from "../../utils/utils";
import { BaseComponent } from "../base/BaseComponent";

export interface ICardData {
  title: string;
  price: number | null;
}

export class Card<T extends ICardData> extends BaseComponent<T> {
  protected _titleElement: HTMLElement;
  protected _priceElement: HTMLElement;

  constructor(container: HTMLElement) {
    super(container)

    this._titleElement = ensureElement<HTMLElement>('.card__title', container);
    this._priceElement = ensureElement<HTMLElement>('.card__price', container);
  }

  set title(value: string) {
    this.setText(this._titleElement, value)
  }

  set price(value: number | null) {
    if (value === null) {
      this.setText(this._priceElement, 'Бесценно');
    } else {
      this.setText(this._priceElement, `${value} синапсов`);
    }
  }
}