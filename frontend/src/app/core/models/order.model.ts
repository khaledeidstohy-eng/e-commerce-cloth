import { IProduct } from './product.model';

export interface IOrderItem {
  product: IProduct | string;
  priceAtOrder: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'in progress' | 'confirmed' | 'shipped' | 'received' | 'refund';

export interface IOrder {
  _id: string;
  user: string;
  items: IOrderItem[];
  address: string;
  mobilePhone: string;
  name: string;
  nationalId: string;
  price: number;
  shippingCost: number;
  governorate?: string;
  status: OrderStatus;
  orderedAt: string;
  createdAt: string;
}

export interface IOrdersRes {
  message: string;
  data: IOrder[];
}

export interface IOrderRes {
  message: string;
  data: IOrder;
}

export interface ICreateOrderData {
  address: string;
  mobilePhone: string;
  name: string;
  nationalId: string;
  governorate?: string;
  shippingCost?: number;
}
