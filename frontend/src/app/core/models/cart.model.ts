import { IProduct } from './product.model';

export interface ICartItem {
  _id: string;
  product: IProduct;
  priceAtOrder: number;
  isPriceChanged: boolean;
  quantity: number;
}

export interface ICart {
  _id: string;
  user?: string | null;
  guestId?: string | null;
  items: ICartItem[];
  totalPrice: number;
}

export interface ICartRes {
  message: string;
  data: ICart;
}
