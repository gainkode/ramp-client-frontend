import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WalletsFilter } from 'src/app/model/filter.model';
import { AssetAddressShort, AssetAddressShortListResult } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-wallet-list',
    templateUrl: './wallet-list.component.html',
    styleUrls: [
        '../../../../assets/menu.scss',
        '../../../../assets/button.scss',
        '../../../../assets/profile.scss',
        './wallet-list.component.scss'
    ]
})
export class PersonalWalletListComponent implements OnDestroy {
    @Input() cryptoCurrencies: CurrencyView[] = [];
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();

    private subscriptions: Subscription = new Subscription();
    filter = new WalletsFilter();
    wallets: WalletItem[] = [];
    walletCount = 0;
    selectedWallet: WalletItem | null = null;
    loading = false;

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    load(val: WalletsFilter): void {
        this.filter = val;
        this.loadWallets();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private loadWallets(): void {
        this.onError.emit('');
        this.walletCount = 0;
        const walletsData = this.profileService.getMyWallets(this.filter.currencies);
        if (walletsData === null) {
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.loading = true;
            this.onProgress.emit(true);
            const userFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
            this.subscriptions.add(
                walletsData.valueChanges.subscribe(({ data }) => {
                    const dataList = data.myWallets as AssetAddressShortListResult;
                    if (dataList !== null) {
                        this.walletCount = dataList?.count as number;
                        if (this.walletCount > 0) {
                            this.wallets = dataList?.list?.filter(x => {
                                return (this.filter.zeroBalance) ? true : x.total ?? 0 > 0;
                            }).map((val) => new WalletItem(val, userFiat, this.getCurrency(val))) as WalletItem[];
                            this.walletCount = this.wallets.length;
                        }
                    }
                    this.onProgress.emit(false);
                    this.loading = false;
                }, (error) => {
                    this.onProgress.emit(false);
                    this.loading = false;
                    if (this.auth.token !== '') {
                        this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load wallets'));
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    private getCurrency(asset: AssetAddressShort): CurrencyView | undefined {
        return this.cryptoCurrencies.find(x => x.id === asset.assetId);
    }

    private showDetailsPanel(item: WalletItem | undefined): void {
        const c = new ProfileItemContainer();
        c.container = ProfileItemContainerType.Wallet;
        c.wallet = item;
        this.onShowDetails.emit(c);
    }

    newWallet(): void {
        this.showDetailsPanel(undefined);
    }

    showWallet(id: string): void {
        const item = this.wallets.find(x => x.id === id);
        if (item) {
            this.showDetailsPanel(item);
        }
    }
}
