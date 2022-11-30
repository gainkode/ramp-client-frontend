import { DatePipe } from '@angular/common';
import { getCountryByCode2 } from 'src/app/model/country-code.model';
import { TransactionTypeList } from 'src/app/model/payment.model';
import { EnvService } from 'src/app/services/env.service';
import { Widget } from '../../model/generated-models';

export class WidgetItem {
  id = '';
  code?: string;
  name?: string;
  description?: string;
  additionalSettings?: string;
  userId?: string;
  created?: string;
  createdByEmail?: string;
  createdByName?: string;
  transactionType?: string;
  transactionTypes?: Array<string>;
  transactions: string[] = [];
  currenciesCrypto: Array<string> = [];
  currenciesFiat: Array<string> = [];
  destinationAddress = '';
  destinationAddresses: Array<string> = [];
  countriesCode2: Array<string> = [];
  countries: Array<string> = [];
  instruments: Array<string> = [];
  paymentProviders: Array<string> = [];
  liquidityProvider?: string;
  link = '';
  maskLink = '';
  secret = '';
  selected = false;
  allowToPayIfKycFailed: boolean = false;

  constructor(data: Widget | null) {
    if (data) {
      const datepipe: DatePipe = new DatePipe('en-US');
      this.id = data.widgetId ?? '';
      this.code = data.code ?? '';
      this.link = `${EnvService.client_host}/payment/quickcheckout/${this.id}`;
      this.maskLink = `${EnvService.client_host}/payment/widget/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`;
      this.name = data.name;
      this.description = data.description ?? '';
      this.secret = data.secret ?? '';
      this.allowToPayIfKycFailed = data.allowToPayIfKycFailed ?? false;
      this.additionalSettings = data.additionalSettings as string;
      this.userId = data.userId as string;
      this.created = datepipe.transform(data.created, 'dd-MM-YYYY HH:mm:ss') ?? '';
      if (data.createdByUser) {
        this.createdByEmail = data.createdByUser.email;
        const fn = data.createdByUser.firstName ?? '';
        const ln = data.createdByUser.lastName ?? '';
        const spc = (fn !== '' && ln !== '') ? ' ' : '';
        this.createdByName = `${fn}${spc}${ln}`;
      }
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
      this.transactions = data.transactionTypes?.map(val => {
        const t = TransactionTypeList.find(x => x.id === val);
        return (t) ? t.name : val;
      }) ?? [];
      this.currenciesCrypto = data.currenciesCrypto ?? [];
      this.currenciesFiat = data.currenciesFiat ?? [];
      this.destinationAddress = data.destinationAddress as string;
      this.countriesCode2 = data.countriesCode2 ?? [];
      this.instruments = data.instruments ?? [];
      this.paymentProviders = data.paymentProviders ?? [];
      this.liquidityProvider = data.liquidityProvider as string;
    }
  }
}
