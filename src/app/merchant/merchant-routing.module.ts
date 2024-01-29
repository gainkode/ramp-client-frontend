import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MerchantGuard } from './merchant.guard';
import { MerchantComponent } from './merchant.component';
import { MerchantLoginComponent } from './auth/login.component';
import { MerchantRestoreComponent } from './auth/restore.component';
import { MerchantSuccessComponent } from './auth/success.component';
import { MerchantRegisterComponent } from './auth/register.component';
import { MerchantResetComponent } from './auth/reset.component';
import { MerchantConfirmEmailComponent } from './auth/confirm-email.component';
import { MerchantConfirmDeviceComponent } from './auth/confirm-device.component';
import { ProfileContactsComponent } from '../profile/contacts/contacts.component';
import { ProfileWalletsComponent } from '../profile/wallets/wallets.component';
import { ProfileTransactionsComponent } from '../profile/transactions/transactions.component';
import { ProfileHomeComponent } from '../profile/home/home.component';
import { ProfileNotificationsComponent } from '../profile/notifications/notifications.component';
import { ProfileSettingsComponent } from '../profile/settings/settings.component';

export const routes: Routes = [
	// Auth pages
	{ 
		path: 'auth/login', 
		component: MerchantLoginComponent,
		data: {authRoute: true},
		canActivate: [MerchantGuard]
	},
	{ 
		path: 'auth/register', 
		component: MerchantRegisterComponent,
		data: {authRoute: true},
		canActivate: [MerchantGuard]
	},
	{ path: 'auth/restore', component: MerchantRestoreComponent },
	{ path: 'auth/confirm-email/:token', component: MerchantConfirmEmailComponent },
	{ path: 'auth/confirm-device/:token', component: MerchantConfirmDeviceComponent },
	{ path: 'auth/success/:type', component: MerchantSuccessComponent },
	{ path: 'auth/new-password/:token', component: MerchantResetComponent },
	// Authenticated main profile
	{
		path: 'main',
		component: MerchantComponent,
		children: [
			{ path: 'home', component: ProfileHomeComponent },
			{ path: 'wallets', component: ProfileWalletsComponent },
			{ path: 'contactlist', component: ProfileContactsComponent },
			{ path: 'transactions/:wallet', component: ProfileTransactionsComponent },
			{ path: 'transactions', component: ProfileTransactionsComponent },
			{ path: '**', redirectTo: 'home' }
		],
		data: {mainAuthentificatedRoute: true},
		canActivate: [MerchantGuard]
	},
	// Authenticated account profile
	{
		path: 'account',
		component: MerchantComponent,
		children: [
			{ path: 'notifications', component: ProfileNotificationsComponent },
			{ path: 'settings/:page', component: ProfileSettingsComponent },
			{ path: 'settings', component: ProfileSettingsComponent },
			{ path: '**', redirectTo: 'settings' }
		],
		canActivate: [MerchantGuard]
	},
	{ 
		path: '**',
		redirectTo: 'auth/login'
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	declarations: [],
	exports: [RouterModule]
})
export class MerchantRoutingModule { }
