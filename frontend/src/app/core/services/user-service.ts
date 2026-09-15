import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { IAddress, IUserRes, IUsersRes } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private _http: HttpClient) {}
  private apiURL = environment.apiURL + 'user';

  getAllUsers() {
    return this._http.get<IUsersRes>(this.apiURL);
  }

  getMyProfile() {
    return this._http.get<IUserRes>(this.apiURL + '/me');
  }

  addAddress(address: IAddress) {
    return this._http.post<IUserRes>(this.apiURL + '/addresses', address);
  }

  updateAddress(addressId: string, address: Partial<IAddress>) {
    return this._http.put<IUserRes>(this.apiURL + `/addresses/${addressId}`, address);
  }

  removeAddress(addressId: string) {
    return this._http.delete<IUserRes>(this.apiURL + `/addresses/${addressId}`);
  }
}
