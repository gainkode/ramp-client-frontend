import { CurrencyPairLiquidityProvider } from "./generated-models";
import { LiquidityProviderList, LiquidityProviderItem } from 'src/app/admin/model/lists.model';

export class CurrencyPairItem {
  currencyPairLiquidityProviderId = '';
  fromCurrency = '';
  toCurrency = '';
  liquidityProviderId = '';
  fixedRate = 0;
  liquidityProviderName: LiquidityProviderItem | undefined = undefined;
  deleted = false;

  constructor(data: CurrencyPairLiquidityProvider) {
    this.currencyPairLiquidityProviderId = data.currencyPairLiquidityProviderId ?? '';
    this.fromCurrency = data.fromCurrency ?? '';
    this.toCurrency = data.toCurrency ?? '';
    this.liquidityProviderId = data.liquidityProviderId ?? '';
    this.fixedRate = data.fixedRate ?? 0;

    if(data.liquidityProviderName){
      this.liquidityProviderName = LiquidityProviderList.find(item => item.id == data.liquidityProviderName);
    }
    
    if(data.deleted && data.deleted != ''){
      this.deleted = true;
    }
  }
}
