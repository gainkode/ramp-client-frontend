import { LiquidityProviderEntity } from "./generated-models";
import { LiquidityProviderList, LiquidityProviderItem } from 'admin/model/lists.model';

export class LiquidityProviderEntityItem {
  liquidityProviderId: string = '';
  name: LiquidityProviderItem | undefined= undefined;
  order: number = 0;

  constructor(data: LiquidityProviderEntity) {
    this.liquidityProviderId = data.liquidityProviderId ?? '';
    this.order = data.order ?? 0;

    if(data.name){
      this.name = LiquidityProviderList.find(item => item.id == data.name);
    }
  }
}
