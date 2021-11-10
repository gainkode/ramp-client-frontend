import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WalletsFilter } from 'src/app/model/filter.model';
import { AssetAddressShortListResult } from 'src/app/model/generated-models';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-wallet-list',
    templateUrl: './wallet-list.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss', './wallet-list.component.scss']
})
export class PersonalWalletListComponent implements OnDestroy {
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
        //this.loadFakeWallets();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private loadWallets(): void {
        this.onError.emit('');
        this.walletCount = 0;
        const walletsData = this.profileService.getMyWallets();
        if (walletsData === null) {
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.loading = true;
            this.onProgress.emit(true);
            this.subscriptions.add(
                walletsData.valueChanges.subscribe(({ data }) => {
                    const dataList = data.myWallets as AssetAddressShortListResult;
                    if (dataList !== null) {
                        this.walletCount = dataList?.count as number;
                        if (this.walletCount > 0) {
                            console.log(dataList?.list);
                            this.wallets = dataList?.list?.map((val) => new WalletItem(val)) as WalletItem[];
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

    private loadFakeWallets(): void {
        this.walletCount = 3;
        this.wallets = [];
        
        this.wallets.push({
            address: 'address 1',
            addressFormat: 'BITCOIN',
            asset: 'BTC',
            name: 'Bitcoin HODL',
            total: 0.125471,
            totalFiat: '$25,000.00'
        } as WalletItem);

        this.wallets.push({
            address: 'address 2',
            addressFormat: 'BITCOIN',
            asset: 'BTC',
            name: 'Bitcoin HODL',
            total: 0.001615,
            totalFiat: '$5,000.00'
        } as WalletItem);
    }

    showDetailsPanel(item: WalletItem): void {
        const c = new ProfileItemContainer();
        c.container = ProfileItemContainerType.Wallet;
        c.wallet = item;
        this.onShowDetails.emit(c);
    }

    newWallet(): void {
        console.log('newWallet()');
    }
}
