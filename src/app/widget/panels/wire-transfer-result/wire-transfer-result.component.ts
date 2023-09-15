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
    	const bankDetails: BankDetailsObject = JSON.parse(val.data);
    	this.fields = {
    		'widget-wire-transfer-result.field_referenceId': this.referenceId ?? '',
    		'widget-wire-transfer-result.field_bankAccountHolderName': bankDetails.bankAccountHolderName ?? '',
    		'widget-wire-transfer-result.field_bankAccountNumber': bankDetails.bankAccountNumber ?? '',
    		'widget-wire-transfer-result.field_accountName': bankDetails.accountName ?? '',
    		'widget-wire-transfer-result.field_sortCode': bankDetails.sortCode ?? '',
    		'widget-wire-transfer-result.field_bankAddress': bankDetails.bankAddress ?? '',
    		'widget-wire-transfer-result.field_bankAccountName': bankDetails.bankAccountName ?? '',
    		'widget-wire-transfer-result.field_beneficiaryAddress': bankDetails.beneficiaryAddress ?? '',
    		'widget-wire-transfer-result.field_beneficiaryName': bankDetails.beneficiaryName ?? '',
    		'widget-wire-transfer-result.field_iban': bankDetails.iban ?? '',
    		'widget-wire-transfer-result.field_swift': bankDetails.swiftBic ?? '',
    		'widget-wire-transfer-result.field_routingNumber': bankDetails.routingNumber ?? '',
    		'widget-wire-transfer-result.field_creditTo': bankDetails.creditTo ?? '',
    		'widget-wire-transfer-result.field_reference': bankDetails.reference ?? ''
    	};
    }
}
