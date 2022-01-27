import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountUk } from 'src/app/model/cost-scheme.model';
import { WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from 'src/app/model/payment-base.model';

@Component({
    selector: 'app-widget-wire-transfer-result',
    templateUrl: 'wire-transfer-result.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetWireTransferResultComponent {
    @Input() set bankData(val: WireTransferPaymentCategoryItem) {
        this.loadData(val);
    }
    @Output() onComplete = new EventEmitter();

    field1Title = '';
    field2Title = '';
    field3Title = '';
    field1Value = '';
    field2Value = '';
    field3Value = '';

    sendEmail(): void {

    }

    private loadData(val: WireTransferPaymentCategoryItem) {
        const data = JSON.parse(val.data);
        if (val.id === WireTransferPaymentCategory.AU) {
            const dataAu = data as WireTransferBankAccountAu;
            this.field1Title = 'Account name';
            this.field2Title = 'Account number';
            this.field3Title = 'BSB';
            this.field1Value = dataAu.accountName;
            this.field2Value = dataAu.accountNumber;
            this.field3Value = dataAu.bsb;
        } else if (val.id === WireTransferPaymentCategory.UK) {
            const dataUk = data as WireTransferBankAccountUk;
            this.field1Title = 'Account name';
            this.field2Title = 'Account number';
            this.field3Title = 'Sort code';
            this.field1Value = dataUk.accountName;
            this.field2Value = dataUk.accountNumber;
            this.field3Value = dataUk.sortCode;
        } else if (val.id === WireTransferPaymentCategory.EU) {
            const dataEu = data as WireTransferBankAccountEu;
            this.field1Title = 'Account owner name';
            this.field2Title = 'SWIFT';
            this.field3Title = 'IBAN';
            this.field1Value = dataEu.accountOwnerName;
            this.field2Value = dataEu.swift;
            this.field3Value = dataEu.iban;
        }
    }
}
