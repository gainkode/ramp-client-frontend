import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { WalletItem } from "src/app/model/wallet.model";

@Component({
    selector: 'app-personal-wallet-details',
    templateUrl: './wallet-details.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss']
})
export class PersonalWalletDetailsComponent {
    @Input() wallet: WalletItem | undefined;

    editMode = false;
    deleteMode = false;

    editForm = this.formBuilder.group({
        walletName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    constructor(private clipboard: Clipboard, private formBuilder: FormBuilder) { }

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
            this.wallet?.setName(val);
            this.editMode = false;
        }
    }

    receiveStart(): void {

    }

    sendStart(): void {

    }

    deleteWallet(): void {

    }
}