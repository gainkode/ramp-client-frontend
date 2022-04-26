import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminNewComponent } from './admin_new.component';
import { AdminNewGuard } from './admin_new.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminTransactionsComponent } from './components/transactions/transactions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminNewComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
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
            path: 'users/:id',
            component: AdminTransactionsComponent,
            data: { header: 'Customer transactions' }
          },
          // {
          //   path: ':id',
          //   component: TransactionSingleComponent,
          //   data: { header: 'Transaction {:id}' }
          // },
          {
            path: '',
            component: AdminTransactionsComponent,
            data: { header: 'Transactions' }
          }
        ]
      },
    //   {
    //     path: 'customers',
    //     children: [
    //       {
    //         path: ':id',
    //         component: CustomerSingleComponent,
    //         data: { header: 'Customer {:id}' }
    //       },
    //       {
    //         path: '',
    //         component: CustomerListComponent,
    //         data: { header: 'Customers' }
    //       }
    //     ]
    //   },
    //   {
    //     path: 'wallets',
    //     children: [
    //       {
    //         path: 'crypto/users/:cryptouserid',
    //         component: AdminWalletsComponent,
    //         data: { header: 'Customer wallets' }
    //       },
    //       {
    //         path: 'crypto/vaults/:cryptovaultids',
    //         component: AdminWalletsComponent,
    //         data: { header: 'Transaction wallets' }
    //       },
    //       {
    //         path: '',
    //         component: AdminWalletsComponent,
    //         data: { header: 'Wallets' }
    //       },
    //     ]
    //   },
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
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class AdminNewRoutingModule {}
