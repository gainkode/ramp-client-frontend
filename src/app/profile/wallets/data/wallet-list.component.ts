import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { WalletsFilter } from 'model/filter.model';
import { AssetAddressShort, AssetAddressShortListResult, UserState } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';
import { WalletItem } from 'model/wallet.model';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

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
    userAdditionalSettings: Record<string, any> = {};
    newWalletShow = true;

    constructor(
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	private commonService: CommonDataService,
    	private profileService: ProfileDataService,
    	private router: Router) {
    }

    load(val: WalletsFilter): void {
    	this.filter = val;
    	this.loadCommonSettings();
    	this.loadWallets();
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    private loadCommonSettings(){
    	const settingsCommon = this.auth.getLocalSettingsCommon();
    	if(settingsCommon){
    		this.userAdditionalSettings = typeof settingsCommon.userAdditionalSettings == 'string' ? JSON.parse(settingsCommon.userAdditionalSettings) : settingsCommon.userAdditionalSettings;
    		this.newWalletShow = this.userAdditionalSettings?.tabs?.wallets?.newWallet !== false;
    	}
    }
    private loadWallets(): void {
    	this.onError.emit('');
    	this.walletCount = 0;
    	this.wallets = [];
    	const walletsData$ = this.profileService.getMyWallets(this.filter.currencies).valueChanges.pipe(take(1));
    	this.loading = true;
    	this.onProgress.emit(true);
    	const currentUser = this.auth.user;
    	const userFiat = currentUser?.defaultFiatCurrency ?? 'EUR';
    	this.subscriptions.add(
    		walletsData$.subscribe(({ data }) => {
    			const dataList = data.myWallets as AssetAddressShortListResult;
    			if (dataList !== null) {
    				const cryptoWalletCount = dataList?.count ?? 0;
    				if (cryptoWalletCount > 0) {
    					this.wallets = dataList?.list?.filter(x => {
    						return (this.filter.zeroBalance) ? true : x.total ?? 0 > 0;
    					}).map((val) => new WalletItem(val, userFiat, this.getCurrency(val))) as WalletItem[];
    				}
    				this.walletCount = this.wallets.length;
    				this.loadFiatWallets();
    			} else {
    				this.onProgress.emit(false);
    				this.loading = false;
    			}
    		}, (error) => {
    			this.onProgress.emit(false);
    			this.loading = false;
    			if (this.auth.token !== '') {
    				this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load crypto wallets'));
    			} else {
    				this.router.navigateByUrl('/');
    			}
    		})
    	);
    }

    private loadFiatWallets(): void {
    	this.onProgress.emit(true);
    	const userFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
    	const walletData$ = this.commonService.myFiatVaults(this.filter.currencies).valueChanges.pipe(take(1));
    	this.subscriptions.add(
    		walletData$.subscribe(({ data }) => {
    			this.onProgress.emit(false);
    			const fiatVaults = data?.myFiatVaults?.list;
    			const fiatWalletCount = fiatVaults?.length ?? 0;
    			if (fiatWalletCount > 0) {
    				this.wallets = [
    					...fiatVaults?.filter(x => {
    						return (this.filter.zeroBalance) ? true : x.balance ?? 0 > 0;
    					}).map((val) => {
    						const wallet = new WalletItem(null, userFiat, undefined);
    						wallet.setFiat(val, userFiat);
    						return wallet;
    					}) as WalletItem[],
    					...this.wallets
    				];
    				this.walletCount += fiatWalletCount;
    			}
    			this.loading = false;
    			this.onProgress.emit(false);
    		}, (error) => {
    			this.loading = false;
    			this.onProgress.emit(false);
    			if (this.auth.token !== '') {
    				this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load fiat wallets'));
    			} else {
    				this.router.navigateByUrl('/');
    			}
    		})
    	);
    }

    private getCurrency(asset: AssetAddressShort): CurrencyView | undefined {
    	return this.cryptoCurrencies.find(x => x.symbol === asset.assetId);
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

    showWallet(item: WalletItem): void {
    	if (item) {
    		this.showDetailsPanel(item);
    	}
    }
}
