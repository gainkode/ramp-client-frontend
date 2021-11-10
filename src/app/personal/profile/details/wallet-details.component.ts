import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from "@angular/core";
import { WalletItem } from "src/app/model/wallet.model";

@Component({
    selector: 'app-personal-wallet-details',
    templateUrl: './wallet-details.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss']
})
export class PersonalWalletDetailsComponent {
    @Input() wallet: WalletItem | undefined;

    constructor(private clipboard: Clipboard) { }

    copyAddress(): void {
        if (this.wallet) {
            this.clipboard.copy(this.wallet.address);
        }
    }

    editName(): void {

    }

    receiveStart(): void {

    }

    sendStart(): void {

    }

    deleteWallet(): void {

    }
}