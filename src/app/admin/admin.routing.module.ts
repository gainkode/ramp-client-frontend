import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';
import { AdminBankAccountsComponent } from './components/costs/bank-accounts/accounts.component';
import { AdminCountryBlackListComponent } from './components/kyc/blacklist/countries.component';
import { AdminLevelsComponent } from './components/kyc/levels/levels.component';
import { AdminNotificationsComponent } from './components/notifications/notifications.component';
import { AdminMessagesComponent } from './components/message/messages.component';
import { AdminRisksComponent } from './components/risks/risks.component';
import { AdminCustomersComponent } from './components/users/customers/customers.component';
import { AdminSystemUsersComponent } from './components/users/system/users.component';
import { AdminCryptoWalletsComponent } from './components/wallets/crypto/crypto-wallets.component';
import { AdminFiatWalletsComponent } from './components/wallets/fiat/fiat-wallets.component';
import { AdminWidgetsComponent } from './components/widgets/widgets.component';
import { AdminCostSchemesComponent } from './components/costs/schemes/schemes.component';
import { AdminFeeSchemesComponent } from './components/fees/fees.component';
import { AdminUserDevicesComponent } from './components/users/devices/devices.component';
import { AdminKycTiersComponent } from './components/kyc/tiers/tiers.component';
import { AdminUserActionsComponent } from './components/users/actions/actions.component';
import { UserRoleObjectCode } from 'model/generated-models';
import { AdminTransactionsComponent, AdminTransactionStatusHistoryComponent, TransactionLifelineComponent } from './components/transactions';
import { AdminDashboardWrapperComponent, DashboardAdminComponent, DashboardMerchantComponent } from './components/dashboard';
import { AdminApiKeysComponent, AdminCommonSettingsComponent, AdminCurrencyPairsComponent, FaqPageComponent } from './components/settings';

export const routes: Routes = [
	{
		path: '',
		component: AdminComponent,
		children: [
			{
				path: 'dashboard',
				component: AdminDashboardWrapperComponent,
				data: { header: 'Dashboard', defaultRoute: true },
				canActivate: [AdminGuard],
				children: [
					{
						path: 'admin', 
						// add proper roleCode 'DashboarAdmin'
						data: { code: UserRoleObjectCode.Dashboard, main: true },
						component: DashboardAdminComponent, 
						canActivate: [AdminGuard]
					},
					{ 
						path: 'merchant', 
						// add proper roleCode 'DashboarMerchant'
						data: { code: UserRoleObjectCode.DashboardMerchant, main: true },
						component: DashboardMerchantComponent, 
						canActivate: [AdminGuard] 
					}
				]
			},
			{
				path: 'common',
				component: AdminCommonSettingsComponent,
				data: { header: 'Settings' }
			},

			{
				path: 'faq',
				component: FaqPageComponent,
				data: { header: 'FAQ' }
			},
			{
				path: 'transactions',
				data: { code: UserRoleObjectCode.Transactions },
				canActivate: [AdminGuard],
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
				path: 'transaction-lifeline',
				component: TransactionLifelineComponent,
				data: { header: 'Transaction Lifeline', code: UserRoleObjectCode.Transactions },
				canActivate: [AdminGuard]
			},
			{
				path: 'transaction-status-history',
				data: { code: UserRoleObjectCode.TransactionHistoryLog },
				canActivate: [AdminGuard],
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
				data: { code: UserRoleObjectCode.Customers },
				canActivate: [AdminGuard],
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
				data: { code: UserRoleObjectCode.SystemUsers },
				canActivate: [AdminGuard],
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
				data: { header: 'Actions', code: UserRoleObjectCode.UserActions },
				canActivate: [AdminGuard],
			},
			{
				path: 'white-device-list/:userid',
				component: AdminUserDevicesComponent,
				data: { header: 'White List' }
			},
			{
				path: 'crypto-wallets',
				data: { code: UserRoleObjectCode.Wallets },
				canActivate: [AdminGuard],
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
				data: { code: UserRoleObjectCode.Wallets },
				canActivate: [AdminGuard],
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
				data: { header: 'Fees', code: UserRoleObjectCode.Fees },
				canActivate: [AdminGuard],
				component: AdminFeeSchemesComponent,
			},
			{
				path: 'notifications',
				data: { header: 'Notifications', code: UserRoleObjectCode.Notifications },
				canActivate: [AdminGuard],
				component: AdminNotificationsComponent
			},
			{
				path: 'emails',
				data: { header: 'Emails', code: UserRoleObjectCode.Messages },
				canActivate: [AdminGuard],
				component: AdminMessagesComponent,
			},
			{
				path: 'costs',
				data: { header: 'Costs', code: UserRoleObjectCode.Costs },
				canActivate: [AdminGuard],
				component: AdminCostSchemesComponent
			},
			{
				path: 'bank-accounts',
				data: { header: 'Bank accounts', code: UserRoleObjectCode.BankAccounts },
				canActivate: [AdminGuard],
				component: AdminBankAccountsComponent
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
				data: { header: 'Black list', code: UserRoleObjectCode.CountryBlackList },
				canActivate: [AdminGuard],
				component: AdminCountryBlackListComponent
			},
			{
				path: 'risk-center',
				data: { header: 'Risk center', code: UserRoleObjectCode.Risks },
				canActivate: [AdminGuard],
				component: AdminRisksComponent
			},
			{
				path: 'widgets',
				data: { header: 'Widgets', code: UserRoleObjectCode.Widgets },
				canActivate: [AdminGuard],
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
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminRoutingModule { }
