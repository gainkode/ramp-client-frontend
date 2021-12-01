import { Widget } from '../../model/generated-models';

export class WidgetItem {
  id?: string;
  userId?: string;
  created?: Date;
  transactionType?: string;
  currenciesFrom?: Array<string>;
  currenciesTo?: Array<string>;
  destinationAddress?: string;
  countriesCode2?: Array<string>;
  instruments?: Array<string>;
  paymentProviders?: Array<string>;
  liquidityProvider?: string;

  constructor(data?: Widget) {
    if (data) {
      this.id = data.widgetId as string;
      this.userId = data.userId as string;
      this.created = data.created as Date;
      this.transactionType = data.transactionType as string;
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
