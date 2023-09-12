import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BankDetailsObject } from 'model/generated-models';
import { WireTransferPaymentCategoryItem } from 'model/payment-base.model';

@Component({
	selector: 'app-widget-wire-transfer-result',
	templateUrl: 'wire-transfer-result.component.html',
	styleUrls: ['../../../../assets/text-control.scss', './wire-transfer-result.component.scss']
})
export class WidgetWireTransferResultComponent {
    @Input() referenceId = '';
    @Input() set bankData(val: WireTransferPaymentCategoryItem) {
    	this.loadData(val);
    }
    @Output() onComplete = new EventEmitter();
    @Output() onSendEmail = new EventEmitter();

		fields: Record<string, any> = {};
		Object = Object;

    constructor(private clipboard: Clipboard) { }

    sendEmail(): void {
    	this.onSendEmail.emit();
    }

    copyParameter(key: string): void {
    	this.clipboard.copy(this.fields[key]);
    }
    
    private loadData(val: WireTransferPaymentCategoryItem): void {
    	const bankDetails: BankDetailsObject = typeof val.data == 'string' ? JSON.parse(val.data) : val.data;
			this.fields = {
				'Reference ID': this.referenceId ?? '',
				'Account Holder': bankDetails.bankAccountHolderName ?? '',
				'Account Number': bankDetails.bankAccountNumber ?? '',
				'Account Name': bankDetails.accountName ?? '',
				'Sort Code': bankDetails.sortCode ?? '',
				'Bank Address': bankDetails.bankAddress ?? '',
				'Bank Name': bankDetails.bankAccountName ?? '',
				'Beneficiary Address': bankDetails.beneficiaryAddress ?? '',
				'Beneficiary Name': bankDetails.beneficiaryName ?? '',
				'IBAN': bankDetails.iban ?? '',
				'SWIFT / BIC': bankDetails.swiftBic ?? '',
				'Routing Number': bankDetails.routingNumber ?? '',
				'Credit To': bankDetails.creditTo ?? '',
				'Reference': bankDetails.reference ?? ''
			}
    }
}
