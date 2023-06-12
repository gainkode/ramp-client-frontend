import { Clipboard } from '@angular/cdk/clipboard';
import { E } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VaultAccount } from 'model/generated-models';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';
import { WalletItem } from "model/wallet.model";
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
    selector: 'app-profile-wallet-details',
    templateUrl: './wallet-details.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss']
})
export class ProfileWalletDetailsComponent implements OnDestroy {
    @Input() set wallet(val: WalletItem | undefined) {
        this.walletData = val;
        if(val?.address){
            let addressLength: number = val?.address.length;
            if(addressLength > 20){
                this.walletAddressShow = val?.address.replace(val?.address.substring(10, addressLength - 10), '...');
            }else{
                this.walletAddressShow = val?.address
            }
        }
        if (val?.crypto === true) {
            this.receiveButton = 'Receive';
            this.sendButton = 'Send';
        } else {
            this.receiveButton = 'Deposit';
            this.sendButton = 'Withdrawal';
        }
        this.walletTransactionLink = `${this.auth.getUserMainPage()}/transactions/${this.walletData?.address ?? ''}`;
    }
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    editMode = false;
    deleteMode = false;
    inProgress = false;
    errorMessage = '';
    receiveButton = '';
    sendButton = '';
    walletData: WalletItem | undefined = undefined;
    walletAddressShow: string = '';
    walletTransactionLink = '';

    editForm = this.formBuilder.group({
        walletName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    private subscriptions: Subscription = new Subscription();

    constructor(
        private clipboard: Clipboard,
        private formBuilder: UntypedFormBuilder,
        private errorHandler: ErrorService,
        private auth: AuthService,
        private profileService: ProfileDataService) {
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get walletNameField(): AbstractControl | null {
        return this.editForm.get('walletName');
    }

    copyAddress(): void {
        if (this.walletData) {
            this.clipboard.copy(this.walletData.address);
        }
    }

    editName(): void {
        if (this.walletData) {
            this.walletNameField?.setValue(this.walletData.name);
        }
        this.editMode = true;
    }

    saveName(): void {
        const val = this.walletNameField?.value;
        if (val) {
            this.errorMessage = '';
            this.inProgress = true;
            this.subscriptions.add(
                this.profileService.updateMyVault(this.walletData?.vault ?? '', val).subscribe(({ data }) => {
                    if (data && data.updateMyVault) {
                        const result = data.updateMyVault as VaultAccount;
                        if (result.name) {
                            this.walletData?.setName(result.name);
                            this.editMode = false;
                        }
                    } else {
                        this.errorMessage = 'Unable to change the wallet name';
                    }
                    this.inProgress = false;
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(error.message, `Unable to change the wallet name`);
                })
            );
        }
    }

    receiveStart(): void {
        const item = new ProfileItemContainer();
        item.container = ProfileItemContainerType.Wallet;
        item.action = ProfileItemActionType.Redirect;
        item.wallet = this.walletData;
        if (this.walletData?.crypto === true) {
            item.meta = 'receive';
        } else {
            item.meta = 'deposit';
        }
        this.onComplete.emit(item);
    }

    sendStart(): void {
        const item = new ProfileItemContainer();
        item.container = ProfileItemContainerType.Wallet;
        item.action = ProfileItemActionType.Redirect;
        item.wallet = this.walletData;
        if (this.walletData?.crypto === true) {
            item.meta = 'send';
        } else {
            item.meta = 'withdrawal';
        }
        this.onComplete.emit(item);
    }

    requestDeleteWallet(): void {
        this.deleteMode = true;
    }

    deleteWallet(): void {
        this.errorMessage = '';
        this.inProgress = true;
        this.subscriptions.add(
            this.profileService.deleteMyVault(this.walletData?.vault ?? '').subscribe(({ data }) => {
                this.inProgress = false;
                if (data && data.deleteMyVault) {
                    const item = new ProfileItemContainer();
                    item.container = ProfileItemContainerType.Wallet;
                    item.action = ProfileItemActionType.Remove;
                    item.wallet = new WalletItem(null, '', undefined);
                    item.wallet.vault = this.walletData?.vault ?? '';
                    this.onComplete.emit(item);
                }
            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, `Unable to remove the wallet`);
            })
        );
    }

    cancelDelete(): void {
        this.deleteMode = false;
    }
}