import {
	Component,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { InstitutionCountry, PaymentBank } from 'model/generated-models';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { PaymentDataService } from 'services/payment.service';
import { Countries } from 'model/country-code.model';

@Component({
	selector: 'app-payment-yapily-banks',
	templateUrl: 'bank.component.html',
	styleUrls: ['bank.component.scss'],
})
export class PaymentYapilyBankComponent implements OnInit, OnDestroy {
  @Output() selectBank = new EventEmitter<PaymentBank>();
  @Output() onBack = new EventEmitter();

  searchCountryControl = new FormControl();
  isYapilyBankLoading = false;
  paymentBanks$: Observable<PaymentBank[]>;
  bankCountries: InstitutionCountry[] = [];
  private pSubscriptions: Subscription = new Subscription();

  constructor(public paymentService: PaymentDataService) {}

  getCountryFlag(code: string): string {
  	return `${code.toLowerCase()}.svg`;
  }

  ngOnInit(): void {
  	this.getYapilyDetails();
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  selectBankItem(bank: PaymentBank): void {
  	this.selectBank.emit(bank);
  }

  getYapilyDetails(): void {
  	this.isYapilyBankLoading = true;
  	this.paymentService.getOpenBankgingDetails('Yapily')
  		.subscribe({
  			next: ({ getOpenBankingGetails }) => {
  				this.paymentBanks$ = this.searchCountryControl.valueChanges.pipe(
  					startWith(''),
  					map(value => this._filter(value, getOpenBankingGetails.yapily.banks))
  				);

  				this.bankCountries = getOpenBankingGetails.yapily.countries;
  			},
  			error: (errorRes) => {
  				console.log(errorRes)
  			},
  			complete: () => this.isYapilyBankLoading = false
  		});
  }

  private _filter(value: string, banks: PaymentBank[]): PaymentBank[] {
  	const filterValue = value.toLowerCase();

  	if (!filterValue) {
  		return banks;
  	}

  	return banks.filter(item => item.countries.some(country => country.countryCode2.toLowerCase() === filterValue));
  }
}
