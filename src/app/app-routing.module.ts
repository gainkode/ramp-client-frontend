import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login.component';

const routes: Routes = [
  //{ path: "catalog", component: CatalogComponent },
  //{ path: 'categories', component: CategoriesComponent },
  //{ path: 'exchange', component: ExchangeComponent },
  {
    path: "auth", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { path: "**", redirectTo: "/" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
