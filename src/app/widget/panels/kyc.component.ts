import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { TransactionType, SettingsKycShort, TransactionSource, KycProvider, SettingsKycTierShortExListResult } from 'model/generated-models';
import { KycLevelShort } from 'model/identification.model';
import { CheckoutSummary } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';

@Component({
	selector: 'app-widget-kyc',
	templateUrl: 'kyc.component.html',
	styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetKycComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() errorMessage = '';
  @Input() levelName = '';
  @Input() completedWhenVerified = false;
  @Input() allowToPayIfKycFailed = false;
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() shuftiSubscribeResult: boolean | undefined = undefined;
  @Input() widgetId: string | undefined = undefined;
  @Output() onError = new EventEmitter<string>();
  @Output() onReject = new EventEmitter();
  @Output() onAuthError = new EventEmitter();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  private pSubscriptions: Subscription = new Subscription();
  rejectKyc = false;
  address = '';
  flow = '';
  showValidator = false;

  constructor(
  	private changeDetector: ChangeDetectorRef,
  	private auth: AuthService,
  	private dataService: PaymentDataService,
  	private errorHandler: ErrorService) { }

  ngAfterViewInit(): void {
  	if (this.summary?.transactionType === TransactionType.Buy && this.summary?.quoteLimit !== 0) {
  		this.getTiers();
  	} else {
  		this.getSettings();
  	}
  }

  ngOnInit(): void {
  	console.log(this.allowToPayIfKycFailed);
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }
  ngOnChanges(): void {
  	if(this.shuftiSubscribeResult == false){
  		this.handleReject();
  	}else if(this.shuftiSubscribeResult == true){
  		this.onNext.emit();
  	}
  	this.shuftiSubscribeResult = undefined;
  }
  handleReject(): void {
  	this.rejectKyc = true;
  }

  private getSettings(): void {
  	this.showValidator = false;
  	this.changeDetector.detectChanges();
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if (settingsCommon === null) {
  		this.onError.emit('Unable to load common settings');
  	} else {
  		this.address = settingsCommon.kycBaseAddress as string;
  		if (this.levelName !== '') {
  			this.flow = this.levelName;
  			this.showValidator = true;
  			this.changeDetector.detectChanges();
  		} else {
  			const kycData$ = this.auth.getMyKycSettings().valueChanges.pipe(take(1));
  			this.onProgress.emit(true);
  			this.pSubscriptions.add(
  				kycData$.subscribe(
  					({ data }) => {
  						const settingsKyc = data.mySettingsKyc as SettingsKycShort;
  						const levels = settingsKyc.levels?.map((val) => new KycLevelShort(val)) as KycLevelShort[];
  						if (levels.length > 0) {
  							this.flow = levels[0].levelData.value;
  						}
  						this.onProgress.emit(false);
  						this.showValidator = true;
  						this.changeDetector.detectChanges();
  					},
  					(error) => {
  						this.onProgress.emit(false);
  						if (this.auth.token !== '') {
  							if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
  								this.onAuthError.emit();
  							} else {
  								this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load settings'));
  							}
  						}
  					}
  				)
  			);
  		}
  	}
  }

  private getTiers(): void {
  	this.showValidator = false;
  	this.changeDetector.detectChanges();
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if (settingsCommon === null) {
  		this.onError.emit('Unable to load common settings');
  	} else {
  		this.address = settingsCommon.kycBaseAddress as string;
  		if (this.levelName !== '') {
  			this.flow = this.levelName;
  			this.showValidator = true;
  			this.changeDetector.detectChanges();
  		} else {
  			this.onProgress.emit(true);
  			const currency = this.summary?.currencyFrom ?? 'EUR';
  			const amount = this.summary?.amountFrom ?? 0;
  			const limit = this.summary?.quoteLimit ?? 0;
  			const overLimit = amount - limit;
  			const tiersData$ = this.dataService.getAppropriateSettingsKycTiers(
  				overLimit,
  				currency,
  				TransactionSource.Widget,
  				this.auth.user?.kycProvider as KycProvider ?? KycProvider.SumSub,
  				'').valueChanges.pipe(take(1));
  			this.pSubscriptions.add(
  				tiersData$.subscribe(({ data }) => {
  					const tiers = data.getAppropriateSettingsKycTiers as SettingsKycTierShortExListResult;
  					if ((tiers.count ?? 0 > 0) && tiers.list) {
  						const rawTiers = [...tiers.list];
  						const sortedTiers = rawTiers.sort((a, b) => {
  							const aa = a.amount ?? 0;
  							const ba = b.amount ?? 0;
  							if ((a.amount === undefined || a.amount === null) && b.amount) {
  								return 1;
  							}
  							if (a.amount && (b.amount === undefined || b.amount === null)) {
  								return -1;
  							}
  							if (!a.amount && b.amount) {
  								return 1;
  							}
  							if (a.amount && !b.amount) {
  								return -1;
  							}
  							if (aa > ba) {
  								return 1;
  							}
  							if (aa < ba) {
  								return -1;
  							}
  							return 0;
  						});
  						this.flow = sortedTiers[0].originalLevelName ?? '';
  					}
  					if (this.flow === '') {
  						this.getSettings();
  					} else {
  						this.onProgress.emit(false);
  						this.showValidator = true;
  						this.changeDetector.detectChanges();
  					}
  				}, (error) => {
  					this.onProgress.emit(false);
  					if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
  						this.onAuthError.emit();
  					} else {
  						this.onError.emit(this.errorHandler.getError(error.message, 'Unable to get verification levels'));
  					}
  				})
  			);
  		}
  	}
  }
}
