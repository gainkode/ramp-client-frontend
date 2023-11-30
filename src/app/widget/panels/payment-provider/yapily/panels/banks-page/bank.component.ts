import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { InstitutionCountry, PaymentBank } from 'model/generated-models';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { PaymentDataService } from 'services/payment.service';
import { PaymentYapiliApi } from '../../services/yapily.api';
import { EnvService } from 'services/env.service';

export interface YapilyRedirectModel {
	yapilyQrCodeUrl: string;
	yapilyAuthUrl: string;
}

@Component({
	selector: 'app-payment-yapily-banks',
	templateUrl: 'bank.component.html',
	styleUrls: ['bank.component.scss'],
})
export class PaymentYapilyBankComponent implements OnInit, OnDestroy {
  @Input() yapilyRedirectObject: YapilyRedirectModel;
  @Output() selectBank = new EventEmitter<PaymentBank>();
  @Output() onBack = new EventEmitter();
	@Output() isLoading = new EventEmitter();
  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;
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

  onYapilyNavigate(url: string): void{
		window.open(url, '_blank');
		this.isLoading.emit(true);
  }

  private _filter(value: string, banks: PaymentBank[]): PaymentBank[] {
  	const filterValue = value.toLowerCase();

  	if (!filterValue) {
  		return banks;
  	}

  	return banks.filter(item => item.countries.some(country => country.countryCode2.toLowerCase() === filterValue));
  }
}


@Component({
	selector: 'app-payment-yapily-redirect-page',
	template: `
	<ng-container>
  		<app-spinner></app-spinner>
	</ng-container>
	`,
	providers: [PaymentYapiliApi]
})
export class PaymentYapilyRedirectPageComponent implements OnInit {

	constructor(public yapilyApi: PaymentYapiliApi) {}
 
	ngOnInit(): void {
		this.yapilyApi.yapilyPaymentCallback().subscribe();
	}
}