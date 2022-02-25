import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetAddressShort, VaultAccount } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { WalletItem } from "src/app/model/wallet.model";
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-profile-wallet-create',
    templateUrl: './wallet-create.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class ProfileWalletCreateComponent implements OnInit, OnDestroy {
    @Input() cryptoList: CurrencyView[] = [];
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    completeMode = false;
    title = 'Add new wallet';
    errorMessage = '';
    inProgress = false;
    wallet: WalletItem | undefined = undefined;
    selectedCurrency: CurrencyView | undefined = undefined;
    currencyInit = false;
    createForm = this.formBuilder.group({
        currency: ['', { validators: [Validators.required], updateOn: 'change' }],
        walletName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    walletNameErrorMessages: { [key: string]: string; } = {
        ['required']: 'Wallet name is required'
    };

    private subscriptions: Subscription = new Subscription();

    constructor(
        private clipboard: Clipboard,
        private formBuilder: FormBuilder,
        private router: Router,
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService) { }

    ngOnInit(): void {
        this.subscriptions.add(
            this.currencyField?.valueChanges.subscribe(val => {
                this.currencyInit = true;
                this.selectedCurrency = this.cryptoList.find(x => x.id === val);
            }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get walletNameField(): AbstractControl | null {
        return this.createForm.get('walletName');
    }

    get currencyField(): AbstractControl | null {
        return this.createForm.get('currency');
    }

    copyAddress(): void {
        if (this.wallet) {
            this.clipboard.copy(this.wallet.address);
        }
    }

    private createWallet(currency: string, walletName: string): void {
        this.errorMessage = '';
        this.inProgress = true;
        this.subscriptions.add(
            this.profileService.addMyVault(currency, walletName).subscribe(({ data }) => {
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
                    const currencyItem = this.cryptoList.find(x => x.id === currency);
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
            this.createWallet(this.currencyField?.value, this.walletNameField?.value);
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