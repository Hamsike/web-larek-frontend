import { BaseComponent } from './base/BaseComponent';
import { EventEmitter } from './base/events';
import { ensureElement, ensureAllElements } from '../utils/utils';
import { IFormState } from '../types';

export class CheckoutForm extends BaseComponent<IFormState> {
  protected submitButton: HTMLButtonElement;
  protected errorContainer: HTMLElement;
  protected paymentButtons: HTMLButtonElement[];
  protected formName: string;

  constructor(protected formContainer: HTMLFormElement, protected events: EventEmitter, formName: string) {
    super(formContainer);
    this.formName = formName;

    this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.formContainer);
    this.errorContainer = ensureElement<HTMLElement>('.form__errors', this.formContainer);
    this.paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', this.formContainer);

    this.paymentButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.setPaymentMethod(button.name);
        this.events.emit('payment:selected', { name: button.name });
      });
    });

    this.formContainer.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const field = target.name;
      const value = target.value;
      this.events.emit(`${this.formName}:change`, { field, value });
    });

    this.formContainer.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      this.events.emit(`${this.formName}:submit`);
    });
  }

  setPaymentMethod(method: string): void {
    this.paymentButtons.forEach(button => {
      this.toggleClass(button, 'button_alt-active', button.name === method);
    });
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }

  set errors(value: string) {
    this.setText(this.errorContainer, value);
  }

  set address(value: string) {
    const input = this.formContainer.elements.namedItem('address') as HTMLInputElement;
    if (input) input.value = value;
  }

  set phone(value: string) {
    const input = this.formContainer.elements.namedItem('phone') as HTMLInputElement;
    if (input) input.value = value;
  }

  set email(value: string) {
    const input = this.formContainer.elements.namedItem('email') as HTMLInputElement;
    if (input) input.value = value;
  }

  resetForm(): void {
    const addressInput = this.formContainer.querySelector('input[name="address"]') as HTMLInputElement;
    if (addressInput) addressInput.value = '';

    const emailInput = this.formContainer.querySelector('input[name="email"]') as HTMLInputElement;
    if (emailInput) emailInput.value = '';

    const phoneInput = this.formContainer.querySelector('input[name="phone"]') as HTMLInputElement;
    if (phoneInput) phoneInput.value = '';

    this.paymentButtons.forEach(button => {
      this.toggleClass(button, 'button_alt-active', false);
    });
    this.setPaymentMethod('card');

    this.valid = false;
    this.errors = '';
  }
}
