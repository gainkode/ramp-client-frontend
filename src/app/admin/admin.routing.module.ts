import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    // children: [
    //   {
    //     path: 'dashboard',
    //     component: DashboardComponent,
    //     data: { header: 'Dashboard' }
    //   },
    //   {
    //     path: 'settings',
    //     component: AdminSettingsComponent,
    //     data: { header: 'Settings' }
    //   },
    //   {
    //     path: 'transactions',
    //     children: [
    //       {
    //         path: 'users/:id',
    //         component: TransactionListComponent,
    //         data: { header: 'Customer transactions' }
    //       },
    //       {
    //         path: ':id',
    //         component: TransactionSingleComponent,
    //         data: { header: 'Transaction {:id}' }
    //       },
    //       {
    //         path: '',
    //         component: TransactionListComponent,
    //         data: { header: 'Transactions' }
    //       }
    //     ]
    //   },
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
    // ],
    canActivate: [AdminGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class AdminRoutingModule {}
