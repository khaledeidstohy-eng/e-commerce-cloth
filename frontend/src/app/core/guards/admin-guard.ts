import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const _authService= inject(AuthService);
  const _router = inject(Router);
  if(_authService.checkIfLoginWithRole() === 'admin'){
  return true;
  }
  else{
_router.navigate(['/login']);
    return false;
  }
};
