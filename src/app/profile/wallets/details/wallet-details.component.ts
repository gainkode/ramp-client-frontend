import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VaultAccount } from 'src/app/model/generated-models';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { WalletItem } from "src/app/model/wallet.model";
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-wallet-details',
    templateUrl: './wallet-details.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss']
})
export class PersonalWalletDetailsComponent implements OnDestroy {
    @Input() wallet: WalletItem | undefined;
    @Output() onError = new EventEmitter<string>();
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    editMode = false;
    deleteMode = false;
    inProgress = false;

    editForm = this.formBuilder.group({
        walletName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    private subscriptions: Subscription = new Subscription();

    constructor(
        private clipboard: Clipboard,
        private formBuilder: FormBuilder,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService) { }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get walletNameField(): AbstractControl | null {
        return this.editForm.get('walletName');
    }

    copyAddress(): void {
        if (this.wallet) {
            this.clipboard.copy(this.wallet.address);
        }
    }

    editName(): void {
        if (this.wallet) {
            this.walletNameField?.setValue(this.wallet.name);
        }
        this.editMode = true;
    }

    saveName(): void {
        const val = this.walletNameField?.value;
        if (val) {
            this.onError.emit('');
            this.inProgress = true;
            this.subscriptions.add(
                this.profileService.updateMyVault(this.wallet?.vault ?? '', val).subscribe(({ data }) => {
                    if (data && data.updateMyVault) {
                        const result = data.updateMyVault as VaultAccount;
                        if (result.name) {
                            this.wallet?.setName(result.name);
                            this.editMode = false;
                        }
                    }
                    this.inProgress = false;
                }, (error) => {
                    this.inProgress = false;
                    this.onError.emit(this.errorHandler.getError(error.message, `Unable to change the wallet name`));
                })
            );
        }
    }

    receiveStart(): void {
        const item = new ProfileItemContainer();
        item.container = ProfileItemContainerType.Wallet;
        item.action = ProfileItemActionType.Redirect;
        item.wallet = this.wallet;
        item.meta = 'receive';
        this.onComplete.emit(item);
    }

    sendStart(): void {
        const item = new ProfileItemContainer();
        item.container = ProfileItemContainerType.Wallet;
        item.action = ProfileItemActionType.Redirect;
        item.wallet = this.wallet;
        item.meta = 'send';
        this.onComplete.emit(item);
    }

    requestDeleteWallet(): void {
        this.deleteMode = true;
    }

    deleteWallet(): void {
        this.onError.emit('');
        this.inProgress = true;
        this.subscriptions.add(
            this.profileService.deleteMyVault(this.wallet?.vault ?? '').subscribe(({ data }) => {
                this.inProgress = false;
                if (data && data.deleteMyVault) {
                    const item = new ProfileItemContainer();
                    item.container = ProfileItemContainerType.Wallet;
                    item.action = ProfileItemActionType.Remove;
                    item.wallet = new WalletItem(null, '', undefined);
                    item.wallet.vault = this.wallet?.vault ?? '';
                    this.onComplete.emit(item);
                }
            }, (error) => {
                this.inProgress = false;
                this.onError.emit(this.errorHandler.getError(error.message, `Unable to remove the wallet`));
            })
        );
    }

    cancelDelete(): void {
        this.deleteMode = false;
    }
}