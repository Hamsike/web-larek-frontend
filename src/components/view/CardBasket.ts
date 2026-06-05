import { ensureElement } from "../../utils/utils";
import { Card, ICardData } from "../common/Card";

interface ICardBasketData extends ICardData {
  index: number
}

interface ICardBasketButtonAction {
  onRemove: (event: MouseEvent) => void;
}

export class CardBasket extends Card<ICardBasketData> {
  private _indexElement: HTMLElement
  private _removeButton: HTMLElement | null

  constructor(container: HTMLElement, actions?: ICardBasketButtonAction) {
    super(container)
    this._indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
    this._removeButton = container.querySelector('.card__button');

    if (actions?.onRemove) {
      this._removeButton?.addEventListener('click', actions.onRemove)
    }
  }

  set index(value: number) {
    this.setText(this._indexElement, value)
  }
}