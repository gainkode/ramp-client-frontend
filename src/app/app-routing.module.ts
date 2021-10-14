import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TermsComponent } from './terms.component';

const routes: Routes = [
  {
    path: 'payment', loadChildren: () => import('./payment/payment.module').
      then(m => m.PaymentModule)
  },
  { path: 'auth/personal/confirm-email/:token', redirectTo: '/personal/auth/confirm-email/:token' },
  { path: 'auth/personal/confirm-device/:token', redirectTo: '/personal/auth/confirm-device/:token' },
  { path: 'auth/personal/new-password/:token', redirectTo: '/personal/auth/new-password/:token' },
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
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: '/personal/intro' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  declarations: [TermsComponent],
  exports: [RouterModule]
})
export class AppRoutingModule { }
