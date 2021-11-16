import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { ContactItem } from 'src/app/model/user.model';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-contact-details',
    templateUrl: './contact-details.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class PersonalContactDetailsComponent implements OnDestroy {
    @Input() contact: ContactItem | undefined;
    @Output() onError = new EventEmitter<string>();
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    editMode = false;
    deleteMode = false;
    inProgress = false;

    editForm = this.formBuilder.group({
        displayName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    private subscriptions: Subscription = new Subscription();

    constructor(
        private formBuilder: FormBuilder,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService) { }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get displayNameField(): AbstractControl | null {
        return this.editForm.get('displayName');
    }

    editName(): void {
        if (this.contact) {
            this.displayNameField?.setValue(this.contact.displayName);
        }
        this.editMode = true;
    }

    saveName(): void {
        const val = this.displayNameField?.value;
        if (val) {
            this.onError.emit('');
            this.inProgress = true;
            // this.subscriptions.add(
            //     this.profileService.updateMyVault(this.contact?.vault ?? '', val).subscribe(({ data }) => {
            //         if (data && data.updateMyVault) {
            //             const result = data.updateMyVault as UserVault;
            //             if (result.name) {
            //                 this.contact?.setName(result.name);
            //                 this.editMode = false;
            //             }
            //         }
            //         this.inProgress = false;
            //     }, (error) => {
            //         this.inProgress = false;
            //         this.onError.emit(this.errorHandler.getError(error.message, `Unable to change the wallet name`));
            //     })
            // );
        }
    }

    receiveStart(): void {
        console.log('receive');
    }

    sendStart(): void {
        console.log('send');
    }

    requestDeleteContact(): void {
        this.deleteMode = true;
    }

    deleteContact(): void {
        this.onError.emit('');
        this.inProgress = true;
        // this.subscriptions.add(
        //     this.profileService.deleteMyVault(this.contact?.vault ?? '').subscribe(({ data }) => {
        //         this.inProgress = false;
        //         console.log('delete wallet data', this.contact?.vault, data);
        //         if (data && data.deleteMyVault) {
        //             const item = new ProfileItemContainer();
        //             item.container = ProfileItemContainerType.Wallet;
        //             item.action = ProfileItemActionType.Create;
        //             item.wallet = new WalletItem(null, '');
        //             item.wallet.vault = this.contact?.vault ?? '';
        //             console.log('emit', item.wallet.vault);
        //             this.onComplete.emit(item);
        //         }
        //     }, (error) => {
        //         this.inProgress = false;
        //         this.onError.emit(this.errorHandler.getError(error.message, `Unable to remove the wallet`));
        //     })
        // );
    }

    cancelDelete(): void {
        this.deleteMode = false;
    }
}