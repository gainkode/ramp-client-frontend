import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CheckoutSummary } from 'model/payment.model';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';

@Component({
	selector: 'app-widget-kyc',
	templateUrl: 'kyc.component.html',
	styleUrls: []
})
export class WidgetKycComponent implements AfterViewInit, OnChanges {
  @Input() errorMessage = '';
  @Input() levelName = '';
  @Input() completedWhenVerified = false;
  @Input() allowToPayIfKycFailed = false;
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() kycSubscribeResult: boolean | undefined = undefined;
  @Input() widgetId: string | undefined = undefined;
  @Output() onError = new EventEmitter<string>();
  @Output() onReject = new EventEmitter();
  @Output() onAuthError = new EventEmitter();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();
  rejectKyc = false;
  flow = '';
  showValidator = false;

  constructor(
  	private changeDetector: ChangeDetectorRef,
  	private auth: AuthService,
		private errorHandler: ErrorService) { }

  ngAfterViewInit(): void {
		this.getSettings();
  }

  ngOnChanges(): void {
  	if (this.kycSubscribeResult === false){
  		this.handleReject();
  	} else if (this.kycSubscribeResult){
  		this.onNext.emit();
  	}

  	this.kycSubscribeResult = undefined;
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
  		if (this.levelName !== '') {
  			this.flow = this.levelName;
  			this.showValidator = true;
  			this.changeDetector.detectChanges();
  		} else {
				this.onError.emit(this.errorHandler.getError('', 'Level name not found'));
  		}
  	}
  }
}