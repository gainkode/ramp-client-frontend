import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth/personal', loadChildren: () => import('./auth-personal/auth.module').
    then(m => m.PersonalAuthModule)
  },
  {
    path: 'auth/merchant', loadChildren: () => import('./auth-merchant/auth.module').
    then(m => m.MerchantAuthModule)
  },
  {
    path: 'personal', loadChildren: () => import('./personal/personal.module').then(m => m.PersonalModule)
  },
  {
    path: 'merchant', loadChildren: () => import('./merchant/merchant.module').then(m => m.MerchantModule)
  },
  {
    path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '/personal/intro' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
