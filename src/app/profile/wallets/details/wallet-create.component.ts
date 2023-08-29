import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShort, AssetAddressShortListResult, CurrencyBlockchain, VaultAccount } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';
import { WalletItem } from 'model/wallet.model';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-profile-wallet-create',
	templateUrl: './wallet-create.component.html',
	styleUrls: [
		'../../../../assets/menu.scss',
		'../../../../assets/details.scss',
		'../../../../assets/text-control.scss'
	]
})
export class ProfileWalletCreateComponent implements OnInit, OnDestroy {
    @Input() cryptoList: CurrencyView[] = [];
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    completeMode = false;
    title = 'Add new wallet';
    errorMessage = '';
    inProgress = false;
    wallets: WalletItem[] = [];
    ethReadyWallets: WalletItem[] = [];
    selectedEthWallet = '';
    wallet: WalletItem | undefined = undefined;
    selectedCurrency: CurrencyView | undefined = undefined;
    currencyInit = false;
    blockchainFlagDisabled = false;
		ethFlag = false;
		trxFlag = false;
    ethExisting = false;
    createForm = this.formBuilder.group({
    	currency: ['', { validators: [Validators.required], updateOn: 'change' }],
    	useExistingEthWallet: [false, { validators: [], updateOn: 'change' }],
    	ethWallet: ['', { validators: [], updateOn: 'change' }],
    	walletName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    walletNameErrorMessages: { [key: string]: string; } = {
    	['required']: 'Wallet name is required'
    };
    ethWalletErrorMessages: { [key: string]: string; } = {
    	['required']: 'Wallet address is required'
    };

    private subscriptions: Subscription = new Subscription();
    private walletsLoaded = false;

    constructor(
    	private clipboard: Clipboard,
    	private formBuilder: UntypedFormBuilder,
    	private router: Router,
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	private profileService: ProfileDataService) { }

    ngOnInit(): void {
    	this.subscriptions.add(
    		this.currencyField?.valueChanges.subscribe(val => {
    			this.currencyInit = true;
					this.ethFlag = this.selectedCurrency.currencyBlockchain === CurrencyBlockchain.Ethereum;
					this.trxFlag = this.selectedCurrency.currencyBlockchain === CurrencyBlockchain.Tron;
    			this.selectedCurrency = this.cryptoList.find(x => x.symbol === val);
    			this.useExistingEthWalletField?.setValue(false);
    			this.useExistingEthWalletField?.updateValueAndValidity();
    			this.ethExisting = false;
    			this.ethReadyWallets = [];
    			if (this.selectedCurrency.currencyBlockchain) {
    				this.blockchainFlagDisabled = true;
    				if (!this.walletsLoaded) {
    					this.loadWallets();
    				} else {
    					this.filterWallets();
    				}
    			}
    		}));
    	this.subscriptions.add(
    		this.useExistingEthWalletField?.valueChanges.subscribe(val => {
    			this.ethExisting = val;
    			if (this.ethExisting) {
    				this.ethWalletField?.setValidators([
    					Validators.required
    				]);
    				this.walletNameField?.setValidators([]);
    				this.walletNameField?.setValue('');
    			} else {
    				this.ethWalletField?.setValidators([]);
    				this.walletNameField?.setValidators([
    					Validators.required
    				]);
    			}
    			this.ethWalletField?.updateValueAndValidity();
    			this.walletNameField?.updateValueAndValidity();
    		}));
    	this.subscriptions.add(
    		this.ethWalletField?.valueChanges.subscribe(val => {
    			this.selectedEthWallet = this.ethReadyWallets.find(x => x.id === this.ethWalletField?.value)?.name ?? '';
    		}));
    }

    private loadWallets() {
    	this.errorMessage = '';
    	this.inProgress = true;
    	this.wallets = [];
    	const walletsData$ = this.profileService.getMyWallets([]).valueChanges.pipe(take(1));
    	const currentUser = this.auth.user;
    	const userFiat = currentUser?.defaultFiatCurrency ?? 'EUR';
    	this.subscriptions.add(
    		walletsData$.subscribe(({ data }) => {
    			const dataList = data.myWallets as AssetAddressShortListResult;
    			if (dataList !== null) {
    				const count = dataList?.count ?? 0;
    				if (count > 0) {
    					this.wallets = dataList?.list?.
    						map((val) => new WalletItem(val, userFiat, this.getCurrency(val))) as WalletItem[];
    				}
    				this.walletsLoaded = true;
    				this.filterWallets();
    			}
    			this.inProgress = false;
    		}, (error) => {
    			this.inProgress = false;
    			if (this.auth.token !== '') {
    				this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load crypto wallets');
    			} else {
    				this.router.navigateByUrl('/');
    			}
    		})
    	);
    }

    private filterWallets() {
    	this.ethReadyWallets = [];
    	const c = this.currencyField?.value as string;
    	let filterAsset = '';
    	if (this.ethFlag) {
    		filterAsset = 'ETH';
    	} else if (this.trxFlag) {
    		filterAsset = 'TRX';
    	}
    	this.wallets.forEach(val => {
    		if (val.asset.startsWith(filterAsset)) {
    			const check = this.wallets.find(x => x.vaultOriginalId === val.vaultOriginalId && x.asset === c);
    			if (!check) {
    				this.ethReadyWallets.push(val);
    			}
    		}
    	});
    	if (this.ethReadyWallets.length > 0) {
    		this.useExistingEthWalletField?.setValue(true);
    		this.ethWalletField?.setValue(this.ethReadyWallets[0].id);
    	}
    	this.blockchainFlagDisabled = false;
    }

    private getCurrency(asset: AssetAddressShort): CurrencyView | undefined {
    	return this.cryptoList.find(x => x.symbol === asset.assetId);
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    get currencyField(): AbstractControl | null {
    	return this.createForm.get('currency');
    }

    get walletNameField(): AbstractControl | null {
    	return this.createForm.get('walletName');
    }

    get useExistingEthWalletField(): AbstractControl | null {
    	return this.createForm.get('useExistingEthWallet');
    }

    get ethWalletField(): AbstractControl | null {
    	return this.createForm.get('ethWallet');
    }

    copyAddress(): void {
    	if (this.wallet) {
    		this.clipboard.copy(this.wallet.address);
    	}
    }

    private createWallet(currency: string, walletName: string, ethWallet: string): void {
    	this.errorMessage = '';
    	this.inProgress = true;
    	this.subscriptions.add(
    		this.profileService.addMyVault(
    			currency,
    			walletName,
    			ethWallet).subscribe(({ data }) => {
    			this.inProgress = false;
    			if (data && data.addMyVault) {
    				const result = data.addMyVault as VaultAccount;
    				let walletAddress = '';
    				result.assets?.forEach(x => {
    					x.addresses?.forEach(a => {
    						if (a.address && a.addressFormat?.toLowerCase() === 'LEGACY') {
    							walletAddress = a.address;
    						}
    					});
    				});
    				const walletData = {
    					address: walletAddress,
    					assetId: currency,
    					total: 0,
    					totalFiat: 0,
    					totalEur: 0,
    					vaultId: result.id,
    					vaultName: walletName
    				} as AssetAddressShort;
    				const currencyItem = this.cryptoList.find(x => x.symbol === currency);
    				this.wallet = new WalletItem(walletData, this.auth.user?.defaultFiatCurrency ?? 'EUR', currencyItem);
    				if (walletAddress != '') {
    					this.complete(ProfileItemActionType.Create);
    				} else {
    					this.complete(ProfileItemActionType.List);
    				}
    				// this.completeMode = true;
    				// this.title = 'New wallet created!';
    			}
    		}, (error) => {
    			this.inProgress = false;
    			if (this.auth.token !== '') {
    				this.errorMessage = this.errorHandler.getError(error.message, `Unable to create a new wallet`);
    			} else {
    				this.router.navigateByUrl('/');
    			}
    		})
    	);
    }

    submit(): void {
    	this.currencyInit = true;
    	if (this.walletNameField?.value === '') {
    		this.walletNameField?.setValue('');
    	}
    	if (this.createForm.valid) {
    		const ethOriginalId = this.ethReadyWallets.find(x => x.id === this.ethWalletField?.value)?.vaultOriginalId ?? '';
    		this.createWallet(this.currencyField?.value, this.walletNameField?.value, ethOriginalId);
    	}
    }

    complete(action: ProfileItemActionType): void {
    	const item = new ProfileItemContainer();
    	item.container = ProfileItemContainerType.Wallet;
    	item.action = action;
    	item.wallet = this.wallet;
    	this.onComplete.emit(item);
    }
}
