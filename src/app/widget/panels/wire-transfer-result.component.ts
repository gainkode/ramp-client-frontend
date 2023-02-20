import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountFlashfxObject, WireTransferBankAccountMonoovaObject, WireTransferBankAccountOpenpaydObject, WireTransferBankAccountUk } from 'src/app/model/cost-scheme.model';
import { WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from 'src/app/model/payment-base.model';

@Component({
    selector: 'app-widget-wire-transfer-result',
    templateUrl: 'wire-transfer-result.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetWireTransferResultComponent {
    @Input() referenceId = '';
    @Input() set bankData(val: WireTransferPaymentCategoryItem) {
        this.loadData(val);
    }
    @Output() onComplete = new EventEmitter();
    @Output() onSendEmail = new EventEmitter();

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

    constructor(private clipboard: Clipboard) { }

    sendEmail(): void {
        this.onSendEmail.emit();
    }

    copyParameter(index: number): void {
        let dataString = '';
        switch (index) {
            case 0:
                dataString = this.referenceId;
                break;
            case 1:
                dataString = this.field1Value;
                break;
            case 2:
                dataString = this.field2Value;
                break;
            case 3:
                dataString = this.field3Value;
                break;
            case 4:
                dataString = this.field4Value;
                break;
            case 5:
                dataString = this.field5Value;
                break;
            case 6:
                dataString = this.field6Value;
                break;
        }
        this.clipboard.copy(dataString);
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
        } else if(val.id == WireTransferPaymentCategory.OPENPAYD){
            const dataOpenpayd = data as WireTransferBankAccountOpenpaydObject;
            if(dataOpenpayd.currency == 'GBP'){
                this.field1Title = 'Account Holder';
                this.field2Title = 'Account Number';
                this.field3Title = 'Sort Code';
                this.field1Value = dataOpenpayd.bankAccountHolderName;
                this.field2Value = dataOpenpayd.accountNumber;
                this.field3Value = dataOpenpayd.sortCode;
            }else if(dataOpenpayd.currency == 'EUR'){
                this.field1Title = 'Bank Address';
                this.field2Title = 'Bank Name';
                this.field3Title = 'Beneficiary Address';
                this.field4Title = 'Beneficiary Name';
                this.field5Title = 'IBAN';
                this.field6Title = 'SWIFT / BIC';
                this.field1Value = dataOpenpayd.bankAddress;
                this.field2Value = dataOpenpayd.bankName;
                this.field3Value = dataOpenpayd.beneficiaryAddress;
                this.field4Value = dataOpenpayd.beneficiaryName;
                this.field5Value = dataOpenpayd.iban;
                this.field6Value = dataOpenpayd.swiftBic;
            }
            
        } else if(val.id == WireTransferPaymentCategory.FLASHFX){
            const dataFlashfx = data as WireTransferBankAccountFlashfxObject;
            
            this.field1Title = 'BSB';
            this.field2Title = 'Account Number';
            this.field3Title = 'Account Name';
            // this.field4Title = 'Beneficiary Address';
            // this.field5Title = 'Currency';
            this.field1Value = dataFlashfx.bsb;
            this.field2Value = dataFlashfx.accountNumber;
            this.field3Value = dataFlashfx.beneficiaryName;
            // this.field4Value = dataFlashfx.beneficiaryAddress;
            // this.field5Value = dataFlashfx.currency;
            
        } else if(val.id == WireTransferPaymentCategory.MONOOVA){
            const dataMonoova = data as WireTransferBankAccountMonoovaObject;
            
            this.field1Title = 'BSB';
            this.field2Title = 'Account Number';
            this.field3Title = 'Account Name';
            // this.field4Title = 'Beneficiary Address';
            // this.field5Title = 'Currency';
            this.field1Value = dataMonoova.bsb;
            this.field2Value = dataMonoova.bankAccountNumber;
            this.field3Value = dataMonoova.bankAccountName;
            // this.field4Value = dataFlashfx.beneficiaryAddress;
            // this.field5Value = dataFlashfx.currency;
            
        }

        
    }
}
