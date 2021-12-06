import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminGuard } from './admin.guard';
import { CustomerListComponent } from './components/customers/list/customer-list.component';
import { NotificationListComponent } from './components/notifications/list/notification-list.component';
import { CostsComponent } from './components/costs/costs.component';
import { IdentificationListComponent } from './components/identification/list/identification-list.component';
import { ReconciliationComponent } from './components/reconciliation/reconciliation.component';
import { SystemUsersComponent } from './components/system-users/system-users.component';
import { WidgetListComponent } from './components/widgets/list/widget-list.component';
import { TransactionListComponent } from './components/transactions/list/transaction-list.component';
import { TransactionSingleComponent } from './components/transactions/transaction-single/transaction-single.component';
import { WalletListComponent } from './components/wallets/list/wallet-list.component';
import { FeeListComponent } from './components/fees/fee-list/fee-list.component';
import { RiskAlertListComponent } from './components/risk-center/list/risk-alert-list.component';
import { CommonSettingsEditorComponent } from './components/common-settings/common-settings.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          header: 'Dashboard'
        }
      },
      {
        path: 'common-settings',
        component: CommonSettingsEditorComponent,
        data: {
          header: 'Common Settings'
        }
      },
      {
        path: 'transactions',
        children: [
          {
            path: ':id',
            component: TransactionSingleComponent,
            data: {
              header: 'Transaction {:id}'
            }
          },
          {
            path: '',
            component: TransactionListComponent,
            data: {
              header: 'Transactions'
            }
          }
        ]
      },
      {
        path: 'customers',
        component: CustomerListComponent,
        data: {
          header: 'Customers'
        }
      },
      {
        path: 'wallets',
        component: WalletListComponent,
        data: {
          header: 'Wallets'
        }
      },
      {
        path: 'fees',
        component: FeeListComponent,
        data: {
          header: 'Fees'
        }
      },
      {
        path: 'notifications',
        component: NotificationListComponent,
        data: {
          header: 'Notifications'
        }
      },
      {
        path: 'costs',
        component: CostsComponent,
        data: {
          header: 'Costs'
        }
      },
      {
        path: 'identification',
        component: IdentificationListComponent,
        data: {
          header: 'Identification'
        }
      },
      {
        path: 'reconciliation',
        component: ReconciliationComponent,
        data: {
          header: 'Reconciliation'
        }
      },
      {
        path: 'system-users',
        component: SystemUsersComponent,
        data: {
          header: 'System users'
        }
      },
      {
        path: 'risk-center',
        component: RiskAlertListComponent,
        data: {
          header: 'Risk center'
        }
      },
      {
        path: 'widgets',
        component: WidgetListComponent,
        data: {
          header: 'Widgets'
        }
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
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AdminRoutingModule {

}
