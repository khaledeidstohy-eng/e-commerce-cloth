import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { ICreateOrderData, IOrderRes, IOrdersRes } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private _http: HttpClient) {}
  private apiURL = environment.apiURL + 'order';

  createOrder(data: ICreateOrderData) {
    return this._http.post<IOrderRes>(this.apiURL, data);
  }

  getMyOrders() {
    return this._http.get<IOrdersRes>(this.apiURL + '/my-orders');
  }

  requestRefund(orderId: string) {
    return this._http.patch<IOrderRes>(this.apiURL + `/${orderId}/refund`, {});
  }
}
