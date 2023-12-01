import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';
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
import { WidgetOrderDetailsComponent } from './panels/order-details/order-details.component';
import { RouterModule } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { MatRadioModule } from '@angular/material/radio';

import {
	WidgetProgressComponent,
	WidgetRecentTransactionsComponent,
	WidgetSummaryComponent,
	WidgetRateComponent,
	WidgetCreditCardComponent,
	WidgetWireTransferComponent,
	WidgetWireTransferInfoRequiredComponent,
	WidgetWireTransferResultComponent,
	WidgetSellDetailsComponent,
	WidgetDepositDetailsComponent,
	CompanyLevelVerificationComponent,
	WidgetRegisterComponent,
	WidgetLoginAuthComponent,
	WidgetCodeAuthComponent,
	WidgetInitializationComponent,
	WidgetReceiveDetailsComponent,
	WidgetSellCompleteComponent,
	WidgetSendDetailsComponent,
	WidgetDisclaimerComponent,
	WidgetKycComponent,
	WidgetPaymentComponent,
	WidgetPaymentYapilyComponent,
	PaymentYapilyBankComponent,
	WidgetProcessingFrameComponent,
	WidgetCryptoDetailsComponent,
	WidgetCryptoCompleteComponent,
	WidgetCryptoFinishComponent,
	WidgetProcessingInstantpayComponent,
	WidgetCompleteComponent,
	WidgetErrorComponent,
	WidgetIframeComponent,
} from './panels';

import { 
	WidgetWizardComponent,
	SendWidgetComponent,
	TransferWidgetComponent, 
	ReceiveWidgetComponent,
	BuySellFiatWidgetComponent,
	BuySellWidgetComponent,
	CryptoWidgetComponent,
	CryptoWizardComponent,
	FiatWidgetComponent,
	PaymentIntroComponent
} from 'widget';
import { WidgetEmbeddedOverviewComponent } from './widget-internal/widget-internal-overview/widget-internal-overview.component';
import { WidgetEmbeddedComponent } from './widget-internal/widget-internal.component';
import { SpinnerModule } from 'shared/spinner/spinner.module';
import { TranslocoRootModule } from 'transloco-root.module';
import { WidgetPagerService } from 'services/widget-pager.service';

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
	ComponentsModule,
];

@NgModule({
	imports: [...modules],
	exports: [...modules],
})
export class MaterialModule {}

@NgModule({
	imports: [
		NgxMaskModule.forRoot(),
		CommonModule,
		ClipboardModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		MaterialModule,
		QRCodeModule,
		SpinnerModule,
		TranslocoRootModule
	],
	declarations: [
		WidgetIframeComponent,
		WidgetComponent,
		ReceiveWidgetComponent,
		SendWidgetComponent,
		TransferWidgetComponent,
		BuySellFiatWidgetComponent,
		BuySellWidgetComponent,
		FiatWidgetComponent,
		CryptoWidgetComponent,
		CryptoWizardComponent,
		WidgetWizardComponent,
		WidgetProgressComponent,
		WidgetRecentTransactionsComponent,
		WidgetSummaryComponent,
		WidgetRateComponent,
		WidgetCreditCardComponent,
		WidgetWireTransferComponent,
		WidgetWireTransferInfoRequiredComponent,
		WidgetWireTransferResultComponent,
		WidgetSellDetailsComponent,
		WidgetDepositDetailsComponent,
		CompanyLevelVerificationComponent,
		WidgetRegisterComponent,
		WidgetLoginAuthComponent,
		WidgetCodeAuthComponent,
		WidgetInitializationComponent,
		WidgetOrderDetailsComponent,
		WidgetReceiveDetailsComponent,
		WidgetSellCompleteComponent,
		WidgetSendDetailsComponent,
		WidgetDisclaimerComponent,
		WidgetKycComponent,
		WidgetPaymentComponent,
		WidgetPaymentYapilyComponent,
		PaymentYapilyBankComponent,
		WidgetProcessingFrameComponent,
		WidgetCryptoDetailsComponent,
		WidgetCryptoCompleteComponent,
		WidgetCryptoFinishComponent,
		WidgetProcessingInstantpayComponent,
		WidgetCompleteComponent,
		WidgetErrorComponent,
		PaymentIntroComponent,
		
		WidgetEmbeddedOverviewComponent,
		WidgetEmbeddedComponent
	],
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
		WidgetWizardComponent,
		CompanyLevelVerificationComponent,

		WidgetEmbeddedOverviewComponent,
		WidgetEmbeddedComponent
	],
	providers: [
		WidgetPagerService
	],
})
export class WidgetModule {}
