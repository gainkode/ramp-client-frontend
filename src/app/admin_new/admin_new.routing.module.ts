import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminNewComponent } from './admin_new.component';
import { AdminNewGuard } from './admin_new.guard';
import { AdminApiKeysComponent } from './components/apikeys/apikeys.component';
import { AdminBankAccountsComponent } from './components/bank-accounts/accounts.component';
import { AdminCountryBlackListComponent } from './components/blacklist/countries.component';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminLevelsComponent } from './components/levels/levels.component';
import { AdminNotificationsComponent } from './components/notifications/notifications.component';
import { AdminRisksComponent } from './components/risks/risks.component';
import { AdminTransactionsComponent } from './components/transactions/transactions.component';
import { AdminCustomersComponent } from './components/users/customers/customers.component';
import { AdminSystemUsersComponent } from './components/users/system/users.component';
import { AdminCryptoWalletsComponent } from './components/wallets/crypto/crypto-wallets.component';
import { AdminFiatWalletsComponent } from './components/wallets/fiat/fiat-wallets.component';
import { AdminWidgetsComponent } from './components/widgets/widgets.component';

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
        path: 'system-users',
        children: [
          {
            path: ':id',
            component: AdminSystemUsersComponent,
            data: { header: 'System user {:id}' }
          },
          {
            path: '',
            component: AdminSystemUsersComponent,
            data: { header: 'System users' }
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
      {
        path: 'notifications',
        component: AdminNotificationsComponent,
        data: { header: 'Notifications' }
      },
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
      {
        path: 'bank-accounts',
        component: AdminBankAccountsComponent,
        data: { header: 'Bank accounts' }
      },
      {
        path: 'levels',
        component: AdminLevelsComponent,
        data: { header: 'Levels' }
      },
      {
        path: 'black-list',
        component: AdminCountryBlackListComponent,
        data: { header: 'Black list' }
      },
      //   {
      //     path: 'reconciliation',
      //     component: ReconciliationComponent,
      //     data: { header: 'Reconciliation' }
      //   },
      {
        path: 'risk-center',
        component: AdminRisksComponent,
        data: { header: 'Risk center' }
      },
      {
        path: 'widgets',
        children: [
          {
            path: ':userId',
            component: AdminWidgetsComponent,
            data: { header: 'User Widgets' }
          },
          {
            path: '',
            component: AdminWidgetsComponent,
            data: { header: 'Widgets' }
          }
        ]
      },
      {
        path: 'api-keys',
        component: AdminApiKeysComponent,
        data: { header: 'API keys' }
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
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
