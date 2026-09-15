import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { IProductRes, IProductsRes } from '../models/product.model';

export interface IProductFilters {
  category?: string;
  subCategory?: string;
  subSubCategory?: string;
  season?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private _http: HttpClient) {}
  private apiURL = environment.apiURL + 'product';

  getAllProducts(page = 1, limit = 20) {
    return this._http.get<IProductsRes>(this.apiURL, { params: { page, limit } });
  }

  getProductBySlug(slug: string) {
    return this._http.get<IProductRes>(this.apiURL + `/${slug}`);
  }

  searchProducts(filters: IProductFilters) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value as string);
      }
    });
    return this._http.get<IProductsRes>(this.apiURL + '/search', { params });
  }

  getTopSales(limit = 10) {
    return this._http.get<IProductsRes>(this.apiURL + `/top-sales?limit=${limit}`);
  }

  getNewArrivals(limit = 10) {
    return this._http.get<IProductsRes>(this.apiURL + `/new-arrivals?limit=${limit}`);
  }
}
