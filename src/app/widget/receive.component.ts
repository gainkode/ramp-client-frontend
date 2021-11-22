import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AssetAddressShortListResult, SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { CurrencyView } from '../model/payment.model';
import { WalletItem } from '../model/wallet.model';
import { CommonDataService } from '../services/common-data.service';
import { ProfileDataService } from '../services/profile.service';

@Component({
  selector: 'app-receive-widget',
  templateUrl: 'receive.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class ReceiveWidgetComponent implements OnInit {
  errorMessage = '';
  inProgress = false;
  initState = true;
  stageId = 'order_details';
  title = 'Order details';
  step = 1;
  initMessage = 'Initialization...';
  userWallets: WalletItem[] = [];
  cryptoList: CurrencyView[] = [];
  readCommonSettings = false;

  private pSubscriptions: Subscription = new Subscription();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private auth: AuthService,
    private commonService: CommonDataService,
    private profileService: ProfileDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.initMessage = 'Initialization...';
    this.stageId = 'initialization';
    this.title = 'Initialization';
    this.loadUserWallets();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  loadUserWallets(): void {
    this.errorMessage = '';
    this.inProgress = true;
    const walletData = this.profileService.getMyWallets([]);
    if (walletData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.pSubscriptions.add(
        walletData.valueChanges.subscribe(({ data }) => {
          const dataList = data.myWallets as AssetAddressShortListResult;
          if (dataList !== null) {
            const walletCount = dataList?.count ?? 0;
            if (walletCount > 0) {
              this.userWallets = dataList?.list?.map((val) => new WalletItem(val, '', undefined)) as WalletItem[];
            }
          }
          this.loadCurrencyData();
        }, (error) => {
          this.inProgress = false;
          this.stageId = 'receive_details';
          this.title = 'Receive details';
        })
      );
    }
  }

  private loadCurrencyData(): void {
    this.cryptoList = [];
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.pSubscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          this.inProgress = false;
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
          if (currencySettings.settingsCurrency) {
            if (currencySettings.settingsCurrency.count ?? 0 > 0) {
              this.cryptoList = currencySettings.settingsCurrency.list?.
                filter(x => x.fiat === false).
                map((val) => new CurrencyView(val)) as CurrencyView[];
            }
          }
          this.stageId = 'receive_details';
          this.title = 'Receive details';
        }, (error) => {
          this.inProgress = false;
          this.stageId = 'receive_details';
          this.title = 'Receive details';
        })
      );
    }
  }
}
