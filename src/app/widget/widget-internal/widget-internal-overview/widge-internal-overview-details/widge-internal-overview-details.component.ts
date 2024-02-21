import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CheckoutSummary, CurrencyView } from 'model/payment.model';

@Component({
  selector: 'app-widge-internal-overview-details',
  templateUrl: './widge-internal-overview-details.component.html',
  styleUrls: ['./widge-internal-overview-details.component.scss'],
})
export class WidgeInternalOverviewDetailsComponent {
  @Input() summary: CheckoutSummary | undefined;
  @Input() spendList: CurrencyView[] | undefined = [];
  @Input() receiveList: CurrencyView[] | undefined = [];
  @Input() mobileSummary: boolean;
  @Input() amountSpendField: AbstractControl | null;
  @Input() currencySpend = '';
  @Input() currencyReceive = '';
  
  get spendComboValue(): CurrencyView | undefined {
    return this.spendList?.find((x) => x.symbol === this.currencySpend);
}

  get receiveComboValue(): CurrencyView | undefined {
      return this.receiveList?.find((x) => x.symbol === this.currencyReceive);
  }
}