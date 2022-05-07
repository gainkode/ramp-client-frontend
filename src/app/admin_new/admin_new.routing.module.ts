import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminNewComponent } from './admin_new.component';
import { AdminNewGuard } from './admin_new.guard';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminTransactionsComponent } from './components/transactions/transactions.component';
import { AdminCustomersComponent } from './components/users/customers/customers.component';
import { AdminCryptoWalletsComponent } from './components/wallets/crypto/crypto-wallets.component';
import { AdminFiatWalletsComponent } from './components/wallets/fiat/fiat-wallets.component';

const routes: Routes = [
  {
    path: '',
    component: AdminNewComponent,
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: { header: 'Dashboard' }
      },
      //   {
      //     path: 'settings',
      //     component: AdminSettingsComponent,
      //     data: { header: 'Settings' }
      //   },
      {
        path: 'transactions',
        children: [
          {
            path: 'users/:userid',
            component: AdminTransactionsComponent,
            data: { header: 'Customer transactions' }
          },
          {
            path: '',
            component: AdminTransactionsComponent,
            data: { header: 'Transactions' }
          }
        ]
      },
      {
        path: 'customers',
        children: [
          {
            path: ':id',
            component: AdminCustomersComponent,
            data: { header: 'Customer {:id}' }
          },
          {
            path: '',
            component: AdminCustomersComponent,
            data: { header: 'Customers' }
          }
        ]
      },
      {
        path: 'crypto-wallets',
        children: [
          {
            path: 'users/:userid',
            component: AdminCryptoWalletsComponent,
            data: { header: 'Customer crypto wallets' }
          },
          {
            path: 'vaults/:vaultids',
            component: AdminCryptoWalletsComponent,
            data: { header: 'Transaction crypto wallets' }
          },
          {
            path: '',
            component: AdminCryptoWalletsComponent,
            data: { header: 'Wallets' }
          },
        ]
      },
      {
        path: 'fiat-wallets',
        children: [
          {
            path: 'users/:userid',
            component: AdminFiatWalletsComponent,
            data: { header: 'Customer fiat wallets' }
          },
          {
            path: 'vaults/:vaultids',
            component: AdminFiatWalletsComponent,
            data: { header: 'Transaction fiat wallets' }
          },
          {
            path: '',
            component: AdminFiatWalletsComponent,
            data: { header: 'Wallets' }
          },
        ]
      },
      //   {
      //     path: 'fees',
      //     component: FeeListComponent,
      //     data: { header: 'Fees' }
      //   },
      //   {
      //     path: 'notifications',
      //     component: NotificationListComponent,
      //     data: { header: 'Notifications' }
      //   },
      //   {
      //     path: 'costs',
      //     component: CostTabListComponent,
      //     data: { header: 'Costs' }
      //   },
      //   {
      //     path: 'identification',
      //     component: IdentificationListComponent,
      //     data: { header: 'Identification' }
      //   },
      //   {
      //     path: 'reconciliation',
      //     component: ReconciliationComponent,
      //     data: { header: 'Reconciliation' }
      //   },
      //   {
      //     path: 'system-users',
      //     children: [
      //       {
      //         path: ':id',
      //         component: SystemUserSingleComponent,
      //         data: { header: 'User {:id}' }
      //       },
      //       {
      //         path: '',
      //         component: SystemUserListComponent,
      //         data: { header: 'System Users' }
      //       }
      //     ]
      //   },
      //   {
      //     path: 'risk-center',
      //     component: RiskAlertListComponent,
      //     data: { header: 'Risk center' }
      //   },
      //   {
      //     path: 'widgets',
      //     component: WidgetListComponent,
      //     data: { header: 'Widgets' }
      //   },
      //   {
      //     path: 'widgets/:userId',
      //     component: WidgetListComponent,
      //     data: { header: 'Widgets' }
      //   },
      //   {
      //     path: '**',
      //     redirectTo: 'dashboard'
      //   }
    ],
    canActivate: [AdminNewGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminNewRoutingModule { }
