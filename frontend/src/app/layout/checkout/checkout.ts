import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart-service';
import { OrderService } from '../../core/services/order-service';
import { ICart } from '../../core/models/cart.model';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  constructor(
    private _cartService: CartService,
    private _orderService: OrderService,
    private _router: Router
  ) {}

  cart: ICart | null = null;
  loading = false;
  errorMsg = '';

  checkoutForm = new FormGroup({
    name: new FormControl('', Validators.required),
    mobilePhone: new FormControl('', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]),
    nationalId: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{14}$/)]),
    governorate: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this._cartService.returnCart().subscribe({ next: (cart) => (this.cart = cart) });
    this._cartService.refreshCart();
  }

  get hasPriceChangedItems(): boolean {
    return !!this.cart?.items.some((i) => i.isPriceChanged);
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    if (this.hasPriceChangedItems) {
      this.errorMsg = 'يوجد منتجات في سلتك تغيّر سعرها، برجاء مراجعتها في السلة أولاً';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this._orderService.createOrder(this.checkoutForm.value as any).subscribe({
      next: (res) => {
        this.loading = false;
        this._cartService.refreshCart();
        this._router.navigate(['/account'], { queryParams: { orderPlaced: res.data._id } });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'حدث خطأ أثناء إتمام الطلب';
      },
    });
  }
}
