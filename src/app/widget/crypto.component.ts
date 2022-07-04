import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShortListResult, LoginResult, PaymentInstrument, PaymentPreauthResultShort, Rate, TransactionShort, TransactionSource, TransactionType, UserMode, WidgetShort } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, PaymentProviderInstrumentView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { CommonDialogBox } from '../components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from '../model/cost-scheme.model';
import { PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings, WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from '../model/payment-base.model';
import { WalletItem } from '../model/wallet.model';
import { CommonDataService } from '../services/common-data.service';
import { EnvService } from '../services/env.service';
import { ProfileDataService } from '../services/profile.service';
import { WidgetPagerService } from '../services/widget-pager.service';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'app-crypto-widget',
  templateUrl: 'crypto.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class CryptoWidgetComponent implements OnInit {
  @Input() userParamsId = '';

  errorMessage = '';
  transactionErrorTitle = '';
  transactionErrorMessage = '';
  inProgress = false;
  initMessage = 'Loading...';
  address = '';
  summary = new CheckoutSummary();
  logoSrc = `${EnvService.image_host}/images/logo-color.png`;
  logoAlt = EnvService.product;

  private pSubscriptions: Subscription = new Subscription();

  constructor(
    private changeDetector: ChangeDetectorRef,
    public router: Router,
    public pager: WidgetPagerService,
    public auth: AuthService,
    private dataService: PaymentDataService,
    private profileService: ProfileDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.initMessage = 'Loading...';
    if (this.userParamsId === '') {
      this.showTransactionError('Loading error', 'Identifier is not set');
    } else {
      this.nextStage('order_details', 'Order details', 3);
    }
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  resetWizard(): void {
    this.inProgress = false;
    this.summary.reset();
    this.pager.init('', '');
    this.nextStage('order_details', 'Order details', 3);
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private nextStage(id: string, name: string, stepId: number): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.pager.nextStage(id, name, stepId, false);
      this.inProgress = false;
      this.changeDetector.detectChanges();
    }, 50);
  }

  orderDetailsComplete(data: CheckoutSummary): void {
    const amountFromTemp = (data.amountFrom) ? data.amountFrom?.toFixed(8) : undefined;
    this.summary.amountFrom = (amountFromTemp) ? parseFloat(amountFromTemp) : undefined;
    this.summary.email = data.email;

    this.address = this.userParamsId;
    this.nextStage('order_complete', 'Complete', 6);
  }
  
  private showTransactionError(messageTitle: string, messageText: string): void {
    this.transactionErrorMessage = messageText;
    this.transactionErrorTitle = messageTitle;
    this.nextStage('error', 'Error', 6);
  }
}
