import { Routes } from '@angular/router';

import { adminGuard, customerGuard, guestGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/home';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';

import { CustomerLayoutComponent } from './features/customer/customer-layout/customer-layout';
import { CustomerDashboardComponent } from './features/customer/dashboard/customer-dashboard';
import { CustomerMedicinesComponent } from './features/customer/medicines/customer-medicines';
import { CartComponent } from './features/customer/cart/cart';
import { CheckoutComponent } from './features/customer/checkout/checkout';
import { CustomerOrdersComponent } from './features/customer/orders/customer-orders';

import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { MedicineList } from './features/admin/medicines/medicine-list/medicine-list';
import { MedicineForm } from './features/admin/medicines/medicine-form/medicine-form';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [customerGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: CustomerDashboardComponent
      },
      {
        path: 'medicines',
        component: CustomerMedicinesComponent
      },
      {
        path: 'cart',
        component: CartComponent
      },
      {
        path: 'checkout',
        component: CheckoutComponent
      },
      {
        path: 'orders',
        component: CustomerOrdersComponent
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'medicines',
        component: MedicineList
      },
      {
        path: 'medicines/add',
        component: MedicineForm
      },
      {
        path: 'medicines/edit/:id',
        component: MedicineForm
      },
      {
        path: 'orders',
        component: AdminOrdersComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
