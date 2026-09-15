import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, MaybeAsync, RedirectCommand, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { IProduct, IProductRes } from '../models/product.model';
import { ProductService } from '../services/product-service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductResolver implements Resolve<IProductRes | null>{
  constructor(private _productService:ProductService, private _router:Router){}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<IProductRes | RedirectCommand | null> {
    const slug = route.paramMap.get('slug');
    if(slug){
        return this._productService.getProductBySlug(slug)
    }
    this._router.navigate(['product-list']);
    return of(null)
  }
}
