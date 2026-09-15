import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICanComponentDeactivate } from '../../core/models/canComponentDeactivate.model';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements ICanComponentDeactivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  canDeactivate(): boolean | Promise<boolean> {
    if (this.myForm.dirty && !this.submitted) {
      return confirm('هل أنت متأكد من الخروج بدون إتمام التسجيل؟');
    }
    return true;
  }

  loading = false;
  errorMsg = '';
  successMsg = '';
  submitted = false;

  myForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    gender: new FormControl(''),
    mobilePhone: new FormControl(''),
  });

  onSubmit() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this._authService.register(this.myForm.value as any).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
        this.myForm.markAsPristine();
        this.successMsg = 'تم إنشاء الحساب بنجاح! جاري تحويلك لتسجيل الدخول...';
        setTimeout(() => this._router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'حدث خطأ أثناء إنشاء الحساب';
      },
    });
  }
}
