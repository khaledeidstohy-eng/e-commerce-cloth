import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home as LayoutHome } from './layout/home/home';
import { Productslist } from './layout/productslist/productslist';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './dashboard/home/home';
import { Userslist } from './dashboard/userslist/userslist';
import { Login } from './shared/login/login';
import { Notfound } from './shared/notfound/notfound';
import { Productdetails } from './layout/productslist/productdetails/productdetails';
import { Account } from './layout/account/account';
import { adminGuard } from './core/guards/admin-guard';
import { userGuard } from './core/guards/user-guard';
import { Signup } from './layout/signup/signup';
import { canDeactivateGuard } from './core/guards/can-deactivate-guard';
import { Parent } from './layout/parent/parent';
import { ProductResolver } from './core/resolvers/product-resolver';
import { MySignals } from './layout/my-signals/my-signals';
import { Pipes } from './layout/pipes/pipes';
import { Cart } from './layout/cart/cart';
import { Checkout } from './layout/checkout/checkout';

export const routes: Routes = [
    {path:'',component:Layout,children:[
        {path:'',redirectTo:'home',pathMatch:'full'},
        {path:'home',component:LayoutHome},
        {path:'products-list', component:Productslist},
        {path:'products-list/:slug', component:Productdetails, resolve:{myProductRes:ProductResolver}},
        {path:'cart', component:Cart},
        {path:'checkout',component:Checkout,canMatch:[userGuard]},
        {path:'account',loadComponent:()=> import('./layout/account/account').then(c=> c.Account),canMatch:[userGuard]},
        {path:'login',component:Login},
        {path:'signup',component:Signup,canDeactivate:[canDeactivateGuard]},
        {path:'parent',component:Parent},
        {path:'my-signals',component:MySignals},
        {path:'pipes',component:Pipes}

    ]},
    {path:'dashboard', component:Dashboard, canActivate:[adminGuard],children:[
        {path:'',redirectTo : 'home',pathMatch:'full'},
        {path:'home', component:Home},
        {path:'users-list',component:Userslist},
    ]},
    {path:'**', component:Notfound}

];
