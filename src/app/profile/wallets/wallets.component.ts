import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ProfileBaseFilter, WalletsFilter } from 'src/app/model/filter.model';
import { SettingsCurrencyWithDefaults, UserMode, UserType } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileWalletListComponent } from './data/wallet-list.component';

@Component({
    selector: 'app-profile-wallets',
    templateUrl: './wallets.component.html',
    styleUrls: ['../../../assets/profile.scss']
})
export class ProfileWalletsComponent implements OnInit, OnDestroy {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onShowError = new EventEmitter<string>();
    private dataListPanel!: ProfileWalletListComponent;
    @ViewChild('datalist') set dataList(panel: ProfileWalletListComponent) {
        if (panel) {
            this.dataListPanel = panel;
            this.dataListPanel.load(this.filter);
        }
    }

    inProgress = false;
    inProgressFilter = false;
    errorMessage = '';
    filter = new WalletsFilter();
    currencyList: CurrencyView[] = [];
    cryptoList: CurrencyView[] = [];

    private subscriptions: Subscription = new Subscription();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private commonService: CommonDataService,
        private errorHandler: ErrorService,
        private router: Router) {
        this.filter.setData({
            currencies: this.activeRoute.snapshot.params['currencies'],
            balance: this.activeRoute.snapshot.params['balance']
        });
    }

    ngOnInit(): void {
        this.loadCurrencyData();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    addWallet(wallet: WalletItem): void {
        if (this.dataListPanel) {
            this.dataListPanel.wallets.push(wallet);
        }
    }

    reload(): void {
        if (this.dataListPanel) {
            this.dataListPanel.load(this.filter);
        }
    }

    removeWallet(id: string): void {
        if (this.dataListPanel) {
            const index = this.dataListPanel.wallets.findIndex(x => x.vault === id);
            if (index >= 0) {
                this.dataListPanel.wallets.splice(index, 1);
            }
        }
    }

    private loadCurrencyData(): void {
        this.cryptoList = [];
        this.currencyList = [];
        this.inProgressFilter = true;
        const currencyData = this.commonService.getSettingsCurrency().valueChanges.pipe(take(1));
        this.subscriptions.add(
            currencyData.subscribe(({ data }) => {
                this.inProgressFilter = false;
                const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
                if (currencySettings.settingsCurrency) {
                    if (currencySettings.settingsCurrency.count ?? 0 > 0) {
                        this.cryptoList = currencySettings.settingsCurrency.list?.
                            filter(x => x.fiat === false).
                            map((val) => new CurrencyView(val)) as CurrencyView[];
                        this.currencyList = this.cryptoList.map(val => val);
                        if (this.auth.user?.type === UserType.Merchant) {
                            this.currencyList = [
                                ...this.cryptoList,
                                ...currencySettings.settingsCurrency.list?.
                                    filter(x => x.fiat === true).
                                    map((val) => new CurrencyView(val)) as CurrencyView[]];
                        }
                    }
                }
            }, (error) => {
                this.inProgressFilter = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load currency data');
                    this.onShowError.emit(this.errorMessage);
                } else {
                    this.router.navigateByUrl('/');
                }
            })
        );
    }

    onFilterUpdate(filter: ProfileBaseFilter): void {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([
                `${this.auth.getUserMainPage()}/wallets`,
                filter.getParameters()
            ])
        );
    }

    handleError(val: string): void {
        this.errorMessage = val;
        this.onShowError.emit(this.errorMessage);
        this.changeDetector.detectChanges();
    }

    progressChanged(visible: boolean): void {
        this.inProgress = visible;
        this.changeDetector.detectChanges();
    }

    showDetails(details: ProfileItemContainer): void {
        if (!details.wallet) {
            details.meta = this.cryptoList;
        }
        this.onShowDetails.emit(details);
    }
}
