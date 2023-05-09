import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';
import { AdminApiKeysComponent } from './components/settings/apikeys/apikeys.component';
import { AdminCurrencyPairsComponent } from './components/settings/currencyPairs/currencyPairs.component';
import { AdminBankAccountsComponent } from './components/costs/bank-accounts/accounts.component';
import { AdminCountryBlackListComponent } from './components/kyc/blacklist/countries.component';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminLevelsComponent } from './components/kyc/levels/levels.component';
import { AdminNotificationsComponent } from './components/notifications/notifications.component';
import { AdminRisksComponent } from './components/risks/risks.component';
import { AdminTransactionsComponent } from './components/transactions/transactions.component';
import { AdminCustomersComponent } from './components/users/customers/customers.component';
import { AdminSystemUsersComponent } from './components/users/system/users.component';
import { AdminCryptoWalletsComponent } from './components/wallets/crypto/crypto-wallets.component';
import { AdminFiatWalletsComponent } from './components/wallets/fiat/fiat-wallets.component';
import { AdminWidgetsComponent } from './components/widgets/widgets.component';
import { AdminCostSchemesComponent } from './components/costs/schemes/schemes.component';
import { AdminFeeSchemesComponent } from './components/fees/fees.component';
import { AdminCommonSettingsComponent } from './components/settings/common/common.component';
import { AdminUserDevicesComponent } from './components/users/devices/devices.component';
import { AdminKycTiersComponent } from './components/kyc/tiers/tiers.component';
import { AdminUserActionsComponent } from './components/users/actions/actions.component';
import { AdminTransactionStatusHistoryComponent } from './components/transactionStatusHistory/transaction-status-history.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: { header: 'Dashboard' }
      },
      {
        path: 'common',
        component: AdminCommonSettingsComponent,
        data: { header: 'Settings' }
      },
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
        path: 'transaction-status-history',
        children: [
          {
            path: 'users/:userid',
            component: AdminTransactionStatusHistoryComponent,
            data: { header: 'Customer transaction status history' }
          },
          {
            path: '',
            component: AdminTransactionStatusHistoryComponent,
            data: { header: 'Transaction history' }
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
        path: 'user-actions',
        component: AdminUserActionsComponent,
        data: { header: 'Actions' }
      },
      {
        path: 'white-device-list/:userid',
        component: AdminUserDevicesComponent,
        data: { header: 'White List' }
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
      {
        path: 'fees',
        component: AdminFeeSchemesComponent,
        data: { header: 'Fees' }
      },
      {
        path: 'notifications',
        component: AdminNotificationsComponent,
        data: { header: 'Notifications' }
      },
      {
        path: 'costs',
        component: AdminCostSchemesComponent,
        data: { header: 'Costs' }
      },
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
        path: 'tiers',
        component: AdminKycTiersComponent,
        data: { header: 'KYC Tiers' }
      },
      // {
      //   path: 'kyc-schemes',
      //   component: AdminKycSchemesComponent,
      //   data: { header: 'KYC Schemes' }
      // },
      {
        path: 'black-list',
        component: AdminCountryBlackListComponent,
        data: { header: 'Black list' }
      },
      //   {
      //     path: 'reconciliation',
      //     component: AdminReconciliationComponent,
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
        path: 'currency-pairs',
        component: AdminCurrencyPairsComponent,
        data: { header: 'Currency pairs' }
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ],
    canActivate: [AdminGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
