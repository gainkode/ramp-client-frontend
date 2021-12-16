import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask'
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
import { PersonalContactsComponent } from './contacts/contacts.component';
import { PersonalContactListComponent } from './contacts/data/contact-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PersonalContactCreateComponent } from './contacts/details/contact-create.component';
import { PersonalContactDetailsComponent } from './contacts/details/contact-details.component';
import { PersonalWalletsComponent } from './wallets/wallets.component';
import { PersonalWalletCreateComponent } from './wallets/details/wallet-create.component';
import { PersonalWalletDetailsComponent } from './wallets/details/wallet-details.component';
import { PersonalWalletListComponent } from './wallets/data/wallet-list.component';
import { PersonalPaymentCompleteComponent } from './details/payment-complete.component';
import { PersonalTransactionsComponent } from './transactions/transactions.component';
import { PersonalTransactionDetailsComponent } from './transactions/details/transaction-details.component';
import { PersonalTransactionListComponent } from './transactions/data/transaction-list.component';
import { PersonalPricelistComponent } from './pricelist/pricelist.component';
import { PersonalHomeComponent } from './home/home.component';
import { PersonalBalanceChartComponent } from './home/data/balance-chart.component';
import { PersonalBalanceListComponent } from './home/data/balance-list.component';
import { PersonalNotificationsComponent } from './notifications/notifications.component';
import { PersonalNotificationListComponent } from './notifications/data/notification-list.component';
import { ProfileSettingsComponent } from './settings/settings.component';
import { SettingsMenuBarComponent } from './settings/bar/settings-bar.component';
import { ProfileInfoSettingsComponent } from './settings/panels/info.component';
import { ProfileVerificationSettingsComponent } from './settings/panels/verification.component';
import { ProfileSecuriySettingsComponent } from './settings/panels/security.component';
import { ProfileChangePasswordComponent } from './settings/components/password.component';
import { ProfileInfoTextboxComponent } from './settings/components/info-textbox.component';
import { ProfileInfoDateboxComponent } from './settings/components/info-datebox.component';
import { ProfileInfoDropboxComponent } from './settings/components/info-dropbox.component';

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
        PersonalHomeComponent, PersonalBalanceChartComponent, PersonalBalanceListComponent,
        PersonalTransactionsComponent, PersonalTransactionListComponent, PersonalTransactionDetailsComponent,
        PersonalContactsComponent, PersonalContactListComponent, PersonalContactCreateComponent, PersonalContactDetailsComponent,
        PersonalWalletsComponent, PersonalWalletListComponent, PersonalWalletCreateComponent, PersonalWalletDetailsComponent,
        PersonalPricelistComponent,
        PersonalPaymentCompleteComponent, 
        PersonalNotificationsComponent, PersonalNotificationListComponent,
        ProfileSettingsComponent, ProfileInfoSettingsComponent, ProfileVerificationSettingsComponent, ProfileSecuriySettingsComponent,
        ProfileChangePasswordComponent, ProfileInfoTextboxComponent, ProfileInfoDateboxComponent, ProfileInfoDropboxComponent,
        SettingsMenuBarComponent
    ],
    exports: [
        PersonalHomeComponent,
        PersonalTransactionsComponent, PersonalTransactionDetailsComponent,
        PersonalContactsComponent, PersonalContactCreateComponent, PersonalContactDetailsComponent,
        PersonalWalletsComponent, PersonalWalletCreateComponent, PersonalWalletDetailsComponent,
        PersonalPricelistComponent,
        PersonalPaymentCompleteComponent,
        PersonalNotificationsComponent,
        ProfileSettingsComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileModule { }
