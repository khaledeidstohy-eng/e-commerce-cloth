import { Component, Input } from '@angular/core';
import { IProduct } from '../../../core/models/product.model';
import { environment } from '../../../../environments/env';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
  @Input() myProduct!: IProduct;
  staticURL = environment.staticURL;

  get isOutOfStock(): boolean {
    return !this.myProduct?.stock || this.myProduct.stock <= 0;
  }

  get seasonLabel(): string {
    const map: Record<string, string> = {
      summer: 'صيفي',
      winter: 'شتوي',
      'all-season': '',
    };
    return this.myProduct?.season ? map[this.myProduct.season] || '' : '';
  }
}
