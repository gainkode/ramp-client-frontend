import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { QRCodeModule } from 'angularx-qrcode';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';

import { DirectiveModule } from '../directives/directives.module';
import { LineBreakPipe } from '../utils/line-break.pipe';
import { NumberFillPipe } from '../utils/number-fill.pipe';

import { DropdownItemComponent } from './common/dropdown-item.component';
import { BackButtonComponent } from './common/backbutton.component';
import { TabLabelComponent } from './common/tablabel.component';
import { KycPanelComponent } from './kyc-panel.component';
import { CommonDialogBox } from './common/common-box.dialog';
import { CheckoutSummaryComponent } from './payment/checkout-summary.component';
import { ExchangeRateComponent } from './payment/exchange-rate.component';
import { LoginPanelComponent } from './auth/login-panel.component';
import { CheckoutDoneComponent } from './payment/checkout-done.component';
import { CreditCardComponent } from './payment/credit-card.component';
import { TwoFaCodeComponent } from './auth/two-fa-code.component';
import { NavPopupComponent } from './common/nav-popup/nav-popup.component';
import { SideExpanderComponent } from './common/side-expander.component';
import { SideMenuComponent } from './common/side-menu.component';
import { SignUpPanelComponent } from './auth/signup-panel.component';
import { SignupInfoPanelComponent } from './auth/signup-info.component';

import { ProfileAccountBalanceComponent } from './profile/profile-account-balance.component';
import { ProfileExchangeComponent } from './profile/profile-exchange.component';
import { ProfileNotificationsComponent } from './profile/profile-notifications.component';
import { ProfileQuickTransferComponent } from './profile/profile-quick-transfer.component';
import { ProfileTransactionsComponent } from './profile/profile-transactions.component';
import { ProfileInfoComponent } from './profile/profile-info.component';
import { ProfileTwoFAComponent } from './profile/profile-two-fa.component';
import { ProfilePasswordComponent } from './profile/profile-password.component';
import { ProfileVerificationComponent } from './profile/profile-verification.component';
import { ProfileContactsComponent } from './profile/profile-contacts.component';
import { ProfileWithdrawalComponent } from './profile/profile-withdrawal.component';
import { ProfileAssetsComponent } from './profile/profile-assets.component';
import { ProfileLastExchangesComponent } from './profile/profile-last-exchanges.component';
import { ProfileContactEditorComponent } from './profile/profile-contact-editor.component';
import { TransactionsFilterBarComponent } from './filter-bars/transactions-bar.component';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { MatChipsModule } from '@angular/material/chips';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const materialModules = [
    ClipboardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTooltipModule,
    MatChipsModule,
    MatDatepickerModule, 
    MatNativeDateModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
];

@NgModule({
    imports: [...materialModules],
    exports: [...materialModules]
})
export class MaterialModule { }

@NgModule({
    imports: [NgxMaskModule.forRoot(), CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, DirectiveModule, QRCodeModule],
    declarations: [DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        CheckoutSummaryComponent, CheckoutDoneComponent, ExchangeRateComponent, 
        LoginPanelComponent, SignUpPanelComponent, SignupInfoPanelComponent, CommonDialogBox, SideExpanderComponent,
        CreditCardComponent, TwoFaCodeComponent, NavPopupComponent, SideMenuComponent, LineBreakPipe, NumberFillPipe,
        TransactionsFilterBarComponent,
        ProfileAccountBalanceComponent, ProfileExchangeComponent, ProfileNotificationsComponent,
        ProfileQuickTransferComponent, ProfileTransactionsComponent, ProfileInfoComponent, ProfileTwoFAComponent,
        ProfilePasswordComponent, ProfileVerificationComponent, ProfileContactsComponent, 
        ProfileContactEditorComponent, ProfileWithdrawalComponent,
        ProfileAssetsComponent, ProfileLastExchangesComponent],
    exports: [DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        CheckoutSummaryComponent, CheckoutDoneComponent, ExchangeRateComponent, 
        LoginPanelComponent, SignUpPanelComponent, SignupInfoPanelComponent, CommonDialogBox, SideExpanderComponent,
        CreditCardComponent, TwoFaCodeComponent, NavPopupComponent, SideMenuComponent, LineBreakPipe, NumberFillPipe,
        TransactionsFilterBarComponent,
        ProfileAccountBalanceComponent, ProfileExchangeComponent, ProfileNotificationsComponent,
        ProfileQuickTransferComponent, ProfileTransactionsComponent, ProfileInfoComponent, ProfileTwoFAComponent,
        ProfilePasswordComponent, ProfileVerificationComponent, ProfileContactsComponent,
        ProfileContactEditorComponent, ProfileWithdrawalComponent,
        ProfileAssetsComponent, ProfileLastExchangesComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ComponentsModule { }
