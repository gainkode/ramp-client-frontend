import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentsModule } from '../components/components.module';
import { WidgetComponent } from './widget.component';
import { WidgetProgressComponent } from './panels/progress.component';
import { WidgetOrderDetailsComponent } from './panels/order-details.component';
import { WidgetSummaryComponent } from './panels/summary.component';
import { WidgetRateComponent } from './panels/rate.component';
import { WidgetRegisterComponent } from './panels/register.component';
import { WidgetLoginAuthComponent } from './panels/login-auth.component';
import { WidgetDisclaimerComponent } from './panels/disclaimer.component';
import { WidgetCompleteComponent } from './panels/complete.component';
import { WidgetPaymentComponent } from './panels/payment.component';
import { WidgetCreditCardComponent } from './panels/credit-card.component';
import { WidgetCodeAuthComponent } from './panels/code-auth.component';
import { WidgetKycComponent } from './panels/kyc.component';
import { WidgetProcessingFrameComponent } from './panels/processing-frame.component';
import { WidgetProcessingInstantpayComponent } from './panels/processing-instantpay.component';
import { WidgetInitializationComponent } from './panels/initialization.component';
import { BuySellWidgetComponent } from './buy-sell.component';
import { RouterModule } from '@angular/router';
import { ReceiveWidgetComponent } from './receive.component';
import { WidgetReceiveDetailsComponent } from './panels/receive-details.component';
import { QRCodeModule } from 'angularx-qrcode';
import { SendWidgetComponent } from './send.component';
import { WidgetSendDetailsComponent } from './panels/send-details.component';
import { TransferWidgetComponent } from './transfer.component';
import { PaymentIntroComponent } from './payment-intro.component';
import { WidgetWireTransferComponent } from './panels/wire-transfer.component';
import { WidgetWireTransferInfoRequiredComponent } from './panels/wire-transfer-info-required.component';
import { MatRadioModule } from '@angular/material/radio';
import { WidgetWireTransferResultComponent } from './panels/wire-transfer-result.component';
import { WidgetSellDetailsComponent } from './panels/sell-details.component';
import { BuySellFiatWidgetComponent } from './buy-sell-fiat.component';
import { WidgetDepositDetailsComponent } from './panels/deposit-details.component';
import { FiatWidgetComponent } from './fiat.component';
import { WidgetRecentTransactionsComponent } from './panels/recent-transactions.component';
import { WidgetErrorComponent } from './panels/error.component';
import { CryptoWidgetComponent } from './crypto.component';
import { WidgetCryptoDetailsComponent } from './panels/crypto-details.component';
import { WidgetCryptoCompleteComponent } from './panels/crypto-complete.component';
import { WidgetCryptoFinishComponent } from './panels/crypto-finish.component';
import { CryptoWizardComponent } from './crypto-wizard.component';
import { WidgetWizardComponent } from './widget-wizard.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const modules = [
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatTableModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressBarModule,
    MatStepperModule,
    MatCheckboxModule,
    ComponentsModule
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
        WidgetComponent, ReceiveWidgetComponent, SendWidgetComponent, TransferWidgetComponent, BuySellFiatWidgetComponent,
        BuySellWidgetComponent, FiatWidgetComponent, CryptoWidgetComponent, CryptoWizardComponent, WidgetWizardComponent,
        WidgetProgressComponent, WidgetRecentTransactionsComponent,
        WidgetSummaryComponent, WidgetRateComponent, WidgetCreditCardComponent, WidgetWireTransferComponent, WidgetWireTransferInfoRequiredComponent,
        WidgetWireTransferResultComponent, WidgetSellDetailsComponent, WidgetDepositDetailsComponent,
        WidgetRegisterComponent, WidgetLoginAuthComponent, WidgetCodeAuthComponent,
        WidgetInitializationComponent, WidgetOrderDetailsComponent, WidgetReceiveDetailsComponent, WidgetSendDetailsComponent,
        WidgetDisclaimerComponent, WidgetKycComponent, WidgetPaymentComponent, WidgetProcessingFrameComponent, WidgetCryptoDetailsComponent,
        WidgetCryptoCompleteComponent, WidgetCryptoFinishComponent, WidgetProcessingInstantpayComponent, WidgetCompleteComponent, WidgetErrorComponent,
        PaymentIntroComponent],
    exports: [
        WidgetComponent,
        BuySellFiatWidgetComponent,
        BuySellWidgetComponent,
        ReceiveWidgetComponent,
        SendWidgetComponent,
        TransferWidgetComponent,
        PaymentIntroComponent,
        CryptoWidgetComponent,
        CryptoWizardComponent,
        WidgetWizardComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WidgetModule { }
