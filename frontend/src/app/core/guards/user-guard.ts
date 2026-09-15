import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const userGuard: CanMatchFn = (route, segments) => {
    const _authService= inject(AuthService);
  const _router = inject(Router);
  if(_authService.checkIfLoginWithRole() === 'user'){
  return true;
  }
  else{
_router.navigate(['/login']);
    return false;
  }
};
