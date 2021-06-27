import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DropdownItemComponent } from './dropdown-item.component';
import { BackButtonComponent } from './backbutton.component';
import { TabLabelComponent } from './tablabel.component';
import { KycPanelComponent } from './kyc-panel.component';
import { LineBreakPipe } from '../utils/line-break.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar'; 
import { CommonDialogBox } from './common-box.dialog';
import { CheckoutSummaryComponent } from './checkout-summary.component';
import { ExchangeRateComponent } from './exchange-rate.component';
import { LoginPanelComponent } from './login-panel.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CheckoutDoneComponent } from './checkout-done.component';
import { CreditCardComponent } from './credit-card.component';
import { MatSelectModule } from '@angular/material/select';
import { NumberFillPipe } from '../utils/number-fill.pipe';
import { DirectiveModule } from '../directives/directives.module';
import { ProfileAccountBalanceComponent } from './profile/profile-account-balance.component';
import { ProfileExchangeComponent } from './profile/profile-exchange.component';
import { ProfileNotificationsComponent } from './profile/profile-notifications.component';
import { ProfileQuickTransferComponent } from './profile/profile-quick-transfer.component';
import { ProfileTransactionsComponent } from './profile/profile-transactions.component';
import { ProfileInfoComponent } from './profile/profile-info.component';
import { ProfileTwoFAComponent } from './profile/profile-two-FA.component';
import { ProfilePasswordComponent } from './profile/profile-password.component';
import { ProfileVerificationComponent } from './profile/profile-verification.component';
import { ProfileContactsComponent } from './profile/profile-contacts.component';
import { ProfileWithdrawalComponent } from './profile/profile-withdrawal.component';
import { ProfileAssetsComponent } from './profile/profile-assets.component';
import { ProfileLastExchangesComponent } from './profile/profile-last-exchanges.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { ClipboardModule } from '@angular/cdk/clipboard'; 
import { NotificationIconComponent } from './notification-bar/notification.component';
import { TwoFaCodeComponent } from './two-fa-code.component';
import { QRCodeModule } from 'angularx-qrcode';

const materialModules = [
    ClipboardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatIconModule,
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
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, DirectiveModule, QRCodeModule],
    declarations: [DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        CheckoutSummaryComponent, CheckoutDoneComponent, ExchangeRateComponent, NotificationIconComponent,
        LoginPanelComponent, CommonDialogBox, CreditCardComponent, TwoFaCodeComponent,
        LineBreakPipe, NumberFillPipe, ProfileAccountBalanceComponent, ProfileExchangeComponent,
        ProfileNotificationsComponent, ProfileQuickTransferComponent, ProfileTransactionsComponent,
        ProfileInfoComponent, ProfileTwoFAComponent, ProfilePasswordComponent, 
        ProfileVerificationComponent, ProfileContactsComponent, ProfileWithdrawalComponent,
        ProfileAssetsComponent, ProfileLastExchangesComponent],
    exports: [DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        CheckoutSummaryComponent, CheckoutDoneComponent, ExchangeRateComponent, NotificationIconComponent,
        LoginPanelComponent, MatProgressBarModule, CommonDialogBox, CreditCardComponent, TwoFaCodeComponent,
        LineBreakPipe, NumberFillPipe, ProfileAccountBalanceComponent, ProfileExchangeComponent,
        ProfileNotificationsComponent, ProfileQuickTransferComponent, ProfileTransactionsComponent,
        ProfileInfoComponent, ProfileTwoFAComponent, ProfilePasswordComponent, 
        ProfileVerificationComponent, ProfileContactsComponent, ProfileWithdrawalComponent,
        ProfileAssetsComponent, ProfileLastExchangesComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ComponentsModule { }
