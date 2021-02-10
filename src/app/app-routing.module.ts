import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  //{ path: "catalog", component: CatalogComponent },
  {
    path: "auth", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: "customer", loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule)
  },
  {
    path: "merchant", loadChildren: () => import('./merchant/merchant.module').then(m => m.MerchantModule)
  },
  { path: "**", redirectTo: "/" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
