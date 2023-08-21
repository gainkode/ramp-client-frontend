import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountUk } from 'model/cost-scheme.model';
import { BankDetailsObject } from 'model/generated-models';
import { WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from 'model/payment-base.model';

@Component({
	selector: 'app-widget-wire-transfer-result',
	templateUrl: 'wire-transfer-result.component.html',
	styleUrls: ['../../../../assets/text-control.scss']
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
    	const data = JSON.parse(val.data);
			const bankDetails = data as BankDetailsObject;
			
			this.fields['Reference ID'] = this.referenceId ?? '';
			this.fields['Account Holder'] = bankDetails.bankAccountHolderName ?? '';
			this.fields['Account Number'] = bankDetails.bankAccountNumber ?? '';
			this.fields['Account Name'] = bankDetails.accountName ?? '';
			this.fields['Sort Code'] = bankDetails.sortCode ?? '';
			this.fields['Bank Address'] = bankDetails.bankAddress ?? '';
			this.fields['Bank Name'] = bankDetails.bankAccountName ?? '';
			this.fields['Beneficiary Address'] = bankDetails.beneficiaryAddress ?? '';
			this.fields['Beneficiary Name'] = bankDetails.beneficiaryName ?? '';
			this.fields['IBAN'] = bankDetails.iban ?? '';
			this.fields['SWIFT / BIC'] = bankDetails.swiftBic ?? '';
			this.fields['Routing Number'] = bankDetails.routingNumber ?? '';
			this.fields['Credit To'] = bankDetails.creditTo ?? '';
			this.fields['Reference'] = bankDetails.reference ?? '';
    }
}
