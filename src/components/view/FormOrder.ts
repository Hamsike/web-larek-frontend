import { ensureAllElements } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Form, IFormData } from "../common/Form";

interface IFormOrderData extends IFormData {
  address: string;
  payment: string;
}

export class FormOrder extends Form<IFormOrderData> {
  protected _paymentButtons: HTMLButtonElement[];

  constructor(formContainer: HTMLFormElement, events: IEvents) {
    super(formContainer, events)

    this._paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', this.formContainer);

    this._paymentButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.events.emit('order:paymentChange', { name: button.name });
      });
    });
  }

  set address(value: string) {
    const input = this.formContainer.elements.namedItem('address') as HTMLInputElement;
    if (input) input.value = value;
  }

  set payment(value: string) {
    this._paymentButtons.forEach(button => {
      this.toggleClass(button, 'button_alt-active', button.name === value);
    });
  }
}
