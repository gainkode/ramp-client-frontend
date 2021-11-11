import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserVault } from 'src/app/model/generated-models';
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
                    console.log(data);
                    if (data && data.updateMyVault) {
                        const result = data.updateMyVault as UserVault;
                        if (result.name) {
                            this.wallet?.setName(result.name);
                            this.editMode = false;
                        }
                    }
                    this.inProgress = false;
                }, (error) => {
                    this.inProgress = false;
                    this.onError.emit(this.errorHandler.getError(error.message, `Unable to change notification status`));
                })
            );
        }
    }

    receiveStart(): void {
        console.log('receive');
    }

    sendStart(): void {
        console.log('send');
    }

    requestDeleteWallet(): void {
        this.deleteMode = true;
    }

    deleteWallet(): void {
        console.log('delete wallet');
        this.deleteMode = false;
    }

    cancelDelete(): void {
        console.log('cancel delete wallet');
        this.deleteMode = false;
    }
}