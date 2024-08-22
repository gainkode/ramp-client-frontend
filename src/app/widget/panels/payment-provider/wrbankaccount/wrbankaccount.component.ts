import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountUk } from 'model/cost-scheme.model';
import { WireTransferBankAccount, WireTransferPaymentCategory } from 'model/generated-models';
import { WireTransferPaymentCategoryItem } from 'model/payment-base.model';
import { WidgetPaymentPagerService } from 'services/widget-payment-pager.service';

@Component({
  selector: 'app-widget-payment-wrbankaccount',
  templateUrl: './wrbankaccount.component.html',
  styleUrl: './wrbankaccount.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPaymentWrBankAccountComponent implements OnInit {
  @Input() bankAccount: WireTransferBankAccount | undefined = undefined;
  @Output() onBack = new EventEmitter();
  @Output() selectProviderBankAccount = new EventEmitter<WireTransferPaymentCategory>();

  bankCategories: WireTransferPaymentCategoryItem[] = [];
  selectedBank: WireTransferPaymentCategory | undefined = undefined;

  constructor(
  	public pager: WidgetPaymentPagerService
  ) {
  }
  
  ngOnInit(): void {
    const accounts = [
      { key: 'au', value: this.bankAccount?.au, title: 'Australian bank' },
      { key: 'uk', value: this.bankAccount?.uk, title: 'United Kingdom bank' },
      { key: 'eu', value: this.bankAccount?.eu, title: 'European bank' }
    ];

    // Filter out null values and check if only one account is non-null
    const accountsFiltered = [...accounts.filter(account => account.value)];
    
    this.bankCategories = accountsFiltered.map(item => {
      let data: WireTransferBankAccountAu | WireTransferBankAccountEu | WireTransferBankAccountUk;
      
      switch (item.key) {
        case WireTransferPaymentCategory.Au: 
          data = new WireTransferBankAccountAu();
          break;
        case WireTransferPaymentCategory.Eu:
          data = new WireTransferBankAccountEu();
          break;
        case WireTransferPaymentCategory.Uk:
          data = new WireTransferBankAccountUk();
          break;
      }

      return <WireTransferPaymentCategoryItem>{
        id: item.key,
        title: item.title,
        data: data
      };
    });
  }

  onSubmit(): void {
    this.selectProviderBankAccount.emit(this.selectedBank);
  }

  stageBack(): void {
  	const stage = this.pager.goBack();

  	if (!stage) {
  		this.onBack.emit();
  	}
  }
}
