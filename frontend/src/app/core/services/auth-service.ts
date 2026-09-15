import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/env';
import { ILoginData, ILoginRes, ITokenPayload } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _http:HttpClient,private _router:Router){}
  private apiURL = environment.apiURL+ 'auth';
  private userData = new BehaviorSubject<string | null>(null);

  checkIfLogin(){
    const token = localStorage.getItem(this.tokenKey);
    if(token){
      const decode = this.decodeToken(token);
      if(decode){
        this.userData.next(decode.name);
      }
    }
  }


  checkIfLoginWithRole(){
 const token = localStorage.getItem(this.tokenKey);
    if(token){
      const decode = this.decodeToken(token);
      if(decode){
       return decode.role;
      }
    }
    return ''
  }

  returnUserData(){
    return this.userData.asObservable();
  }

  login(data:ILoginData){
return this._http.post<ILoginRes>(this.apiURL + '/login', data).pipe(tap(data=>{
  const decode = this.decodeToken(data.token);
  if(decode){
this.userData.next(decode.name);
this.storeToken(data.token);
if(decode.role === 'user'){
this._router.navigate(['/']);
}else{
this._router.navigate(['/dashboard'])
}
  }


}));

  }

  register(data: {name:string; email:string; password:string; gender?:string; dob?:string; mobilePhone?:string; nationalId?:string}){
    return this._http.post<{message:string; data:unknown}>(this.apiURL + '/register', data);
  }

  private tokenKey= 'token';

  private storeToken(token:string){
    localStorage.setItem(this.tokenKey,token);
  }

  private deleteToken(){
    localStorage.removeItem(this.tokenKey);
  }

  logout(){
    this.deleteToken();
    this.userData.next(null);
    this._router.navigate(['/']);
  }


  returnToken(){
    return localStorage.getItem(this.tokenKey);
  }

  private decodeToken(token:string):ITokenPayload | null{
    try{
    const decode = jwtDecode<ITokenPayload>(token);

   if(decode)
   {

    console.log(decode.exp, Date.now());
    const expDate =decode.exp * 1000;
    if(expDate  > Date.now()){

    return decode;
    }
   }
   return null
  }
  catch(err){
    return null;
  }
  }
}
