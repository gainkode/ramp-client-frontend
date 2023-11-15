import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentBank } from 'model/generated-models';
import { Subscription } from 'rxjs';
import { PaymentDataService } from 'services/payment.service';


@Component({
	selector: 'app-payment-yapily-banks',
	templateUrl: 'bank.component.html',
	styleUrls: []
})
export class PaymentYapilyBankComponent implements OnInit, OnDestroy {
  @Input() errorMessage = '';
  @Output() selectBank = new EventEmitter<PaymentBank>();
	@Output() onBack = new EventEmitter();
  
  private pSubscriptions: Subscription = new Subscription();
  banks: PaymentBank[] = [];
  constructor(
		public paymentService: PaymentDataService,
	) { }
  
	get providerName(): string {
  	return 'Yapily';
	}
  
	ngOnInit(): void {
  	this.getBankAccounts();
	}

	ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
	}

	selectBankItem(id: string) {
		const bank = this.banks.find(item => item.id === id);
		this.selectBank.emit(bank);
	}

	getBankAccounts() {
  	this.banks = [
  		{
  			"icon": "https://images.yapily.com/image/ce2bfdbf-1ae2-4919-ab7b-e8b3d5e93b36?size=0",
  			"name": "Modelo Sandbox",
  			"id": "modelo-sandbox",
  			"__typename": "PaymentBank"
  		}
  	];
  	// this.paymentService.myBanks(this.providerName).subscribe(({ data }) => {
  	//   this.banks = data.myBanks;
  	// }, (error) => {
  	// 	console.log(error);
  	// });
	}
}
