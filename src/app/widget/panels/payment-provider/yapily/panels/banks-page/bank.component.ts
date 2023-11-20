import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  

	searchCountryControl = new FormControl();
	bankCountries = [
	  { id: 'gb', name: 'United Kingdom' },
	  { id: 'de', name: 'Germany' },
	  { id: 'fr', name: 'France' }
	];
	

	private pSubscriptions: Subscription = new Subscription();
	banks: PaymentBank[] = [];
	constructor(
		public paymentService: PaymentDataService,
	) { }

	  //   this.bankCountries = this.searchCountryControl.valueChanges.pipe(
  // 		startWith(''),
  // 		map(value => this._filter(value))
	//   );

  //   this.filteredItems = this.searchCurrencyControl.valueChanges.pipe(
  // 		startWith(''),
  // 		map(value => this._filter(value))
	//   );
  // }

  // private _filter(value: string): any {
  // 	const filterValue = value.toLowerCase();
  // 	return this.comboList.filter(item => item.display.toLowerCase().includes(filterValue));
  // }
  
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
  	// this.banks = [
  	// 	{
  	// 		"icon": "https://images.yapily.com/image/ce2bfdbf-1ae2-4919-ab7b-e8b3d5e93b36?size=0",
  	// 		"name": "Modelo Sandbox",
  	// 		"id": "modelo-sandbox",
  	// 		"__typename": "PaymentBank"
  	// 	}
  	// ];
  	this.paymentService.myBanks(this.providerName).subscribe(( { myBanks } ) => {
  	  this.banks = myBanks;
  	}, (error) => {
  		console.log(error);
  	});
	}
}
