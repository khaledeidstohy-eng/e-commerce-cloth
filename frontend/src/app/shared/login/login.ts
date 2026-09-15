import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { CartService } from '../../core/services/cart-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ILoginData } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor(
    private _authService: AuthService,
    private _cartService: CartService
  ) {}

  loading = false;
  errorMsg = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this._authService.login(this.loginForm.value as ILoginData).subscribe({
      next: () => {
        this.loading = false;
        this._cartService.mergeGuestCartIfAny();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'حدث خطأ، برجاء المحاولة مرة أخرى';
      },
    });
  }
}
