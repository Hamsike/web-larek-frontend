import { Api, ApiListResponse } from '../base/api';
import { IProductItem, ICheckoutData, IOrderResult } from '../../types';

export class StoreApi extends Api {
  private imageBaseUrl: string;

  constructor(imageBaseUrl: string, apiBaseUrl: string, options?: RequestInit) {
    super(apiBaseUrl, options);
    this.imageBaseUrl = imageBaseUrl;
  }

  async fetchProducts(): Promise<IProductItem[]> {
    const data = await this.get('/product') as ApiListResponse<IProductItem>;
    return data.items.map(item => ({ ...item }));
  }

  async submitOrder(order: ICheckoutData): Promise<IOrderResult> {
    return this.post('/order', order) as Promise<IOrderResult>;
  }

  getImageUrl(imagePath: string): string {
    return this.imageBaseUrl + imagePath;
  }
}