import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product-service';
import { IProduct } from '../../core/models/product.model';
import { Product } from './product/product';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-productslist',
  imports: [Product],
  templateUrl: './productslist.html',
  styleUrl: './productslist.css',
})
export class Productslist implements OnInit, OnDestroy {
  constructor(
    private _productService: ProductService,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) {}

  private subscriptions: Subscription = new Subscription();
  myProducts: IProduct[] = [];
  loading = true;

  ngOnInit(): void {
    const routeSub = this._route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      const subCategory = params.get('subCategory');
      const subSubCategory = params.get('subSubCategory');
      const keyword = params.get('keyword');

      this.loadProducts({
        category: category || undefined,
        subCategory: subCategory || undefined,
        subSubCategory: subSubCategory || undefined,
        keyword: keyword || undefined,
      });
    });
    this.subscriptions.add(routeSub);
  }

  loadProducts(filters: { category?: string; subCategory?: string; subSubCategory?: string; keyword?: string }) {
    this.loading = true;

    const hasFilters = filters.category || filters.subCategory || filters.subSubCategory || filters.keyword;
    const request = hasFilters
      ? this._productService.searchProducts(filters)
      : this._productService.getAllProducts();

    const dataSub = request.subscribe({
      next: (res) => {
        this.myProducts = res.data;
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });

    this.subscriptions.add(dataSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
