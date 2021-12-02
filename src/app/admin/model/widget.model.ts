import { DatePipe } from '@angular/common';
import { getCountryByCode2 } from 'src/app/model/country-code.model';
import { Widget } from '../../model/generated-models';

export class WidgetItem {
  id?: string;
  additionalSettings?: string;
  userId?: string;
  created?: string;
  transactionType?: string;
  transactionTypes?: Array<string>;
  currenciesFrom?: Array<string>;
  currenciesTo?: Array<string>;
  destinationAddress?: string;
  destinationAddresses?: Array<string>;
  countriesCode2?: Array<string>;
  countries: string[] = [];
  instruments?: Array<string>;
  paymentProviders?: Array<string>;
  liquidityProvider?: string;

  constructor(data: Widget | null) {
    if (data) {
      const datepipe: DatePipe = new DatePipe('en-US');
      this.id = data.widgetId as string;
      this.additionalSettings = data.additionalSettings as string;
      this.userId = data.userId as string;
      this.created = datepipe.transform(
        data.created,
        'dd-MM-YYYY HH:mm:ss'
      ) as string;
      this.transactionType = undefined;
      if (data.transactionTypes) {
        if (data.transactionTypes.length > 0) {
          this.transactionType = data.transactionTypes[0];
        }
      }
      this.countries = [];
      if (data.countriesCode2) {
        this.countries = data.countriesCode2.map(val => {
          const countryObject = getCountryByCode2(val);
          return (countryObject) ? countryObject.name : val;
        });
      }
      this.transactionTypes = data.transactionTypes ?? [];
      this.currenciesFrom = data.currenciesFrom ?? undefined;
      this.currenciesTo = data.currenciesTo ?? undefined;
      this.destinationAddress = data.destinationAddress as string;
      this.countriesCode2 = data.countriesCode2 ?? undefined;
      this.instruments = data.instruments ?? undefined;
      this.paymentProviders = data.paymentProviders ?? undefined;
      this.liquidityProvider = data.liquidityProvider as string;
    }
  }
}
