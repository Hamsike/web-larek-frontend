import { IEvents } from "../base/events";
import { Form, IFormData } from "../common/Form";

interface IFormContactsData extends IFormData {
  phone: string
  email: string
}

export class FormContacts extends Form<IFormContactsData> {
  
  set phone(value: string) {
    const input = this.formContainer.elements.namedItem('phone') as HTMLInputElement;
    if (input) input.value = value;
  }

  set email(value: string) {
    const input = this.formContainer.elements.namedItem('email') as HTMLInputElement;
    if (input) input.value = value;
  }
}