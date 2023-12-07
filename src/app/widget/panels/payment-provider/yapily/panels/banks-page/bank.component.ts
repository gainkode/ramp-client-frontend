import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
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
import { EnvService } from 'services/env.service';
import { PaymentDataService } from 'services/payment.service';

export interface YapilyRedirectModel {
	yapilyQrCodeUrl: string;
	yapilyAuthUrl: string;
	bankName: string;
	transactionId: string;
}

@Component({
	selector: 'app-payment-yapily-banks',
	templateUrl: 'bank.component.html',
	styleUrls: ['bank.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentYapilyBankComponent implements OnInit, OnDestroy {
  @Input() yapilyRedirectObject: YapilyRedirectModel;
  @Output() selectBank = new EventEmitter<PaymentBank>();
  @Output() onBack = new EventEmitter();
  @Output() isLoading = new EventEmitter<boolean>();
  @Output() openWindow = new EventEmitter<string>();
  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;
  searchCountryControl = new FormControl();
  isYapilyBankLoading = false;
  paymentBanks$: Observable<PaymentBank[]>;
  bankCountries: InstitutionCountry[] = [];
  private pSubscriptions: Subscription = new Subscription();

  constructor(public paymentService: PaymentDataService, private cdr: ChangeDetectorRef) {}

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
  	this.paymentService.getOpenBankgingDetails('Yapily').subscribe({
  		next: ({ getOpenBankingGetails }) => {
  			this.paymentBanks$ = this.searchCountryControl.valueChanges.pipe(
  				startWith(''),
  				map((value) =>
  					this._filter(value, getOpenBankingGetails.yapily.banks)
  				)
  			);

  			this.bankCountries = getOpenBankingGetails.yapily.countries;
  		},
  		error: (errorRes) => {
  			console.log(errorRes);
  		},
  		complete: () => {
			this.isYapilyBankLoading = false;
			this.cdr.markForCheck();
		},
  	});
  }

  onYapilyNavigate(url: string): void {
  	this.openWindow.emit(url);
  	this.isLoading.emit(true);
  }

  private _filter(value: string, banks: PaymentBank[]): PaymentBank[] {
  	const filterValue = value.toLowerCase();

  	if (!filterValue) {
  		return banks;
  	}

  	return banks.filter((item) =>
  		item.countries.some(
  			(country) => country.countryCode2.toLowerCase() === filterValue
  		)
  	);
  }
}
