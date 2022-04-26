import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminOldComponent } from './admin_old.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminOldGuard } from './admin_old.guard';
import { CustomerListComponent } from './components/customers/list/customer-list.component';
import { NotificationListComponent } from './components/notifications/list/notification-list.component';
import { IdentificationListComponent } from './components/identification/tab-list/identification-list.component';
import { ReconciliationComponent } from './components/reconciliation/reconciliation.component';
import { WidgetListComponent } from './components/widgets/list/widget-list.component';
import { TransactionListComponent } from './components/transactions/list/transaction-list.component';
import { TransactionSingleComponent } from './components/transactions/transaction-single/transaction-single.component';
import { FeeListComponent } from './components/fees/fee-list/fee-list.component';
import { RiskAlertListComponent } from './components/risk-center/list/risk-alert-list.component';
import { AdminSettingsComponent } from './components/settings/settings.component';
import { CustomerSingleComponent } from './components/customers/customer-single/customer-single.component';
import { SystemUserSingleComponent } from './components/system-users/user-single/user-single.component';
import { SystemUserListComponent } from './components/system-users/list/user-list.component';
import { CostTabListComponent } from './components/costs/tab-list/cost-tab-list.component';
import { AdminWalletsComponent } from './components/wallets/wallets.component';

const routes: Routes = [
  {
    path: '',
    component: AdminOldComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { header: 'Dashboard' }
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
        data: { header: 'Settings' }
      },
      {
        path: 'transactions',
        children: [
          {
            path: 'users/:id',
            component: TransactionListComponent,
            data: { header: 'Customer transactions' }
          },
          {
            path: ':id',
            component: TransactionSingleComponent,
            data: { header: 'Transaction {:id}' }
          },
          {
            path: '',
            component: TransactionListComponent,
            data: { header: 'Transactions' }
          }
        ]
      },
      {
        path: 'customers',
        children: [
          {
            path: ':id',
            component: CustomerSingleComponent,
            data: { header: 'Customer {:id}' }
          },
          {
            path: '',
            component: CustomerListComponent,
            data: { header: 'Customers' }
          }
        ]
      },
      {
        path: 'wallets',
        children: [
          {
            path: 'crypto/users/:cryptouserid',
            component: AdminWalletsComponent,
            data: { header: 'Customer wallets' }
          },
          {
            path: 'crypto/vaults/:cryptovaultids',
            component: AdminWalletsComponent,
            data: { header: 'Transaction wallets' }
          },
          {
            path: 'fiat/vaults/:fiatvaultids',
            component: AdminWalletsComponent,
            data: { header: 'Transaction wallets' }
          },
          {
            path: '',
            component: AdminWalletsComponent,
            data: { header: 'Wallets' }
          },
        ]
      },
      {
        path: 'fees',
        component: FeeListComponent,
        data: { header: 'Fees' }
      },
      {
        path: 'notifications',
        component: NotificationListComponent,
        data: { header: 'Notifications' }
      },
      {
        path: 'costs',
        component: CostTabListComponent,
        data: { header: 'Costs' }
      },
      {
        path: 'identification',
        component: IdentificationListComponent,
        data: { header: 'Identification' }
      },
      {
        path: 'reconciliation',
        component: ReconciliationComponent,
        data: { header: 'Reconciliation' }
      },
      {
        path: 'system-users',
        children: [
          {
            path: ':id',
            component: SystemUserSingleComponent,
            data: { header: 'User {:id}' }
          },
          {
            path: '',
            component: SystemUserListComponent,
            data: { header: 'System Users' }
          }
        ]
      },
      {
        path: 'risk-center',
        component: RiskAlertListComponent,
        data: { header: 'Risk center' }
      },
      {
        path: 'widgets',
        component: WidgetListComponent,
        data: { header: 'Widgets' }
      },
      {
        path: 'widgets/:userId',
        component: WidgetListComponent,
        data: { header: 'Widgets' }
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ],
    canActivate: [AdminOldGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class AdminOldRoutingModule {}
