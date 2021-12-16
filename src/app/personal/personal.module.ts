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
import { KycPersonalComponent } from './profile/kyc.component';
import { ComponentsModule } from '../components/components.module';
import { DirectiveModule } from '../directives/directives.module';
import { PersonalLoginComponent } from './auth/login.component';
import { PersonalRestoreComponent } from './auth/restore.component';
import { PersonalRegisterComponent } from './auth/register.component';
import { PersonalSuccessComponent } from './auth/success.component';
import { PersonalConfirmDeviceComponent } from './auth/confirm-device.component';
import { PersonalConfirmEmailComponent } from './auth/confirm-email.component';
import { PersonalResetComponent } from './auth/reset.component';
import { ProfileModule } from '../profile/profile.module';
import { PersonalContactsComponent } from '../profile/contacts/contacts.component';
import { PersonalWalletsComponent } from '../profile/wallets/wallets.component';
import { PersonalTransactionsComponent } from '../profile/transactions/transactions.component';
import { PersonalPricelistComponent } from '../profile/pricelist/pricelist.component';
import { PersonalHomeComponent } from '../profile/home/home.component';
import { ProfileNotificationsComponent } from '../profile/notifications/notifications.component';
import { ProfileSettingsComponent } from '../profile/settings/settings.component';
import { WidgetModule } from '../widget/widget.module';

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
            { path: 'home', component: PersonalHomeComponent },
            { path: 'wallets', component: PersonalWalletsComponent },
            { path: 'contactlist', component: PersonalContactsComponent },
            { path: 'transactions', component: PersonalTransactionsComponent },
            { path: 'pricelist', component: PersonalPricelistComponent },
            { path: '**', redirectTo: 'home' }
        ],
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
    // Obsolete and temporary
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
    ProfileModule
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
        // Obsolete pages
        KycPersonalComponent],
    providers: [PersonalGuard],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class PersonalModule { }
