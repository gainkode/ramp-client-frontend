import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
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
import { PersonalMyContactsComponent } from './profile/my-contacts.component';
import { PersonalTransactionsComponent } from './profile/transactions.component';
import { PersonalMyWalletsComponent } from './profile/my-wallets.component';
import { PersonalTransactionDetailsComponent } from './profile/details/transaction-details.component';

const routing = RouterModule.forChild([
    { path: 'intro', component: IntroPersonalComponent },
    {
        path: 'main',
        component: PersonalComponent,
        children: [
            { path: 'home', component: PersonalHomeComponent, canActivate: [PersonalGuard] },
            { path: 'wallets', component: PersonalMyWalletsComponent, canActivate: [PersonalGuard] },
            { path: 'myaccount', component: PersonalMyAccountComponent, canActivate: [PersonalGuard] },
            { path: 'contactlist', component: PersonalMyContactsComponent, canActivate: [PersonalGuard] },
            { path: 'transactions', component: PersonalTransactionsComponent, canActivate: [PersonalGuard] },
            { path: 'swap', component: PersonalSwapComponent, canActivate: [PersonalGuard] },
            { path: '**', redirectTo: 'home' }
        ],
        canActivate: [PersonalGuard]
    },
    { path: 'profile', component: ProfileMainPersonalComponent, canActivate: [PersonalGuard] },
    { path: 'kyc', component: KycPersonalComponent, canActivate: [PersonalGuard] },
    { path: '**', redirectTo: 'main' }
]);

const modules = [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    ComponentsModule
];

@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule { }

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule, DirectiveModule],
    declarations: [
        IntroPersonalComponent, PersonalComponent, ProfileMainPersonalComponent, 
        PersonalHomeComponent,
        PersonalMyWalletsComponent,
        PersonalMyContactsComponent,
        PersonalTransactionsComponent, PersonalTransactionDetailsComponent,
        PersonalSwapComponent,
        KycPersonalComponent, PersonalMyAccountComponent],
    providers: [PersonalGuard],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class PersonalModule { }
