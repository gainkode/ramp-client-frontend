import { User, UserType } from './generated-models';
import { UserModeShortList, UserModeView, UserTypeList, UserTypeView } from './payment.model';
import { getCountryByCode2 } from './country-code.model';
import { CommonTargetValue } from './common.model';
import { DatePipe } from '@angular/common';

export class UserItem {
    id = '';
    name = '';
    company = '';
    firstName = '';
    lastName = '';
    email = '';
    phone = '';
    country: CommonTargetValue | null = null;
    street = '';
    zip = '';
    kycStatus = '';
    userType: UserTypeView | null = null;
    userMode: UserModeView | null = null;
    created = '';
    currency = '';

    constructor(data: User | null) {
        if (data !== null) {
            this.id = data.userId;
            this.name = data.name;
            this.firstName = data.firstName as string;
            this.lastName = data.lastName as string;
            if (data.type === UserType.Merchant) {
                this.company = (data.firstName) ? data.firstName as string : '';    
                this.firstName = '';
                this.lastName = '';
            }
            this.email = data.email;
            this.phone = (data.phone) ? data.phone as string : '';
            const datepipe: DatePipe = new DatePipe('en-US');
            this.created = datepipe.transform(data.created, 'dd-MM-YYYY HH:mm:ss') as string;
            this.kycStatus = data.kycStatus as string;
            const countryObject = getCountryByCode2(data.countryCode2 as string);
            if (countryObject !== null) {
                this.country = new CommonTargetValue();
                this.country.imgClass = 'country-flag';
                this.country.imgSource = `assets/svg-country-flags/${countryObject.code2.toLowerCase()}.svg`;
                this.country.title = countryObject.name;
            }
            this.currency = (data.defaultCurrency) ? data.defaultCurrency as string : '';
            this.userType = UserTypeList.find(x => x.id === data.type) as UserTypeView;
            this.userMode = UserModeShortList.find(x => x.id === data.mode) as UserModeView;
        }
    }
}
