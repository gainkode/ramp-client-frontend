import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PersonalGuard } from './personal.guard';
import { PersonalComponent } from './personal.component';
import { PersonalLoginComponent } from './auth/login.component';
import { PersonalRestoreComponent } from './auth/restore.component';
import { PersonalRegisterComponent } from './auth/register.component';
import { PersonalSuccessComponent } from './auth/success.component';
import { PersonalConfirmDeviceComponent } from './auth/confirm-device.component';
import { PersonalConfirmEmailComponent } from './auth/confirm-email.component';
import { PersonalResetComponent } from './auth/reset.component';
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
		component: PersonalLoginComponent,
		data: {authRoute: true},
		canActivate: [PersonalGuard]
	},
	{ 
		path: 'auth/register', 
		component: PersonalRegisterComponent,
		data: {authRoute: true},
		canActivate: [PersonalGuard]
	},
	{ path: 'auth/restore', component: PersonalRestoreComponent },
	{ path: 'auth/confirm-email/:token', component: PersonalConfirmEmailComponent },
	{ path: 'auth/confirm-device/:token', component: PersonalConfirmDeviceComponent },
	{ path: 'auth/success/:type', component: PersonalSuccessComponent },
	{ path: 'auth/new-password/:token', component: PersonalResetComponent },
	// Authenticated main profile
	{
		path: 'main',
		component: PersonalComponent,
		children: [
			{ path: 'home', component: ProfileHomeComponent },
			{ path: 'wallets', component: ProfileWalletsComponent },
			{ path: 'contactlist', component: ProfileContactsComponent },
			{ path: 'transactions/:wallet', component: ProfileTransactionsComponent },
			{ path: 'transactions', component: ProfileTransactionsComponent },
			{ path: '**', redirectTo: 'home' }
		],
		data: {mainAuthentificatedRoute: true},
		canActivate: [PersonalGuard]
	},
	// Authenticated account profile
	{
		path: 'account',
		component: PersonalComponent,
		children: [
			{ path: 'notifications', component: ProfileNotificationsComponent },
			{ path: 'settings/:page', component: ProfileSettingsComponent },
			{ path: 'settings', component: ProfileSettingsComponent },
			{ path: '**', redirectTo: 'settings' }
		],
		canActivate: [PersonalGuard]
	},
	{ 
		path: '**',
		redirectTo: 'auth/login'
		// component: PersonalComponent,
		// data: {mainAuthentificatedRoute: true},
		// canActivate: [PersonalGuard]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	declarations: [],
	exports: [RouterModule]
})
export class PersonalRoutingModule { }
