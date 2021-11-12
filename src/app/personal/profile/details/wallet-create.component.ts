import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AssetAddressShort } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { WalletItem } from "src/app/model/wallet.model";
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-wallet-create',
    templateUrl: './wallet-create.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class PersonalWalletCreateComponent implements OnInit, OnDestroy {
    @Input() cryptoList: CurrencyView[] = [];
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    completeMode = false;
    title = 'Add new wallet';
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

    createWallet(): void {
        //     const val = this.walletNameField?.value;
        //     if (val) {
        //         this.onError.emit('');
        //         this.inProgress = true;
        //         this.subscriptions.add(
        //             this.profileService.updateMyVault(this.wallet?.vault ?? '', val).subscribe(({ data }) => {
        //                 console.log(data);
        //                 if (data && data.updateMyVault) {
        //                     const result = data.updateMyVault as UserVault;
        //                     if (result.name) {
        //                         this.wallet?.setName(result.name);
        //                         this.editMode = false;
        //                     }
        //                 }
        //                 this.inProgress = false;
        //             }, (error) => {
        //                 this.inProgress = false;
        //                 this.onError.emit(this.errorHandler.getError(error.message, `Unable to change notification status`));
        //             })
        //         );
        //     }
    }

    submit(): void {
        this.currencyInit = true;
        if (this.walletNameField?.value === '') {
            this.walletNameField?.setValue('');
        }
        if (this.createForm.valid) {
            this.completeMode = true;
            this.title = 'New wallet created!';
        }

        //this.createWallet();

        // temp
        // console.log('submit');
        // this.wallet = new WalletItem({
        //     assetId: 'BTC',
        //     address: 'kdlvmnre084jgepsvnr894336gedsvdsv',
        //     addressFormat: 'BITCOIN',
        //     total: 0,
        //     totalFiat: 0,
        //     vaultName: 'Bitcoin HODL'
        // } as AssetAddressShort, 'EUR');
        // temp
    }

    complete(): void {
        const item = new ProfileItemContainer();
        item.container = ProfileItemContainerType.Wallet;
        item.wallet = this.wallet;
        this.onComplete.emit(item);
    }
}