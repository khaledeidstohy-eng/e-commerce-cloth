import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { ICategoriesRes } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private _http: HttpClient) {}
  private apiURL = environment.apiURL + 'category';

  getAllCategories() {
    return this._http.get<ICategoriesRes>(this.apiURL);
  }
}
