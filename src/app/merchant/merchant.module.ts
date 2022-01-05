import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MerchantGuard } from './merchant.guard';
import { MerchantComponent } from './merchant.component';
import { IntroMerchantComponent } from './intro.component';
import { ComponentsModule } from '../components/components.module';
import { MerchantLoginComponent } from './auth/login.component';
import { MerchantRestoreComponent } from './auth/restore.component';
import { MerchantSuccessComponent } from './auth/success.component';
import { MerchantRegisterComponent } from './auth/register.component';
import { MerchantResetComponent } from './auth/reset.component';
import { MerchantConfirmEmailComponent } from './auth/confirm-email.component';
import { MerchantConfirmDeviceComponent } from './auth/confirm-device.component';
import { WidgetModule } from '../widget/widget.module';
import { ProfileModule } from '../profile/profile.module';
import { ProfileNotificationsComponent } from '../profile/notifications/notifications.component';
import { ProfileSettingsComponent } from '../profile/settings/settings.component';
import { ProfileHomeComponent } from '../profile/home/home.component';
import { ProfileWalletsComponent } from '../profile/wallets/wallets.component';
import { ProfileContactsComponent } from '../profile/contacts/contacts.component';
import { ProfileTransactionsComponent } from '../profile/transactions/transactions.component';
import { ProfilePriceListComponent } from '../profile/pricelist/data/price-list.component';

const routing = RouterModule.forChild([
    { path: 'intro', component: IntroMerchantComponent },
    // Auth pages
    { path: 'auth/login', component: MerchantLoginComponent },
    { path: 'auth/register', component: MerchantRegisterComponent },
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
            { path: 'transactions', component: ProfileTransactionsComponent },
            { path: 'pricelist', component: ProfilePriceListComponent },
            { path: '**', redirectTo: 'home' }
        ],
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
    { path: '**', redirectTo: 'main' }
]);

const modules = [
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatProgressBarModule,
    ComponentsModule,
    WidgetModule,
    ProfileModule
];

@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule { }

@NgModule({
    imports: [ CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule ],
    declarations: [IntroMerchantComponent,
        // Auth
        MerchantLoginComponent, MerchantRegisterComponent, MerchantRestoreComponent, MerchantResetComponent,
        MerchantConfirmEmailComponent, MerchantConfirmDeviceComponent, MerchantSuccessComponent,
        // Profile main
        MerchantComponent],
    providers: [MerchantGuard],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class MerchantModule { }
