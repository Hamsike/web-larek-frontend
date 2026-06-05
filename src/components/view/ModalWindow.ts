import { BaseComponent } from '../base/BaseComponent';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

interface IModalData {
  content: HTMLElement;
}

export class ModalWindow extends BaseComponent<IModalData> {
  private closeButton: HTMLButtonElement;
  private contentContainer: HTMLElement;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this.contentContainer = ensureElement<HTMLElement>('.modal__content', container);

    this.closeButton.addEventListener('click', () => this.hide());
    this.container.addEventListener('click', () => this.hide());
    this.contentContainer.addEventListener('click', (e) => e.stopPropagation());
  }

  set content(value: HTMLElement) {
    this.contentContainer.replaceChildren(value);
  }

  show(): void {
    this.container.classList.add('modal_active');
    this.events.emit('modal:open');
  }

  hide(): void {
    this.container.classList.remove('modal_active');
    this.contentContainer.replaceChildren()
    this.events.emit('modal:close');
  }

  render(data: IModalData): HTMLElement {
    super.render(data);
    this.show();
    return this.container;
  }
}