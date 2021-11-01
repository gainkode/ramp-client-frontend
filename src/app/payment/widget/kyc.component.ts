import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsKycShort } from 'src/app/model/generated-models';
import { KycLevelShort } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-widget-kyc',
  templateUrl: 'kyc.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetKycComponent implements OnInit, OnDestroy {
  @Input() errorMessage = '';
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
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.getSettings();
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
            console.log(this.flow, this.address);
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
}
