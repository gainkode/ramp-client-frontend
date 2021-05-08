import {
    PaymentInstrument, PaymentProvider, User, TransactionSource,
    TransactionStatus, TransactionType
} from './generated-models';
import {
    TransactionTypeList, PaymentInstrumentList, PaymentProviderList,
    TransactionSourceList, TransactionStatusList
} from './payment.model';
import { getCountryByCode2 } from './country-code.model';
import { CommonTargetValue } from './common.model';

export class UserItem {
    id: string = '';
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    country: CommonTargetValue | null = null;
    street: string = '';
    zip: string = '';

    constructor(data: User | null) {
        if (data !== null) {
            this.id = data.userId;
            this.firstName = data.firstName as string;
            this.lastName = data.lastName as string;
            this.email = data.email;
            this.zip = 'FL123456';
            this.street = 'Home Street';
            const countryObject = getCountryByCode2(data.countryCode2 as string);
            if (countryObject !== null) {
                this.country = new CommonTargetValue();
                this.country.imgClass = 'country-flag';
                this.country.imgSource = `assets/svg-country-flags/${countryObject.code2.toLowerCase()}.svg`;
                this.country.title = countryObject.name;
            }
        }
    }

    // get transactionTypeName(): string {
    //     return TransactionTypeList.find(t => t.id === this.type)?.name as string;
    // }

    // get transactionSourceName(): string {
    //     return TransactionSourceList.find(t => t.id === this.source)?.name as string;
    // }

    // get transactionStatusName(): string {
    //     return TransactionStatusList.find(t => t.id === this.status)?.name as string;
    // }

    // get instrumentName(): string {
    //     return PaymentInstrumentList.find(i => i.id === this.instrument)?.name as string;
    // }

    // get paymentProviderName(): string {
    //     return PaymentProviderList.find(p => p.id === this.paymentProvider)?.name as string;
    // }
}