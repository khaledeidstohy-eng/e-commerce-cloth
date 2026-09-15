import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product-service';
import { IProduct } from '../../core/models/product.model';
import { Product } from '../productslist/product/product';

@Component({
  selector: 'app-home',
  imports: [Product, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(
    private _productService: ProductService,
    private _cdr: ChangeDetectorRef
  ) {}

  topSales: IProduct[] = [];
  newArrivals: IProduct[] = [];

  ngOnInit(): void {
    this._productService.getTopSales(8).subscribe({
      next: (res) => {
        this.topSales = res.data;
        this._cdr.detectChanges();
      },
      error: (err) => console.log(err),
    });

    this._productService.getNewArrivals(8).subscribe({
      next: (res) => {
        this.newArrivals = res.data;
        this._cdr.detectChanges();
      },
      error: (err) => console.log(err),
    });
  }
}
