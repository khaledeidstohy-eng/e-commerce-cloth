import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { CategoryService } from '../../../core/services/category-service';
import { CartService } from '../../../core/services/cart-service';
import { ICategory } from '../../../core/models/category.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  constructor(
    private _authService: AuthService,
    private _categoryService: CategoryService,
    private _cartService: CartService,
    private _router: Router
  ) {}

  name = '';
  categories: ICategory[] = [];
  openMenuId: string | null = null;
  mobileMenuOpen = false;
  searchTerm = '';
  cartCount = 0;

  ngOnInit(): void {
    this._authService.returnUserData().subscribe({
      next: (data) => {
        this.name = data ? data : '';
      },
    });

    this._categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
      },
      error: (err) => console.log(err),
    });

    this._cartService.returnCartCount().subscribe({
      next: (count) => (this.cartCount = count),
    });
    this._cartService.refreshCart();
  }

  openMenu(id: string) {
    this.openMenuId = id;
  }

  closeMenu() {
    this.openMenuId = null;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  runSearch() {
    this._router.navigate(['/products-list'], { queryParams: { keyword: this.searchTerm } });
    this.mobileMenuOpen = false;
  }

  logout() {
    this._authService.logout();
    this.name = '';
  }
}
