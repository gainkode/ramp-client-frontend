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
    field4Title = '';
    field5Title = '';
    field6Title = '';
    field1Value = '';
    field2Value = '';
    field3Value = '';
    field4Value = '';
    field5Value = '';
    field6Value = '';

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
            this.field1Title = 'Bank Address';
            this.field2Title = 'Bank Name';
            this.field3Title = 'Beneficiary Address';
            this.field4Title = 'Beneficiary Name';
            this.field5Title = 'IBAN';
            this.field6Title = 'SWIFT / BIC';
            this.field1Value = dataEu.bankAddress;
            this.field2Value = dataEu.bankName;
            this.field3Value = dataEu.beneficiaryAddress;
            this.field4Value = dataEu.beneficiaryName;
            this.field5Value = dataEu.iban;
            this.field6Value = dataEu.swiftBic;
        }
    }
}
