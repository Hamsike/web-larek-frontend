import { ensureElement } from "../../utils/utils";
import { BaseComponent } from "../base/BaseComponent";
import { IEvents } from "../base/events";

export interface IFormData {
  valid: boolean
  errors: string
}

export class Form<T extends IFormData> extends BaseComponent<T> {
  protected formName: string | null
  protected _submitButton: HTMLButtonElement;
  protected _errorContainer: HTMLElement;

  constructor(protected formContainer: HTMLFormElement, protected events: IEvents) {
    super(formContainer)

    this.formName = this.formContainer.getAttribute('name')
    this._submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.formContainer);
    this._errorContainer = ensureElement<HTMLElement>('.form__errors', this.formContainer);
    
    this.formContainer.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement
      const field = target.name
      const value = target.value

      this.events.emit(`${this.formName}:change`, { field, value })
    })

    this.formContainer.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      this.events.emit(`${this.formName}:submit`);
    })
  }

  set valid(value: boolean) {
    this._submitButton.disabled = !value;
  }

  set errors(value: string) {
    this.setText(this._errorContainer, value);
  }
}