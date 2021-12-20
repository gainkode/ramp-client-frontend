import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsKycShort, SettingsKycTier, SettingsKycTierListResult, TransactionSource, TransactionType } from 'src/app/model/generated-models';
import { KycLevel, KycLevelShort } from 'src/app/model/identification.model';
import { CheckoutSummary } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-widget-kyc',
  templateUrl: 'kyc.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetKycComponent implements OnInit, OnDestroy {
  @Input() errorMessage = '';
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Output() onError = new EventEmitter<string>();
  @Output() onAuthError = new EventEmitter();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  private pSubscriptions: Subscription = new Subscription();

  address = '';
  flow = '';
  showValidator = false;

  constructor(
    private auth: AuthService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    if (this.summary?.transactionType === TransactionType.Deposit && this.summary?.quoteLimit !== 0) {
      this.getTiers();
    } else {
      this.getSettings();
    }
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  private getSettings(): void {
    this.onError.emit('');
    this.showValidator = false;
    const settingsCommon = this.auth.getLocalSettingsCommon();
    const kycData = this.auth.getMyKycSettings();
    if (kycData === null) {
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else if (settingsCommon === null) {
      this.onError.emit('Unable to load common settings');
    } else {
      this.onProgress.emit(true);
      this.pSubscriptions.add(
        kycData.valueChanges.subscribe(
          ({ data }) => {
            const settingsKyc = data.mySettingsKyc as SettingsKycShort;
            const levels = settingsKyc.levels?.map((val) => new KycLevelShort(val)) as KycLevelShort[];
            if (levels.length > 0) {
              this.flow = levels[0].flowData.value;
            }
            this.address = settingsCommon.kycBaseAddress as string;
            this.onProgress.emit(false);
            this.showValidator = true;
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

  private getTiers(): void {
    this.onError.emit('');
    this.showValidator = false;
    const currency = this.summary?.currencyFrom ?? 'EUR';
    const amount = this.summary?.amountFrom ?? 0;
    const limit = this.summary?.quoteLimit ?? 0;
    const overLimit = amount - limit;
    const tiersData = this.dataService.getAppropriateSettingsKycTiers(overLimit, currency, TransactionSource.Widget, '');
    const settingsCommon = this.auth.getLocalSettingsCommon();
    if (tiersData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else if (settingsCommon === null) {
      this.onError.emit('Unable to load common settings');
    } else {
      this.onProgress.emit(true);
      this.pSubscriptions.add(
        tiersData.valueChanges.subscribe(({ data }) => {
          const tiers = data.getAppropriateSettingsKycTiers as SettingsKycTierListResult;
          if ((tiers.count ?? 0 > 0) && tiers.list) {
            const rawTiers = [...tiers.list];
            const sortedTiers = rawTiers.sort((a, b) => {
              let aa = a.amount ?? 0;
              let ba = b.amount ?? 0;
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
            this.flow = sortedTiers[0].level?.originalFlowName ?? '';
          }
          if (this.flow === '') {
            this.getSettings();
          } else {
            this.address = settingsCommon.kycBaseAddress as string;
            this.onProgress.emit(false);
            this.showValidator = true;
          }
        }, (error) => {
          this.onProgress.emit(false);
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.onAuthError.emit();
          } else {
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to get tiers'));
          }
        })
      );
    }
  }
}
