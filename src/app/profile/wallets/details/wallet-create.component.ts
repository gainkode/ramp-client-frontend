import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShort, VaultAccount, WalletShort, WalletShortShortListResult } from 'model/generated-models';
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
    wallets: WalletShort[] = [];
    selectedWallet = '';
    wallet: WalletItem | undefined = undefined;
    selectedCurrency: CurrencyView | undefined = undefined;
    currencyInit = false;
    useExistingWallet = false;
    createForm = this.formBuilder.group({
    	currency: ['', { validators: [Validators.required], updateOn: 'change' }],
    	useExistingWallet: [false, { validators: [], updateOn: 'change' }],
    	existingWallet: ['', { validators: [], updateOn: 'change' }],
    	walletName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    walletNameErrorMessages: { [key: string]: string; } = {
    	['required']: 'Wallet name is required'
    };

    private subscriptions: Subscription = new Subscription();

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
    			this.selectedCurrency = this.cryptoList.find(x => x.symbol === val);
    			this.useExistingWalletField?.setValue(false);
    			this.useExistingWalletField?.updateValueAndValidity();
    			this.loadWallets();
    		}));
    	this.subscriptions.add(
    		this.useExistingWalletField?.valueChanges.subscribe(val => {
    			this.useExistingWallet = val;
    			if (this.useExistingWallet) {
    				this.existingWalletField?.setValidators([
    					Validators.required
    				]);
    				this.walletNameField?.setValidators([]);
    				this.walletNameField?.setValue('');
    			} else {
    				this.existingWalletField?.setValidators([]);
    				this.walletNameField?.setValidators([
    					Validators.required
    				]);
    			}
    			this.existingWalletField?.updateValueAndValidity();
    			this.walletNameField?.updateValueAndValidity();
    		}));
    	this.subscriptions.add(
    		this.existingWalletField?.valueChanges.subscribe(() => {
    			this.selectedWallet = this.wallets.find(x => x.walletId === this.existingWalletField?.value)?.name ?? '';
    		}));
    }

    private loadWallets() {
    	this.errorMessage = '';
    	this.inProgress = true;
    	this.wallets = [];
    	const walletsData$ = this.profileService.getMyExistingWallets(this.selectedCurrency.symbol).valueChanges.pipe(take(1));

    	this.subscriptions.add(
    		walletsData$.subscribe(({ data }) => {

    			const dataList = data.myExistingWallets as WalletShortShortListResult;
    			if (dataList !== null) {
    				const count = dataList?.count ?? 0;
    				if (count > 0) {
							this.useExistingWalletField?.setValue(true);
    					this.wallets = dataList?.list;
    				}
    		
    			}
    			this.inProgress = false;
    		}, (error) => {
    			this.inProgress = false;
    			if (this.auth.token !== '') {
    				this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load crypto wallets');
    			} else {
    				void this.router.navigateByUrl('/');
    			}
    		})
    	);
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

    get useExistingWalletField(): AbstractControl | null {
    	return this.createForm.get('useExistingWallet');
    }

    get existingWalletField(): AbstractControl | null {
    	return this.createForm.get('existingWallet');
    }

    copyAddress(): void {
    	if (this.wallet) {
    		this.clipboard.copy(this.wallet.address);
    	}
    }

    private createWallet(currency: string, walletName: string, existingWallet: string): void {
    	this.errorMessage = '';
    	this.inProgress = true;

    	this.subscriptions.add(
    		this.profileService.addMyVault(
    			currency,
    			walletName,
    			existingWallet).subscribe(({ data }) => {
    			this.inProgress = false;

    			if (data?.addMyVault) {
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

						this.complete(walletAddress !== '' ? ProfileItemActionType.Create : ProfileItemActionType.List);
    			}
    		}, (error) => {
    			this.inProgress = false;
    			if (this.auth.token !== '') {
    				this.errorMessage = this.errorHandler.getError(error.message, `Unable to create a new wallet`);
    			} else {
    				void this.router.navigateByUrl('/');
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
    		const ethOriginalId = this.wallets.find(x => x.walletId === this.existingWalletField?.value)?.walletId ?? '';
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
