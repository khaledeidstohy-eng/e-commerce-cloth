import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart-service';
import { ICart } from '../../core/models/cart.model';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  constructor(private _cartService: CartService, private _cdr: ChangeDetectorRef) {}

  cart: ICart | null = null;
  staticURL = environment.staticURL;
  busyItemId: string | null = null;

  ngOnInit(): void {
    this._cartService.returnCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this._cdr.detectChanges();
      },
    });
    this._cartService.refreshCart();
  }

  get hasPriceChangedItems(): boolean {
    return !!this.cart?.items.some((i) => i.isPriceChanged);
  }

  get validItems() {
    return this.cart?.items.filter((i) => !i.isPriceChanged) || [];
  }

  get changedItems() {
    return this.cart?.items.filter((i) => i.isPriceChanged) || [];
  }

  remove(itemId: string) {
    this.busyItemId = itemId;
    this._cartService.removeFromCart(itemId).subscribe({
      next: () => (this.busyItemId = null),
      error: () => (this.busyItemId = null),
    });
  }

  acceptNewPrice(itemId: string) {
    this.busyItemId = itemId;
    this._cartService.acceptNewPrice(itemId).subscribe({
      next: () => (this.busyItemId = null),
      error: () => (this.busyItemId = null),
    });
  }
}
