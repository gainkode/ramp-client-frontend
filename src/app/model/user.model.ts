import { User } from './generated-models';
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
}