export interface IProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number | null;
}

export interface IShopState {
  products: IProductItem[];
  activeProduct: string;
  cart: string[];
  checkout: ICheckoutData;
  totalPrice: string | number;
  loading: boolean;
}

export interface ICheckoutForm {
  payment?: string;   
  address?: string;
  phone?: string;
  email?: string;
  total?: number;     
}

export interface ICheckoutData extends ICheckoutForm {
  items: string[];
}

export type ValidationErrors = Partial<Record<keyof ICheckoutData, string>>;

export interface IOrderResult {
  id: string;
  total?: number
}

export interface IFormState {
  valid: boolean;
  errors: string[];
}