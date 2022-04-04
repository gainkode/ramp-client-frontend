import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { WalletsFilter } from 'src/app/model/filter.model';
import { AssetAddressShort, AssetAddressShortListResult } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-profile-wallet-list',
    templateUrl: './wallet-list.component.html',
    styleUrls: [
        '../../../../assets/menu.scss',
        '../../../../assets/button.scss',
        '../../../../assets/profile.scss',
        './wallet-list.component.scss'
    ]
})
export class ProfileWalletListComponent implements OnDestroy {
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
        const walletsData$ = this.profileService.getMyWallets(this.filter.currencies).valueChanges.pipe(take(1));
        this.loading = true;
        this.onProgress.emit(true);
        const currentUser = this.auth.user;
        const userFiat = currentUser?.defaultFiatCurrency ?? 'EUR';
        this.subscriptions.add(
            walletsData$.subscribe(({ data }) => {
                const dataList = data.myWallets as AssetAddressShortListResult;

                console.log(dataList);
                console.log(currentUser?.fiatvaults);

                if (dataList !== null) {
                    this.wallets = [];
                    const fiatVault = currentUser?.fiatvaults;
                    const fiatWalletCount = fiatVault?.length ?? 0;
                    if (fiatWalletCount > 0) {
                        this.wallets = [
                            ...this.wallets,
                            ...fiatVault?.filter(x => {
                                return (this.filter.zeroBalance) ? true : x.balance ?? 0 > 0;
                            }).map((val) => {
                                const wallet = new WalletItem(null, userFiat, undefined);
                                wallet.setFiat(val, userFiat);
                                return wallet;
                            }) as WalletItem[]
                        ];
                    }
                    const cryptoWalletCount = dataList?.count ?? 0;
                    if (cryptoWalletCount > 0) {
                        this.wallets = [
                            ...this.wallets,
                            ...dataList?.list?.filter(x => {
                                return (this.filter.zeroBalance) ? true : x.total ?? 0 > 0;
                            }).map((val) => new WalletItem(val, userFiat, this.getCurrency(val))) as WalletItem[]
                        ];
                    }
                    this.walletCount = this.wallets.length;
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
