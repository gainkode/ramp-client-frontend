import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LiquidityProviderItem, LiquidityProviderList } from 'admin/model/lists.model';
import { CurrencyPairItem } from 'model/currencyPairs.model';
import { SettingsCurrencyWithDefaults } from 'model/generated-models';
import { LiquidityProviderEntityItem } from 'model/liquidity-provider.model';
import { CurrencyView } from 'model/payment.model';
import { UserItem } from 'model/user.model';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { NUMBER_PATTERN } from 'utils/constants';

@Component({
	selector: 'app-admin-currencypairs-details',
	templateUrl: 'currencyPair-details.component.html',
	styleUrls: ['currencyPair-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminCurrencyPairDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input() pair: CurrencyPairItem | undefined = undefined;

  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();

  submitted = false;
  saveInProgress = false;
  errorMessage = '';
  isUsersLoading = false;
  usersSearchInput$ = new Subject<string>();
  currencyOptions: CurrencyView[] = [];
  liquidityProviderOptions: LiquidityProviderItem[] = LiquidityProviderList;
  usersOptions$: Observable<UserItem[]> = of([]);
  minUsersLengthTerm = 1;
  liquidityProviders: LiquidityProviderEntityItem[] = [];

  form = this.formBuilder.group({
  	fromCurrency: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	toCurrency: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	liquidityProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	rate: [0, { validators: [Validators.required, Validators.pattern(NUMBER_PATTERN)], updateOn: 'change' }],
  });

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private auth: AuthService,
  	private commonService: CommonDataService,
  	private adminService: AdminDataService) {

  }

  ngOnInit(): void {
  	this.loadCurrencies();
  	this.loadData();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  private loadData(): void {
  	if(this.pair){
  		if(this.pair.fromCurrency){
  			this.form.get('fromCurrency')?.setValue(this.pair.fromCurrency);
  		}
  		if(this.pair.toCurrency){
  			this.form.get('toCurrency')?.setValue(this.pair.toCurrency);
  		}
      
  		if(this.pair.fixedRate){
  			this.form.get('rate')?.setValue(this.pair.fixedRate);
  		}

  		if(this.pair.liquidityProviderName){
  			this.form.get('liquidityProvider')?.setValue(this.pair.liquidityProviderName.id);
  		}
  	}
  }

  private loadCurrencies(): void {
  	this.subscriptions.add(
  		this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
  			this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
  				const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
  				if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
  					this.currencyOptions = currencySettings.settingsCurrency.list?. map((val) => new CurrencyView(val)) as CurrencyView[];
  				} else {
  					this.currencyOptions = [];
  				}
  			}, (error) => {
  				this.errorMessage = error;
  			});
  		})
  	);
  }

  onSubmit(): void {
  	this.submitted = true;
  	if (this.form.valid) {
  		this.getLuqidityProviders();
  	}
  }

  private getLuqidityProviders(): void {
  	this.saveInProgress = true;
  	const listData$ = this.adminService.getLiquidityProviders().pipe(take(1));
  	this.subscriptions.add(
  		listData$.subscribe(({ list, count }) => {
  			this.liquidityProviders = list;
  			this.onSave();
  		}, (error) => {
  			if (this.auth.token === '') {
  				void this.router.navigateByUrl('/');
  			}
  		})
  	);
  }
  private onSave(): void {
  	const liquidityProvider = this.liquidityProviders.find(item => item.name?.id == this.form.get('liquidityProvider')?.value);
  	const rate = parseFloat(this.form.get('rate')?.value);
  	const requestData$ = this.adminService.createCurrencyPair(
  		this.form.get('fromCurrency')?.value,
  		this.form.get('toCurrency')?.value,
  		liquidityProvider?.liquidityProviderId ?? '',
  		rate
  	);
  	this.subscriptions.add(
  		requestData$.subscribe(({ data }) => {
  			this.saveInProgress = false;
  			this.save.emit();
  		}, (error) => {
  			this.saveInProgress = false;
  			this.errorMessage = error;
  			if (this.auth.token === '') {
  				void this.router.navigateByUrl('/');
  			}
  		})
  	);
  }
}
