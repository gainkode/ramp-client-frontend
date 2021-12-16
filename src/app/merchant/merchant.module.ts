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
import { KycMerchantComponent } from './profile/kyc.component';
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
import { PersonalNotificationsComponent } from '../profile/notifications/notifications.component';
import { ProfileSettingsComponent } from '../profile/settings/settings.component';
import { PersonalHomeComponent } from '../profile/home/home.component';
import { PersonalWalletsComponent } from '../profile/wallets/wallets.component';
import { PersonalContactsComponent } from '../profile/contacts/contacts.component';
import { PersonalTransactionsComponent } from '../profile/transactions/transactions.component';
import { PersonalPricelistComponent } from '../profile/pricelist/pricelist.component';

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
            { path: 'home', component: PersonalHomeComponent },
            { path: 'wallets', component: PersonalWalletsComponent },
            { path: 'contactlist', component: PersonalContactsComponent },
            { path: 'transactions', component: PersonalTransactionsComponent },
            { path: 'pricelist', component: PersonalPricelistComponent },
            { path: '**', redirectTo: 'home' }
        ],
        canActivate: [MerchantGuard]
    },
    // Authenticated account profile
    {
        path: 'account',
        component: MerchantComponent,
        children: [
            { path: 'notifications', component: PersonalNotificationsComponent },
            { path: 'settings/:page', component: ProfileSettingsComponent },
            { path: 'settings', component: ProfileSettingsComponent },
            { path: '**', redirectTo: 'settings' }
        ],
        canActivate: [MerchantGuard]
    },
    // Obsolete and temporary
    { path: 'kyc', component: KycMerchantComponent, canActivate: [MerchantGuard] },
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
        MerchantComponent,
        // Obsolete
        KycMerchantComponent],
    providers: [MerchantGuard],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class MerchantModule { }
