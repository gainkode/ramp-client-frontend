import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentsModule } from '../components/components.module';
import { RouterModule } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ProfileContactsComponent } from './contacts/contacts.component';
import { ProfileContactListComponent } from './contacts/data/contact-list.component';
import { ProfileContactCreateComponent } from './contacts/details/contact-create.component';
import { ProfileContactDetailsComponent } from './contacts/details/contact-details.component';
import { ProfileWalletsComponent } from './wallets/wallets.component';
import { ProfileWalletCreateComponent } from './wallets/details/wallet-create.component';
import { ProfileWalletDetailsComponent } from './wallets/details/wallet-details.component';
import { ProfileWalletListComponent } from './wallets/data/wallet-list.component';
import { ProfilePaymentCompleteComponent } from './details/payment-complete.component';
import { ProfileTransactionsComponent } from './transactions/transactions.component';
import { ProfileTransactionDetailsComponent } from './transactions/details/transaction-details.component';
import { ProfileTransactionListComponent } from './transactions/data/transaction-list.component';
import { ProfilePriceListComponent } from './pricelist/data/price-list.component';
import { ProfileHomeComponent } from './home/home.component';
import { ProfileBalanceChartComponent } from './home/data/balance-chart.component';
import { ProfileBalanceListComponent } from './home/data/balance-list.component';
import { ProfileNotificationsComponent } from './notifications/notifications.component';
import { ProfileNotificationListComponent } from './notifications/data/notification-list.component';
import { ProfileSettingsComponent } from './settings/settings.component';
import { SettingsMenuBarComponent } from './settings/bar/settings-bar.component';
import { ProfileInfoSettingsComponent } from './settings/panels/info.component';
import { ProfileVerificationSettingsComponent } from './settings/panels/verification.component';
import { ProfileSecuriySettingsComponent } from './settings/panels/security.component';
import { ProfileChangePasswordComponent } from './settings/components/password.component';
import { ProfileInfoTextboxComponent } from './settings/components/info-textbox.component';
import { ProfileInfoDateboxComponent } from './settings/components/info-datebox.component';
import { ProfileInfoDropboxComponent } from './settings/components/info-dropbox.component';
import { ProfilePaymentErrorComponent } from './details/payment-error.component';
import { ProfileApiKeysSettingsComponent } from './settings/panels/apikeys.component';
import { ProfileIpListSettingsComponent } from './settings/panels/ip-list.component';
import { ShortHashPipe } from './pipes/short-hash.pipe';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const modules = [
	MatTabsModule,
	MatDialogModule,
	MatButtonModule,
	MatFormFieldModule,
	MatInputModule,
	MatTooltipModule,
	MatSelectModule,
	MatCheckboxModule,
	MatIconModule,
	MatListModule,
	MatProgressBarModule,
	MatPaginatorModule,
	MatTableModule,
	MatSortModule,
	ComponentsModule,
	NgApexchartsModule
];

@NgModule({
	imports: [...modules],
	exports: [...modules]
})
export class MaterialModule { }

@NgModule({
	imports: [
		NgxMaskModule.forRoot(), CommonModule, ClipboardModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule, QRCodeModule],
	declarations: [
		ProfileHomeComponent, ProfileBalanceChartComponent, ProfileBalanceListComponent,
		ProfileTransactionsComponent, ProfileTransactionListComponent, ProfileTransactionDetailsComponent,
		ProfileContactsComponent, ProfileContactListComponent, ProfileContactCreateComponent, ProfileContactDetailsComponent,
		ProfileWalletsComponent, ProfileWalletListComponent, ProfileWalletCreateComponent, ProfileWalletDetailsComponent,
		ProfilePriceListComponent,
		ProfilePaymentCompleteComponent, ProfilePaymentErrorComponent,
		ProfileNotificationsComponent, ProfileNotificationListComponent,
		ProfileSettingsComponent, ProfileInfoSettingsComponent, ProfileVerificationSettingsComponent,
		ProfileSecuriySettingsComponent, ProfileApiKeysSettingsComponent, ProfileIpListSettingsComponent,
		ProfileChangePasswordComponent, ProfileInfoTextboxComponent, ProfileInfoDateboxComponent, ProfileInfoDropboxComponent,
		SettingsMenuBarComponent,
		ShortHashPipe
	],
	exports: [
		ProfileHomeComponent,
		ProfileTransactionsComponent, ProfileTransactionDetailsComponent,
		ProfileContactsComponent, ProfileContactCreateComponent, ProfileContactDetailsComponent,
		ProfileWalletsComponent, ProfileWalletCreateComponent, ProfileWalletDetailsComponent,
		ProfilePriceListComponent,
		ProfilePaymentCompleteComponent, ProfilePaymentErrorComponent,
		ProfileNotificationsComponent,
		ProfileSettingsComponent, ShortHashPipe
	],
	providers: [],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileModule { }
