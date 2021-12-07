import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { PersonalGuard } from './personal.guard';
import { IntroPersonalComponent } from './intro.component';
import { PersonalComponent } from './personal.component';
import { ProfileMainPersonalComponent } from './profile/main.component';
import { KycPersonalComponent } from './profile/kyc.component';
import { ComponentsModule } from '../components/components.module';
import { WidgetModule } from '../widget/widget.module';
import { DirectiveModule } from '../directives/directives.module';
import { PersonalMyAccountComponent } from './profile/my-account.component';
import { PersonalLoginComponent } from './auth/login.component';
import { PersonalRestoreComponent } from './auth/restore.component';
import { PersonalRegisterComponent } from './auth/register.component';
import { PersonalSuccessComponent } from './auth/success.component';
import { PersonalConfirmDeviceComponent } from './auth/confirm-device.component';
import { PersonalConfirmEmailComponent } from './auth/confirm-email.component';
import { PersonalResetComponent } from './auth/reset.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PersonalPaymentCompleteComponent } from './profile/details/payment-complete.component';
import { PersonalSettingsComponent } from './profile/settings/settings.component';
import { PersonalVerificationSettingsComponent } from './profile/settings/panels/verification.component';
import { PersonalInfoSettingsComponent } from './profile/settings/panels/personal-info.component';
import { PersonalSecuriySettingsComponent } from './profile/settings/panels/security.component';
import { PersonalContactsComponent } from './profile/contacts/contacts.component';
import { PersonalContactDetailsComponent } from './profile/contacts/details/contact-details.component';
import { PersonalContactCreateComponent } from './profile/contacts/details/contact-create.component';
import { PersonalContactListComponent } from './profile/contacts/data/contact-list.component';
import { PersonalHomeComponent } from './profile/home/home.component';
import { PersonalBalanceChartComponent } from './profile/home/data/balance-chart.component';
import { PersonalBalanceListComponent } from './profile/home/data/balance-list.component';
import { PersonalWalletsComponent } from './profile/wallets/wallets.component';
import { PersonalWalletDetailsComponent } from './profile/wallets/details/wallet-details.component';
import { PersonalWalletCreateComponent } from './profile/wallets/details/wallet-create.component';
import { PersonalWalletListComponent } from './profile/wallets/data/wallet-list.component';
import { PersonalTransactionsComponent } from './profile/transactions/transactions.component';
import { PersonalTransactionDetailsComponent } from './profile/transactions/details/transaction-details.component';
import { PersonalTransactionListComponent } from './profile/transactions/data/transaction-list.component';
import { SettingsMenuBarComponent } from './profile/settings/bar/settings-bar.component';
import { PersonalNotificationsComponent } from './profile/notifications/notifications.component';
import { PersonalNotificationListComponent } from './profile/notifications/data/notification-list.component';
import { PersonalPricelistComponent } from './profile/pricelist/pricelist.component';
import { PersonalChangePasswordComponent } from './profile/settings/components/password.component';

const routing = RouterModule.forChild([
    // Main page
    { path: 'intro', component: IntroPersonalComponent },
    // Auth pages
    { path: 'auth/login', component: PersonalLoginComponent },
    { path: 'auth/register', component: PersonalRegisterComponent },
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
            { path: 'home', component: PersonalHomeComponent},
            { path: 'wallets', component: PersonalWalletsComponent, canActivate: [PersonalGuard] },
            { path: 'contactlist', component: PersonalContactsComponent, canActivate: [PersonalGuard] },
            { path: 'transactions', component: PersonalTransactionsComponent, canActivate: [PersonalGuard] },
            { path: 'pricelist', component: PersonalPricelistComponent, canActivate: [PersonalGuard] },
            { path: '**', redirectTo: 'home' }
        ],
        canActivate: [PersonalGuard]
    },
    // Authenticated account profile
    {
        path: 'account',
        component: PersonalComponent,
        children: [
            { path: 'notifications', component: PersonalNotificationsComponent, canActivate: [PersonalGuard] },
            { path: 'settings/:page', component: PersonalSettingsComponent, canActivate: [PersonalGuard] },
            { path: 'settings', component: PersonalSettingsComponent, canActivate: [PersonalGuard] },
            { path: '**', redirectTo: 'settings' }
        ],
        canActivate: [PersonalGuard]
    },
    // Obsolete and temporary
    { path: 'profile', component: ProfileMainPersonalComponent, canActivate: [PersonalGuard] },
    { path: 'myaccount', component: PersonalMyAccountComponent, canActivate: [PersonalGuard] },
    { path: 'kyc', component: KycPersonalComponent, canActivate: [PersonalGuard] },
    // ======================
    { path: '**', redirectTo: 'main' }
]);

const modules = [
    MatTabsModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    ComponentsModule,
    WidgetModule,
    NgApexchartsModule
];

@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule { }

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule, DirectiveModule],
    declarations: [
        // Intro
        IntroPersonalComponent,
        // Auth
        PersonalLoginComponent, PersonalRegisterComponent, PersonalRestoreComponent, PersonalResetComponent,
        PersonalConfirmEmailComponent, PersonalConfirmDeviceComponent, PersonalSuccessComponent,
        // Profile main
        PersonalComponent,
        PersonalHomeComponent,
        PersonalWalletsComponent, PersonalWalletDetailsComponent, PersonalWalletCreateComponent,
        PersonalTransactionsComponent, PersonalTransactionDetailsComponent,
        PersonalContactsComponent, PersonalContactDetailsComponent, PersonalContactCreateComponent,
        PersonalPricelistComponent,
        PersonalNotificationsComponent,
        PersonalSettingsComponent, SettingsMenuBarComponent,
        PersonalInfoSettingsComponent, PersonalVerificationSettingsComponent, PersonalSecuriySettingsComponent,
        // Data containers
        PersonalBalanceChartComponent, PersonalBalanceListComponent, PersonalTransactionListComponent, PersonalWalletListComponent,
        PersonalContactListComponent, PersonalNotificationListComponent, PersonalPaymentCompleteComponent,
        // Component blocks
        PersonalChangePasswordComponent,
        // Obsolete pages
        ProfileMainPersonalComponent, KycPersonalComponent, PersonalMyAccountComponent],
    providers: [PersonalGuard],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class PersonalModule { }
