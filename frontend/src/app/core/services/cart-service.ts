import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/env';
import { ICart, ICartRes } from '../models/cart.model';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private _http: HttpClient, private _authService: AuthService) {}
  private apiURL = environment.apiURL + 'cart';

  private cart = new BehaviorSubject<ICart | null>(null);
  private cartCount = new BehaviorSubject<number>(0);

  private guestIdKey = 'guestId';

  private getGuestId(): string {
    let guestId = localStorage.getItem(this.guestIdKey);
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).slice(2) + Date.now();
      localStorage.setItem(this.guestIdKey, guestId);
    }
    return guestId;
  }

  private buildParams(): Record<string, string> {
    const isLoggedIn = !!this._authService.returnToken();
    if (isLoggedIn) return {};
    return { guestId: this.getGuestId() };
  }

  private buildBody(extra: Record<string, unknown> = {}): Record<string, unknown> {
    const isLoggedIn = !!this._authService.returnToken();
    if (isLoggedIn) return extra;
    return { ...extra, guestId: this.getGuestId() };
  }

  returnCart() {
    return this.cart.asObservable();
  }

  returnCartCount() {
    return this.cartCount.asObservable();
  }

  private updateState(cart: ICart) {
    this.cart.next(cart);
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount.next(count);
  }

  refreshCart() {
    this._http
      .get<ICartRes>(this.apiURL, { params: this.buildParams() })
      .subscribe({
        next: (res) => this.updateState(res.data),
        error: (err) => console.log(err),
      });
  }

  addToCart(productId: string, quantity: number) {
    return this._http
      .post<ICartRes>(this.apiURL, this.buildBody({ productId, quantity }))
      .pipe(tap((res) => this.updateState(res.data)));
  }

  removeFromCart(itemId: string) {
    return this._http
      .delete<ICartRes>(this.apiURL + `/${itemId}`, { params: this.buildParams() })
      .pipe(tap((res) => this.updateState(res.data)));
  }

  acceptNewPrice(itemId: string) {
    return this._http
      .patch<ICartRes>(this.apiURL + `/${itemId}/accept-price`, this.buildBody())
      .pipe(tap((res) => this.updateState(res.data)));
  }


  mergeGuestCartIfAny() {
    const guestId = localStorage.getItem(this.guestIdKey);
    if (!guestId) return;

    this._http.post<ICartRes>(this.apiURL + '/merge', { guestId }).subscribe({
      next: (res) => {
        localStorage.removeItem(this.guestIdKey);
        if (res.data) this.updateState(res.data);
        else this.refreshCart();
      },
      error: () => this.refreshCart(),
    });
  }
}
