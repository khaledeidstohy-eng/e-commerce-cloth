import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from '../../../core/models/product.model';
import { environment } from '../../../../environments/env';
import { CartService } from '../../../core/services/cart-service';

@Component({
  selector: 'app-productdetails',
  imports: [],
  templateUrl: './productdetails.html',
  styleUrl: './productdetails.css',
})
export class Productdetails implements OnInit {
  constructor(private _activeRoute: ActivatedRoute, private _cartService: CartService) {}

  myProduct!: IProduct;
  staticURL = environment.staticURL;
  quantity = 1;
  addedToCart = false;
  addingToCart = false;

  ngOnInit(): void {
    this.myProduct = this._activeRoute.snapshot.data['myProductRes'].data;
  }

  get isOutOfStock(): boolean {
    return !this.myProduct?.stock || this.myProduct.stock <= 0;
  }

  increaseQty() {
    if (this.quantity < this.myProduct.stock) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    this.addingToCart = true;
    this._cartService.addToCart(this.myProduct._id, this.quantity).subscribe({
      next: () => {
        this.addingToCart = false;
        this.addedToCart = true;
        setTimeout(() => (this.addedToCart = false), 2000);
      },
      error: () => {
        this.addingToCart = false;
      },
    });
  }
}
