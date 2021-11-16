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
import { DirectiveModule } from '../directives/directives.module';
import { PersonalSwapComponent } from './profile/swap.component';
import { PersonalHomeComponent } from './profile/home.component';
import { PersonalMyAccountComponent } from './profile/my-account.component';
import { PersonalContactsComponent } from './profile/contacts.component';
import { PersonalTransactionsComponent } from './profile/transactions.component';
import { PersonalWalletsComponent } from './profile/wallets.component';
import { PersonalTransactionDetailsComponent } from './profile/details/transaction-details.component';
import { PersonalLoginComponent } from './auth/login.component';
import { PersonalRestoreComponent } from './auth/restore.component';
import { PersonalRegisterComponent } from './auth/register.component';
import { PersonalSuccessComponent } from './auth/success.component';
import { PersonalConfirmDeviceComponent } from './auth/confirm-device.component';
import { PersonalConfirmEmailComponent } from './auth/confirm-email.component';
import { PersonalResetComponent } from './auth/reset.component';
import { PersonalBalanceChartComponent } from './profile/data/balance-chart.component';
import { PersonalBalanceListComponent } from './profile/data/balance-list.component';
import { PersonalTransactionListComponent } from './profile/data/transaction-list.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PersonalNotificationsComponent } from './profile/notifications.component';
import { PersonalNotificationListComponent } from './profile/data/notification-list.component';
import { PersonalWalletListComponent } from './profile/data/wallet-list.component';
import { PersonalWalletDetailsComponent } from './profile/details/wallet-details.component';
import { PersonalWalletCreateComponent } from './profile/details/wallet-create.component';
import { PersonalContactListComponent } from './profile/data/contact-list.component';
import { PersonalContactCreateComponent } from './profile/details/contact-create.component';
import { PersonalPricelistComponent } from './profile/pricelist.component';

const routing = RouterModule.forChild([
    // Main page
    { path: 'intro', component: IntroPersonalComponent },
    // Authenticated profile
    {
        path: 'main',
        component: PersonalComponent,
        children: [
            { path: 'home', component: PersonalHomeComponent, canActivate: [PersonalGuard] },
            { path: 'wallets', component: PersonalWalletsComponent, canActivate: [PersonalGuard] },
            { path: 'contactlist', component: PersonalContactsComponent, canActivate: [PersonalGuard] },
            { path: 'transactions', component: PersonalTransactionsComponent, canActivate: [PersonalGuard] },
            { path: 'pricelist', component: PersonalPricelistComponent, canActivate: [PersonalGuard] },
            { path: 'notifications', component: PersonalNotificationsComponent, canActivate: [PersonalGuard] },
            { path: '**', redirectTo: 'home' }
        ],
        canActivate: [PersonalGuard]
    },
    // Auth pages
    { path: 'auth/login', component: PersonalLoginComponent },
    { path: 'auth/register', component: PersonalRegisterComponent },
    { path: 'auth/restore', component: PersonalRestoreComponent },
    { path: 'auth/confirm-email/:token', component: PersonalConfirmEmailComponent },
    { path: 'auth/confirm-device/:token', component: PersonalConfirmDeviceComponent },
    { path: 'auth/success/:type', component: PersonalSuccessComponent },
    { path: 'auth/new-password/:token', component: PersonalResetComponent },
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
        // Profile
        PersonalComponent,
        PersonalHomeComponent,
        PersonalWalletsComponent, PersonalWalletDetailsComponent, PersonalWalletCreateComponent,
        PersonalTransactionsComponent, PersonalTransactionDetailsComponent,
        PersonalContactsComponent, PersonalContactCreateComponent,
        PersonalPricelistComponent,
        PersonalSwapComponent,
        PersonalNotificationsComponent,
        // Data containers
        PersonalBalanceChartComponent, PersonalBalanceListComponent, PersonalTransactionListComponent, PersonalWalletListComponent,
        PersonalContactListComponent, PersonalNotificationListComponent,
        // Obsolete pages
        ProfileMainPersonalComponent, KycPersonalComponent, PersonalMyAccountComponent],
    providers: [PersonalGuard],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class PersonalModule { }
