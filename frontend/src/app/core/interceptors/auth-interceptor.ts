import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const _authService = inject(AuthService);
  const token = _authService.returnToken();
  if(token){
    const clonedReq = req.clone({
      setHeaders:{
          Authorization : `Bearer ${token}`
      }
    })
    return next(clonedReq);
  }
  return next(req);
};
