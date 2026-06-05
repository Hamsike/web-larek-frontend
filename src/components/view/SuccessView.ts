import { BaseComponent } from '../base/BaseComponent';
import { ensureElement } from '../../utils/utils';

interface ISuccessData {
  total: number;
}

interface ISuccessActions {
  onClick: () => void;
}

export class SuccessView extends BaseComponent<ISuccessData> {
  private totalDisplay: HTMLElement;
  private closeButton: HTMLElement;

  constructor(container: HTMLElement, actions: ISuccessActions) {
    super(container);
    this.closeButton = ensureElement<HTMLElement>('.order-success__close', this.container);
    this.totalDisplay = ensureElement<HTMLElement>('.order-success__description', this.container);

    if (actions?.onClick) {
      this.closeButton.addEventListener('click', actions.onClick);
    }
  }

  set total(value: number) {
    this.totalDisplay.textContent = `Списано ${value} синапсов`;
  }
}